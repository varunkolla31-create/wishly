import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HttpError } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { toSenderWish } from "@/lib/repos/dto";
import { wishRepo } from "@/lib/repos/index";

describe("wish ownership", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-own-"));
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

  it("returns a wish owned by the signed-in sender", async () => {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
    });

    const owned = await getOwnedWish(wish.wishId);
    expect(owned.wish.wishId).toBe(wish.wishId);
    expect(owned.sender.userId).toBe("dev_sender");
  });

  it("hides wishes owned by somebody else behind a 404", async () => {
    const wish = await wishRepo().create({
      ownerId: "another_owner",
      category: "birthday",
      templateId: "confetti-pop",
    });

    await expect(getOwnedWish(wish.wishId)).rejects.toMatchObject({
      status: 404,
    });
    await expect(getOwnedWish("missing")).rejects.toBeInstanceOf(HttpError);
  });

  it("never serializes the password hash", async () => {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "confetti-pop",
    });
    await wishRepo().update(wish.wishId, { passwordHash: "$argon2id$secret" });

    const stored = await wishRepo().getById(wish.wishId);
    expect(stored?.passwordHash).toBe("$argon2id$secret");
    if (!stored) throw new Error("Expected the wish to exist.");

    const dto = toSenderWish(stored);
    expect("passwordHash" in dto).toBe(false);
  });
});
