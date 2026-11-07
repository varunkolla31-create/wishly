import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { wishRepo } from "@/lib/repos/index";
import {
  buildWishContent,
  isUnlockTimeReached,
  toPublicWishMeta,
} from "@/lib/wishes/public";

describe("public wish projection", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-public-"));
    process.env.WISHLY_DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.WISHLY_DATA_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  it("returns only lock-screen fields before unlock", async () => {
    const created = await wishRepo().create({
      ownerId: "owner_1",
      category: "birthday",
      templateId: "confetti-pop",
      receiverName: "Amma",
      title: "Happy birthday",
    });
    const updated = await wishRepo().update(created.wishId, {
      message: "A private letter",
      passwordHash: "$argon2id$secret",
      passwordHint: "A sweet",
      mediaKeys: [`wishes/${created.wishId}/photo/object123.jpg`],
      status: "published",
    });
    if (!updated) throw new Error("Expected the wish to exist.");

    const meta = toPublicWishMeta(updated);
    expect(Object.keys(meta).sort()).toEqual([
      "category",
      "hint",
      "id",
      "lockState",
      "receiverName",
      "templateId",
      "tone",
      "unlockAt",
    ]);

    const serialized = JSON.stringify(meta);
    expect(serialized).not.toContain("private letter");
    expect(serialized).not.toContain("passwordHash");
    expect(serialized).not.toContain("media");
    expect(meta.receiverName).toBe("Amma");
    expect(meta.hint).toBe("A sweet");
  });

  it("reports a countdown until the unlock time", async () => {
    const now = Date.parse("2026-06-01T12:00:00.000Z");
    const created = await wishRepo().create({
      ownerId: "owner_1",
      category: "birthday",
      templateId: "confetti-pop",
    });

    const future = await wishRepo().update(created.wishId, {
      unlockAt: "2026-06-02T12:00:00.000Z",
    });
    if (!future) throw new Error("Expected the wish to exist.");

    expect(toPublicWishMeta(future, now).lockState).toBe("counting_down");
    expect(isUnlockTimeReached(future, now)).toBe(false);

    const past = await wishRepo().update(created.wishId, {
      unlockAt: "2026-05-01T12:00:00.000Z",
    });
    if (!past) throw new Error("Expected the wish to exist.");

    expect(toPublicWishMeta(past, now).lockState).toBe("locked");
    expect(isUnlockTimeReached(past, now)).toBe(true);
  });

  it("returns content with short-lived media reads only when built", async () => {
    const created = await wishRepo().create({
      ownerId: "owner_1",
      category: "birthday",
      templateId: "confetti-pop",
      receiverName: "Amma",
    });
    const key = `wishes/${created.wishId}/photo/object123.jpg`;
    await wishRepo().update(created.wishId, {
      message: "A private letter",
      mediaKeys: [key],
      status: "published",
    });

    const stored = await wishRepo().getById(created.wishId);
    if (!stored) throw new Error("Expected the wish to exist.");

    const content = await buildWishContent(stored);
    expect(content.message).toBe("A private letter");
    expect(content.media).toHaveLength(1);
    expect(content.media[0]?.key).toBe(key);
    expect(content.media[0]?.url).toContain("/api/media/");
    expect(Object.keys(content)).not.toContain("passwordHash");
    expect(Object.keys(content)).not.toContain("ownerId");
  });
});
