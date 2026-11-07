import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  contributionRepo,
  replyRepo,
  wishRepo,
} from "@/lib/repos/index";

describe("file repositories", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-repo-"));
    process.env.WISHLY_DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.WISHLY_DATA_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  it("creates a draft with safe defaults", async () => {
    const wish = await wishRepo().create({
      ownerId: "owner_1",
      category: "birthday",
      templateId: "clean-white",
    });

    expect(wish.status).toBe("draft");
    expect(wish.mode).toBe("solo");
    expect(wish.passwordHash).toBeNull();
    expect(wish.views).toBe(0);
    expect(wish.wishId).toHaveLength(21);
    expect(wish.mediaKeys).toEqual([]);
  });

  it("updates fields but never identity fields", async () => {
    const created = await wishRepo().create({
      ownerId: "owner_1",
      category: "birthday",
      templateId: "clean-white",
    });

    const updated = await wishRepo().update(created.wishId, {
      title: "Happy birthday, Amma",
      status: "published",
    });

    expect(updated?.title).toBe("Happy birthday, Amma");
    expect(updated?.status).toBe("published");
    expect(updated?.ownerId).toBe("owner_1");
    expect(updated?.wishId).toBe(created.wishId);
  });

  it("returns null when updating a missing wish", async () => {
    await expect(
      wishRepo().update("missing", { title: "nope" }),
    ).resolves.toBeNull();
  });

  it("lists only the owner's wishes, most recently updated first", async () => {
    const mine = await wishRepo().create({
      ownerId: "owner_1",
      category: "birthday",
      templateId: "clean-white",
    });
    await wishRepo().create({
      ownerId: "owner_2",
      category: "wedding",
      templateId: "romantic-rose",
    });
    const newer = await wishRepo().create({
      ownerId: "owner_1",
      category: "thank-you",
      templateId: "soft-pastel",
    });

    const list = await wishRepo().listByOwner("owner_1");
    expect(list.map((wish) => wish.wishId)).toEqual([newer.wishId, mine.wishId]);
  });

  it("increments views without changing updatedAt", async () => {
    const created = await wishRepo().create({
      ownerId: "owner_1",
      category: "birthday",
      templateId: "clean-white",
    });

    await wishRepo().incrementViews(created.wishId);
    await wishRepo().incrementViews(created.wishId);

    const reloaded = await wishRepo().getById(created.wishId);
    expect(reloaded?.views).toBe(2);
    expect(reloaded?.updatedAt).toBe(created.updatedAt);
  });

  it("deletes a wish and its child records", async () => {
    const wish = await wishRepo().create({
      ownerId: "owner_1",
      category: "birthday",
      templateId: "clean-white",
    });

    await contributionRepo().create({
      wishId: wish.wishId,
      contributorName: "Priya",
      type: "text",
      text: "Happy birthday!",
    });
    await replyRepo().create({
      wishId: wish.wishId,
      ownerId: wish.ownerId,
      message: "Thank you!",
      emoji: "❤️",
    });

    await contributionRepo().deleteByWish(wish.wishId);
    await replyRepo().deleteByWish(wish.wishId);
    await expect(wishRepo().delete(wish.wishId)).resolves.toBe(true);

    await expect(wishRepo().getById(wish.wishId)).resolves.toBeNull();
    await expect(
      contributionRepo().listByWish(wish.wishId),
    ).resolves.toEqual([]);
    await expect(replyRepo().listByWish(wish.wishId)).resolves.toEqual([]);
  });

  it("orders contributions and filters by status", async () => {
    const wish = await wishRepo().create({
      ownerId: "owner_1",
      category: "wedding",
      templateId: "golden-hour",
    });

    const first = await contributionRepo().create({
      wishId: wish.wishId,
      contributorName: "Arun",
      type: "photo",
      mediaKey: "wishes/x/photo/a.jpg",
      status: "approved",
    });
    const second = await contributionRepo().create({
      wishId: wish.wishId,
      contributorName: "Meera",
      type: "text",
      text: "Wishing you both the world.",
      status: "pending",
    });

    expect(first.order).toBe(0);
    expect(second.order).toBe(1);

    await contributionRepo().reorder(wish.wishId, [
      second.contributionId,
      first.contributionId,
    ]);

    const approved = await contributionRepo().listByWish(
      wish.wishId,
      "approved",
    );
    expect(approved.map((item) => item.contributorName)).toEqual(["Arun"]);
  });
});
