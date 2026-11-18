import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DELETE as deleteViaManage, GET as getViaManage } from "@/app/api/manage/[token]/route";
import { contributionRepo, replyRepo, wishRepo } from "@/lib/repos/index";
import {
  hashManageToken,
  isManageToken,
  manageTokenMatches,
  newManageToken,
} from "@/lib/security/manage-token";
import {
  anonOwnerId,
  createAnonymousWish,
  isAnonymousWish,
  isExpired,
  wishByManageToken,
} from "@/lib/wishes/anonymous";

function params(token: string) {
  return { params: Promise.resolve({ token }) };
}

function request(method: string): Request {
  return new Request("http://localhost/api/manage/x", { method });
}

describe("manage tokens", () => {
  it("generates 32-character URL-safe tokens", () => {
    const token = newManageToken();
    expect(token).toHaveLength(32);
    expect(isManageToken(token)).toBe(true);
  });

  it("rejects malformed tokens", () => {
    expect(isManageToken("short")).toBe(false);
    expect(isManageToken("a".repeat(31))).toBe(false);
    expect(isManageToken(`${"a".repeat(31)}!`)).toBe(false);
  });

  it("hashes deterministically and never returns the token", () => {
    const token = newManageToken();
    const hash = hashManageToken(token);

    expect(hash).toBe(hashManageToken(token));
    expect(hash).not.toContain(token);
    expect(hash).toHaveLength(64);
    expect(manageTokenMatches(token, hash)).toBe(true);
    expect(manageTokenMatches(newManageToken(), hash)).toBe(false);
  });

  it("produces a different token every time", () => {
    const seen = new Set(Array.from({ length: 20 }, () => newManageToken()));
    expect(seen.size).toBe(20);
  });
});

describe("anonymous wishes", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-anon-"));
    process.env.WISHLY_DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.WISHLY_DATA_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  it("creates a wish with an anon owner, a hashed token and an expiry", async () => {
    const { wish, manageToken } = await createAnonymousWish({
      category: "birthday",
      templateId: "confetti-pop",
    });

    expect(isAnonymousWish(wish)).toBe(true);
    expect(wish.ownerId.startsWith("anon:")).toBe(true);
    // The raw token must not be stored anywhere on the record.
    expect(JSON.stringify(wish)).not.toContain(manageToken);
    expect(wish.manageTokenHash).toBe(hashManageToken(manageToken));
    expect(wish.expiresAt).not.toBeNull();
  });

  it("resolves the wish from the raw token", async () => {
    const { wish, manageToken } = await createAnonymousWish({
      category: "birthday",
      templateId: "confetti-pop",
    });

    const found = await wishByManageToken(manageToken);
    expect(found?.wishId).toBe(wish.wishId);

    expect(await wishByManageToken(newManageToken())).toBeNull();
  });

  it("treats an expired wish as gone", async () => {
    const { wish, manageToken } = await createAnonymousWish(
      { category: "birthday", templateId: "confetti-pop" },
      Date.parse("2020-01-01T00:00:00.000Z"),
    );

    expect(isExpired(wish)).toBe(true);
    // Past its expiry the manage link stops resolving entirely.
    expect(await wishByManageToken(manageToken)).toBeNull();
  });

  it("does not expire a wish with no expiry (signed-in wishes)", async () => {
    const signedIn = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
    });

    expect(signedIn.expiresAt).toBeNull();
    expect(isExpired(signedIn)).toBe(false);
    expect(isAnonymousWish(signedIn)).toBe(false);
  });

  it("gives every anonymous wish its own owner id", () => {
    expect(anonOwnerId()).not.toBe(anonOwnerId());
  });
});

describe("manage route", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-manage-"));
    process.env.WISHLY_DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.WISHLY_DATA_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  it("returns status and share details for a valid token", async () => {
    const { wish, manageToken } = await createAnonymousWish({
      category: "birthday",
      templateId: "confetti-pop",
      receiverName: "Amma",
    });
    await wishRepo().update(wish.wishId, {
      message: "A letter",
      status: "published",
    });

    const response = await getViaManage(request("GET"), params(manageToken));
    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      data: { wishId: string; shareUrl: string; expiresAt: string | null };
    };
    expect(payload.data.wishId).toBe(wish.wishId);
    expect(payload.data.shareUrl).toContain(`/w/${wish.wishId}`);
    expect(payload.data.expiresAt).not.toBeNull();
  });

  it("404s for an unknown or malformed token", async () => {
    const unknown = await getViaManage(request("GET"), params(newManageToken()));
    expect(unknown.status).toBe(404);

    const malformed = await getViaManage(request("GET"), params("nope"));
    expect(malformed.status).toBe(404);
  });

  it("deletes the wish, its media, replies and contributions", async () => {
    const { wish, manageToken } = await createAnonymousWish({
      category: "birthday",
      templateId: "confetti-pop",
      receiverName: "Amma",
    });
    const mediaKey = `wishes/${wish.wishId}/photo/frame1.jpg`;
    await wishRepo().update(wish.wishId, {
      message: "A letter",
      mediaKeys: [mediaKey],
      status: "published",
    });

    await contributionRepo().create({
      wishId: wish.wishId,
      contributorName: "Ravi",
      type: "text",
      text: "Happy birthday!",
      status: "approved",
    });
    await replyRepo().create({
      wishId: wish.wishId,
      ownerId: "anon_replier",
      message: "Thank you",
      emoji: "💛",
    });

    const response = await deleteViaManage(request("DELETE"), params(manageToken));
    expect(response.status).toBe(200);

    expect(await wishRepo().getById(wish.wishId)).toBeNull();
    expect(await contributionRepo().listByWish(wish.wishId)).toHaveLength(0);
    expect(await replyRepo().listByWish(wish.wishId)).toHaveLength(0);

    // The manage link is dead afterwards.
    const after = await getViaManage(request("GET"), params(manageToken));
    expect(after.status).toBe(404);
  });

  it("refuses deletion through a token that no longer resolves", async () => {
    const response = await deleteViaManage(
      request("DELETE"),
      params(newManageToken()),
    );
    expect(response.status).toBe(404);
  });
});
