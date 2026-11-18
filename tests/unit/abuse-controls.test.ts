import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as createAnonymous } from "@/app/api/wishes/anonymous/route";
import { POST as presignAnonymous } from "@/app/api/wishes/anonymous/[token]/upload/presign/route";
import { POST as publishAnonymous } from "@/app/api/wishes/anonymous/[token]/publish/route";
import { POST as presignOwned } from "@/app/api/upload/presign/route";
import {
  MAX_ANON_WISH_BYTES,
  MAX_MEDIA_PER_ANON_WISH,
  checkMediaQuota,
  wishQuota,
} from "@/lib/media/quota";
import { wishRepo } from "@/lib/repos/index";
import { resetRateLimiter } from "@/lib/security/rate-limit";
import { createAnonymousWish } from "@/lib/wishes/anonymous";

function jsonRequest(body: unknown, ip: string): Request {
  return new Request("http://localhost/api/wishes/anonymous", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

function tokenParams(token: string) {
  return { params: Promise.resolve({ token }) };
}

function wishParams(wishId: string) {
  return { params: Promise.resolve({ id: wishId }) };
}

async function makeWish(mediaKeys: string[] = [], ownerId = "dev_sender") {
  const wish = await wishRepo().create({
    ownerId,
    category: "birthday",
    templateId: "confetti-pop",
  });
  return (await wishRepo().update(wish.wishId, { mediaKeys })) ?? wish;
}

describe("per-wish media quota", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-quota-"));
    process.env.WISHLY_DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.WISHLY_DATA_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  it("gives anonymous wishes a tighter ceiling than signed-in ones", async () => {
    const anon = await makeWish([], "anon:abc");
    const signedIn = await makeWish([], "dev_sender");

    expect(wishQuota(anon).maxFiles).toBe(MAX_MEDIA_PER_ANON_WISH);
    expect(wishQuota(signedIn).maxFiles).toBeGreaterThan(
      wishQuota(anon).maxFiles,
    );
    expect(wishQuota(anon).maxBytes).toBeLessThan(wishQuota(signedIn).maxBytes);
    expect(wishQuota(anon).maxBytes).toBe(MAX_ANON_WISH_BYTES);
  });

  it("refuses a file once the wish is full", async () => {
    const keys = Array.from(
      { length: MAX_MEDIA_PER_ANON_WISH },
      (_, index) => `wishes/w/photo/p${index}.jpg`,
    );
    const full = await makeWish(keys, "anon:abc");

    const quota = checkMediaQuota(full, 1024);
    expect(quota.ok).toBe(false);
    if (!quota.ok) {
      expect(quota.reason).toMatch(/can hold/i);
      expect(quota.reason).toContain(String(MAX_MEDIA_PER_ANON_WISH));
    }
  });

  it("refuses a single file over the total byte ceiling", async () => {
    const wish = await makeWish([], "anon:abc");
    const quota = checkMediaQuota(wish, MAX_ANON_WISH_BYTES + 1);
    expect(quota.ok).toBe(false);
    if (!quota.ok) expect(quota.reason).toMatch(/MB limit/i);
  });

  it("allows a file under both ceilings", async () => {
    const wish = await makeWish([], "anon:abc");
    expect(checkMediaQuota(wish, 1024).ok).toBe(true);
  });

  it("reports the cap through the owned presign route", async () => {
    const keys = Array.from(
      { length: 20 },
      (_, index) => `wishes/w/photo/p${index}.jpg`,
    );
    const wish = await makeWish(keys);

    const response = await presignOwned(
      new Request("http://localhost/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wishId: wish.wishId,
          kind: "photo",
          contentType: "image/jpeg",
          size: 1024,
        }),
      }),
    );

    expect(response.status).toBe(400);
    const payload = (await response.json()) as { error: { code: string } };
    expect(payload.error.code).toBe("quota_exceeded");
  });
});

