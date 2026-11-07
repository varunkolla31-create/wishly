import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The R2 adapter is exercised against a fake S3 client: no network, no
 * credentials, and the constructor config is still asserted because that is
 * where the R2-vs-S3 differences live.
 */

let clientConfig: Record<string, unknown> | null = null;
const sent: { kind: string; input: Record<string, unknown> }[] = [];
const signed: {
  kind: string;
  input: Record<string, unknown>;
  options: { expiresIn?: number } | undefined;
}[] = [];

let headResult: Record<string, unknown> = {
  ContentLength: 1024,
  ContentType: "image/png",
};
let headError: unknown = null;

vi.mock("@aws-sdk/client-s3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aws-sdk/client-s3")>();

  class FakeS3Client {
    constructor(config: Record<string, unknown>) {
      clientConfig = config;
    }

    send = vi.fn(async (command: { constructor: { name: string }; input?: unknown }) => {
      const kind = command.constructor.name;
      sent.push({ kind, input: (command.input ?? {}) as Record<string, unknown> });
      if (kind === "HeadObjectCommand") {
        if (headError) throw headError;
        return headResult;
      }
      return {};
    });
  }

  return { ...actual, S3Client: FakeS3Client };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(
    async (
      _client: unknown,
      command: { constructor: { name: string }; input?: unknown },
      options?: { expiresIn?: number },
    ) => {
      signed.push({
        kind: command.constructor.name,
        input: (command.input ?? {}) as Record<string, unknown>,
        options,
      });
      return "https://acct.r2.cloudflarestorage.com/bucket/key?X-Amz-Signature=abc&x-amz-checksum-crc32=deadbeef&x-amz-sdk-checksum-algorithm=CRC32";
    },
  ),
}));

let store: import("@/lib/repos/r2/media-store").R2MediaStore;

beforeAll(async () => {
  process.env.MEDIA_DRIVER = "r2";
  process.env.R2_ACCOUNT_ID = "acct";
  process.env.R2_ACCESS_KEY_ID = "access";
  process.env.R2_SECRET_ACCESS_KEY = "secret";
  process.env.R2_BUCKET = "bucket";
  delete process.env.R2_ENDPOINT;

  const { R2MediaStore } = await import("@/lib/repos/r2/media-store");
  store = new R2MediaStore();
});

beforeEach(() => {
  sent.length = 0;
  signed.length = 0;
  headError = null;
  headResult = { ContentLength: 1024, ContentType: "image/png" };
});

