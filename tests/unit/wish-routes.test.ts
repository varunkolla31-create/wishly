import { access, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as createWish } from "@/app/api/wishes/route";
import { DELETE as deleteWish, PATCH as patchWish } from "@/app/api/wishes/[id]/route";
import { POST as setPassword } from "@/app/api/wishes/[id]/password/route";
import { POST as publishWish } from "@/app/api/wishes/[id]/publish/route";
import { POST as duplicateWish } from "@/app/api/wishes/[id]/duplicate/route";
import { POST as presignUpload } from "@/app/api/upload/presign/route";
import { mediaFilePath } from "@/lib/media/storage";
import { replyRepo, wishRepo } from "@/lib/repos/index";
import type { Wish } from "@/lib/repos/types";
import { verifyPassword } from "@/lib/security/password";

interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
}

function jsonRequest(body: unknown = {}): Request {
  return new Request("http://localhost/api/wishes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

function request(method: string, body: unknown = {}): Request {
  return new Request("http://localhost/api", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("wish API routes", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-api-"));
    process.env.WISHLY_DATA_DIR = dir;
    process.env.AUTH_MODE = "dev";
    process.env.WISHLY_DEV_AUTH_BYPASS = "true";
  });

  afterEach(async () => {
    delete process.env.WISHLY_DATA_DIR;
    delete process.env.AUTH_MODE;
    delete process.env.WISHLY_DEV_AUTH_BYPASS;
    await rm(dir, { recursive: true, force: true });
  });

  it("creates a draft owned by the sender", async () => {
    const response = await createWish(jsonRequest({}));
    expect(response.status).toBe(201);

    const payload = (await response.json()) as ApiEnvelope<Record<string, unknown>>;
    expect(payload.ok).toBe(true);
    expect(payload.data.status).toBe("draft");
    expect(payload.data.ownerId).toBe("dev_sender");
    expect(payload.data).not.toHaveProperty("passwordHash");
  });

  it("rejects an unsupported occasion", async () => {
    const response = await createWish(
      jsonRequest({ category: "not-real", templateId: "clean-white" }),
    );
    expect(response.status).toBe(400);
  });

  it("duplicates content into a fresh draft without the password or media", async () => {
    const original = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
      title: "For Amma",
    });
    await wishRepo().update(original.wishId, {
      message: "A long letter",
      passwordHash: "$argon2id$secret",
      passwordHint: "A sweet",
      mediaKeys: ["wishes/x/photo/a.jpg"],
      status: "published",
    });

    const response = await duplicateWish(
      new Request("http://localhost", { method: "POST" }),
      params(original.wishId),
    );
    expect(response.status).toBe(201);

    const payload = (await response.json()) as ApiEnvelope<Wish>;
    expect(payload.data.wishId).not.toBe(original.wishId);
    expect(payload.data.title).toBe("For Amma (copy)");
    expect(payload.data.message).toBe("A long letter");
    expect(payload.data.status).toBe("draft");
    expect(payload.data.passwordHint).toBe("A sweet");
    expect(payload.data.mediaKeys).toEqual([]);
    expect(payload.data).not.toHaveProperty("passwordHash");
  });

  it("deletes a wish and its replies", async () => {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
    });
    await replyRepo().create({
      wishId: wish.wishId,
      ownerId: "dev_sender",
      message: "Thank you",
      emoji: "❤️",
    });

    const response = await deleteWish(
      new Request("http://localhost", { method: "DELETE" }),
      params(wish.wishId),
    );
    expect(response.status).toBe(200);

    await expect(wishRepo().getById(wish.wishId)).resolves.toBeNull();
    await expect(replyRepo().listByWish(wish.wishId)).resolves.toEqual([]);
  });

  it("refuses to delete a wish owned by somebody else", async () => {
    const wish = await wishRepo().create({
      ownerId: "another_owner",
      category: "birthday",
      templateId: "confetti-pop",
    });

    const response = await deleteWish(
      new Request("http://localhost", { method: "DELETE" }),
      params(wish.wishId),
    );

    expect(response.status).toBe(404);
    await expect(wishRepo().getById(wish.wishId)).resolves.not.toBeNull();
  });

  it("patches draft fields", async () => {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
    });

    const response = await patchWish(
      request("PATCH", {
        title: "For Amma",
        message: "A long letter",
        receiverName: "Amma",
        musicId: "warm-glow",
        unlockAt: "2026-12-01T18:30:00.000Z",
      }),
      params(wish.wishId),
    );

    expect(response.status).toBe(200);
    const stored = await wishRepo().getById(wish.wishId);
    expect(stored?.title).toBe("For Amma");
    expect(stored?.message).toBe("A long letter");
    expect(stored?.musicId).toBe("warm-glow");
    expect(stored?.unlockAt).toBe("2026-12-01T18:30:00.000Z");
  });

  it("rejects media keys that belong to another wish", async () => {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
    });

    const response = await patchWish(
      request("PATCH", {
        mediaKeys: [
          "wishes/aaaaaaaaaaaaaaaaaaaaa/photo/object123.jpg",
        ],
      }),
      params(wish.wishId),
    );

    expect(response.status).toBe(400);
  });

  it("deletes media removed from the draft", async () => {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
    });
    const key = `wishes/${wish.wishId}/photo/object123.jpg`;
    await wishRepo().update(wish.wishId, { mediaKeys: [key] });

    const filePath = mediaFilePath(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, "fake-image");

    const response = await patchWish(
      request("PATCH", { mediaKeys: [] }),
      params(wish.wishId),
    );

    expect(response.status).toBe(200);
    await expect(access(filePath)).rejects.toThrow();
  });

  it("hashes a new password and bumps the version", async () => {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
    });

    const response = await setPassword(
      request("POST", { password: "open sesame 42", hint: "A phrase" }),
      params(wish.wishId),
    );

    expect(response.status).toBe(200);
    const stored = await wishRepo().getById(wish.wishId);
    expect(stored?.passwordHash?.startsWith("$argon2id$")).toBe(true);
    expect(stored?.passwordHash).not.toContain("open sesame");
    expect(stored?.passwordHint).toBe("A phrase");
    expect(stored?.passwordVersion).toBe(2);
    await expect(
      verifyPassword(stored?.passwordHash ?? null, "open sesame 42"),
    ).resolves.toBe(true);
  });

  it("refuses to publish an incomplete wish", async () => {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
    });

    const missingReceiver = await publishWish(
      request("POST"),
      params(wish.wishId),
    );
    expect(missingReceiver.status).toBe(400);

    await wishRepo().update(wish.wishId, {
      receiverName: "Amma",
      message: "A letter",
    });
    const missingPassword = await publishWish(
      request("POST"),
      params(wish.wishId),
    );
    expect(missingPassword.status).toBe(400);
  });

  it("publishes a complete wish", async () => {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
    });
    await wishRepo().update(wish.wishId, {
      receiverName: "Amma",
      message: "A letter",
      passwordHash: "$argon2id$fake",
    });

    const response = await publishWish(
      request("POST"),
      params(wish.wishId),
    );
    expect(response.status).toBe(200);

    const payload = (await response.json()) as ApiEnvelope<Wish>;
    expect(payload.data.status).toBe("published");
    await expect(wishRepo().getById(wish.wishId)).resolves.toMatchObject({
      status: "published",
    });
  });

  it("issues local upload and read targets for an owned wish", async () => {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
    });

    const response = await presignUpload(
      request("POST", {
        wishId: wish.wishId,
        kind: "photo",
        contentType: "image/jpeg",
        size: 1024,
      }),
    );

    expect(response.status).toBe(201);
    const payload = (await response.json()) as ApiEnvelope<{
      key: string;
      uploadUrl: string;
      readUrl: string;
      method: string;
    }>;
    expect(payload.data.key.startsWith(`wishes/${wish.wishId}/photo/`)).toBe(
      true,
    );
    expect(payload.data.uploadUrl).toContain("/api/uploads/");
    expect(payload.data.readUrl).toContain("/api/media/");
    expect(payload.data.method).toBe("PUT");
  });
});