describe("anonymous create limits", () => {
  let dir: string;

  beforeEach(async () => {
    resetRateLimiter();
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-abuse-"));
    process.env.WISHLY_DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.WISHLY_DATA_DIR;
    resetRateLimiter();
    await rm(dir, { recursive: true, force: true });
  });

  const body = {
    category: "birthday",
    templateId: "confetti-pop",
    message: "A letter",
    hint: null,
  };

  it("allows a handful of creations from one IP, then limits", async () => {
    const ip = "198.51.100.20";
    const statuses: number[] = [];

    for (let index = 0; index < 6; index += 1) {
      const response = await createAnonymous(jsonRequest(body, ip));
      statuses.push(response.status);
    }

    expect(statuses.slice(0, 5)).toEqual([201, 201, 201, 201, 201]);
    expect(statuses[5]).toBe(429);
  });

  it("does not limit a different IP", async () => {
    for (let index = 0; index < 5; index += 1) {
      await createAnonymous(jsonRequest(body, "198.51.100.21"));
    }

    const response = await createAnonymous(
      jsonRequest(body, "198.51.100.22"),
    );
    expect(response.status).toBe(201);
  });

  it("rejects an unsupported occasion", async () => {
    const response = await createAnonymous(
      jsonRequest({ ...body, category: "not-a-real-occasion" }, "198.51.100.23"),
    );
    expect(response.status).toBe(400);
  });

  it("refuses a weak password at publish time with a clear message", async () => {
    const { manageToken } = await createAnonymousWish({
      category: "birthday",
      templateId: "confetti-pop",
    });

    // The first step takes no password at all, so the real gate is publish.
    const response = await publishAnonymous(
      new Request("http://localhost/x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "A letter", password: "amma" }),
      }),
      tokenParams(manageToken),
    );

    expect(response.status).toBe(400);
    const payload = (await response.json()) as {
      error: { code: string; message: string };
    };
    expect(payload.error.code).toBe("weak_password");
    expect(payload.error.message).toMatch(/at least|easy to guess/i);
  });
});

describe("anonymous upload presign", () => {
  let dir: string;

  beforeEach(async () => {
    resetRateLimiter();
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-anon-upload-"));
    process.env.WISHLY_DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.WISHLY_DATA_DIR;
    resetRateLimiter();
    await rm(dir, { recursive: true, force: true });
  });

  function uploadRequest(size: number, ip = "203.0.113.77"): Request {
    return new Request("http://localhost/x", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({
        kind: "photo",
        contentType: "image/jpeg",
        size,
      }),
    });
  }

  it("issues a target for a valid token and caps the count", async () => {
    const { wish, manageToken } = await createAnonymousWish({
      category: "birthday",
      templateId: "confetti-pop",
    });

    const first = await presignAnonymous(
      uploadRequest(1024),
      tokenParams(manageToken),
    );
    expect(first.status).toBe(201);

    const keys = Array.from(
      { length: MAX_MEDIA_PER_ANON_WISH },
      (_, index) => `wishes/${wish.wishId}/photo/p${index}.jpg`,
    );
    await wishRepo().update(wish.wishId, { mediaKeys: keys });

    const blocked = await presignAnonymous(
      uploadRequest(1024),
      tokenParams(manageToken),
    );
    expect(blocked.status).toBe(400);
    const payload = (await blocked.json()) as { error: { code: string } };
    expect(payload.error.code).toBe("quota_exceeded");
  });

  it("404s an unknown token", async () => {
    const response = await presignAnonymous(
      uploadRequest(1024),
      tokenParams("abcdefghijklmnopqrstuvwxyz012345"),
    );
    expect(response.status).toBe(404);
  });

  it("rejects an unsupported content type", async () => {
    const { manageToken } = await createAnonymousWish({
      category: "birthday",
      templateId: "confetti-pop",
    });

    const response = await presignAnonymous(
      new Request("http://localhost/x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "photo",
          contentType: "application/x-msdownload",
          size: 1024,
        }),
      }),
      tokenParams(manageToken),
    );
    expect(response.status).toBe(400);
  });
});

describe("wish params helper", () => {
  it("builds the route context shape", async () => {
    const context = wishParams("wish_1");
    await expect(context.params).resolves.toEqual({ id: "wish_1" });
  });
});