describe("R2 client configuration", () => {
  it("uses region auto, path style, the derived endpoint and no default checksums", async () => {
    await store.createUpload({
      wishId: "wish12345678901234567",
      kind: "photo",
      contentType: "image/png",
      size: 1024,
    });

    expect(clientConfig).toMatchObject({
      region: "auto",
      forcePathStyle: true,
      endpoint: "https://acct.r2.cloudflarestorage.com",
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
    expect(clientConfig).not.toHaveProperty("bucket");
  });
});

describe("R2MediaStore.createUpload", () => {
  it("builds a kind-scoped key and signs a 10 minute PUT with the content type", async () => {
    const target = await store.createUpload({
      wishId: "wish12345678901234567",
      kind: "photo",
      contentType: "image/png",
      size: 1024,
    });

    expect(target.key).toMatch(
      /^wishes\/wish12345678901234567\/photo\/[A-Za-z0-9_-]{21}\.png$/,
    );
    expect(target.method).toBe("PUT");
    expect(target.headers).toEqual({ "Content-Type": "image/png" });

    expect(signed).toHaveLength(1);
    expect(signed[0]?.kind).toBe("PutObjectCommand");
    expect(signed[0]?.options?.expiresIn).toBe(600);
    expect(signed[0]?.input).toMatchObject({
      Bucket: "bucket",
      Key: target.key,
      ContentType: "image/png",
    });
    // Content-Length is deliberately not signed: browsers set it themselves.
    expect(signed[0]?.input).not.toHaveProperty("ContentLength");
  });

  it("strips checksum parameters from the signed URL", async () => {
    const target = await store.createUpload({
      wishId: "wish12345678901234567",
      kind: "voice",
      contentType: "audio/webm",
      size: 2048,
    });

    expect(target.uploadUrl).toContain("X-Amz-Signature=abc");
    expect(target.uploadUrl).not.toContain("x-amz-checksum");
    expect(target.uploadUrl).not.toContain("x-amz-sdk-checksum-algorithm");
    expect(target.key.endsWith(".weba")).toBe(true);
  });

  it("rejects an unsupported content type before signing", async () => {
    await expect(
      store.createUpload({
        wishId: "wish12345678901234567",
        kind: "photo",
        contentType: "application/pdf",
        size: 10,
      }),
    ).rejects.toThrow(/not supported/i);
    expect(signed).toHaveLength(0);
  });

  it("rejects a file over the size cap before signing", async () => {
    await expect(
      store.createUpload({
        wishId: "wish12345678901234567",
        kind: "photo",
        contentType: "image/png",
        size: 11 * 1024 * 1024,
      }),
    ).rejects.toThrow(/under 10MB/i);
    expect(signed).toHaveLength(0);
  });
});

describe("R2MediaStore.createReadUrl", () => {
  it("signs a 15 minute GET", async () => {
    const url = await store.createReadUrl(
      "wishes/wish12345678901234567/photo/abcdefghijklmnopqrstu.png",
    );

    expect(url).toContain("X-Amz-Signature");
    expect(signed[0]?.kind).toBe("GetObjectCommand");
    expect(signed[0]?.options?.expiresIn).toBe(900);
  });
});

describe("R2MediaStore.verifyUpload", () => {
  it("accepts an object whose size and type match its key", async () => {
    const result = await store.verifyUpload(
      "wishes/wish12345678901234567/photo/abcdefghijklmnopqrstu.png",
    );

    expect(result).toEqual({
      ok: true,
      size: 1024,
      contentType: "image/png",
    });
  });

  it("reports a missing object", async () => {
    headError = Object.assign(new Error("not found"), {
      name: "NotFound",
      $metadata: { httpStatusCode: 404 },
    });

    const result = await store.verifyUpload(
      "wishes/wish12345678901234567/photo/abcdefghijklmnopqrstu.png",
    );
    expect(result).toEqual({ ok: false, reason: "missing" });
  });

  it("rejects a type that does not match the key", async () => {
    headResult = { ContentLength: 1024, ContentType: "video/mp4" };
    const result = await store.verifyUpload(
      "wishes/wish12345678901234567/photo/abcdefghijklmnopqrstu.png",
    );
    expect(result).toEqual({ ok: false, reason: "type" });
  });

  it("rejects an oversized object", async () => {
    headResult = {
      ContentLength: 11 * 1024 * 1024,
      ContentType: "image/png",
    };
    const result = await store.verifyUpload(
      "wishes/wish12345678901234567/photo/abcdefghijklmnopqrstu.png",
    );
    expect(result).toEqual({ ok: false, reason: "size" });
  });

  it("rejects a traversal-shaped key without calling the store", async () => {
    const result = await store.verifyUpload("wishes/x/photo/../../etc/passwd");
    expect(result).toEqual({ ok: false, reason: "type" });
    expect(sent).toHaveLength(0);
  });
});

describe("R2MediaStore.delete", () => {
  it("issues DeleteObject for a valid key", async () => {
    await store.delete(
      "wishes/wish12345678901234567/photo/abcdefghijklmnopqrstu.png",
    );
    expect(sent).toHaveLength(1);
    expect(sent[0]?.kind).toBe("DeleteObjectCommand");
    expect(sent[0]?.input).toMatchObject({
      Bucket: "bucket",
      Key: "wishes/wish12345678901234567/photo/abcdefghijklmnopqrstu.png",
    });
  });

  it("refuses an invalid key", async () => {
    await expect(store.delete("../../etc/passwd")).rejects.toThrow(
      /invalid media key/i,
    );
    expect(sent).toHaveLength(0);
  });
});

describe("R2MediaStore ownership", () => {
  it("only ever builds keys under the requesting wish", async () => {
    const target = await store.createUpload({
      wishId: "wish12345678901234567",
      kind: "video",
      contentType: "video/mp4",
      size: 2048,
    });
    expect(target.key.startsWith("wishes/wish12345678901234567/")).toBe(true);
    expect(target.key).not.toContain("..");
  });
});
