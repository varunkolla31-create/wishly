import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as createWish } from "@/app/api/wishes/route";
import { DELETE as deleteWish } from "@/app/api/wishes/[id]/route";
import { POST as duplicateWish } from "@/app/api/wishes/[id]/duplicate/route";
import { replyRepo, wishRepo } from "@/lib/repos/index";
import type { Wish } from "@/lib/repos/types";

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
});
