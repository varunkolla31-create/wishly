import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { contributionRepo, replyRepo, wishRepo } from "@/lib/repos/index";

/** Reads DATABASE_URL from the environment, or .env.local when running locally. */
function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  try {
    const raw = readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = /^\s*DATABASE_URL\s*=\s*(.+)$/.exec(line);
      if (match?.[1]) return match[1].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local: treat as unconfigured.
  }

  return undefined;
}

const databaseUrl = resolveDatabaseUrl();

describe.skipIf(!databaseUrl)("Postgres/Neon adapter contract", () => {
  let wishId = "";
  const ownerId = `test_owner_${Date.now()}`;

  beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;
    process.env.DATA_ADAPTER = "postgres";
    // The schema must exist; `pnpm db:push` applies db/schema.sql.
    const { pool } = await import("@/lib/db/pg");
    await pool().query("SELECT 1");
  });

  afterAll(async () => {
    if (wishId) await wishRepo().delete(wishId);
    delete process.env.DATA_ADAPTER;
    const { pool } = await import("@/lib/db/pg");
    await pool().end();
  });

  it("creates and reads a wish with defaults", async () => {
    const wish = await wishRepo().create({
      ownerId,
      category: "birthday",
      templateId: "clean-white",
      receiverName: "Amma",
    });
    wishId = wish.wishId;

    expect(wish.mediaKeys).toEqual([]);
    expect(wish.passwordVersion).toBe(1);
    expect(wish.status).toBe("draft");
    expect(wish.musicId).toBeNull();
    expect(wish.views).toBe(0);

    const fetched = await wishRepo().getById(wishId);
    expect(fetched?.receiverName).toBe("Amma");
  });

  it("lists by owner newest-updated first and hides the password hash", async () => {
    await wishRepo().update(wishId, {
      title: "For Amma",
      message: "A letter",
      passwordHash: "$argon2id$fake",
    });

    const listed = await wishRepo().listByOwner(ownerId);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.title).toBe("For Amma");
    expect(listed[0]?.passwordHash).toBeNull();

    const fetched = await wishRepo().getById(wishId);
    expect(fetched?.passwordHash).toBe("$argon2id$fake");
  });

  it("round-trips every patchable field including arrays and dates", async () => {
    const unlockAt = "2026-12-01T18:30:00.000Z";
    const updated = await wishRepo().update(wishId, {
      mode: "group",
      mediaKeys: ["wishes/abc/photo/one.png", "wishes/abc/voice/two.webm"],
      musicId: "warm-glow",
      passwordHint: "A flower",
      passwordVersion: 2,
      unlockAt,
      status: "published",
    });

    expect(updated?.mode).toBe("group");
    expect(updated?.mediaKeys).toHaveLength(2);
    expect(updated?.musicId).toBe("warm-glow");
    expect(updated?.passwordVersion).toBe(2);
    expect(updated?.unlockAt).toBe(unlockAt);
    expect(updated?.status).toBe("published");
  });

  it("finds a wish by contributor token and drops it on revoke", async () => {
    const token = "A".repeat(32);
    await wishRepo().update(wishId, {
      contributorToken: token,
      contributorTokenRevokedAt: null,
    });

    expect((await wishRepo().getByContributorToken(token))?.wishId).toBe(wishId);

    await wishRepo().update(wishId, {
      contributorToken: null,
      contributorTokenRevokedAt: new Date().toISOString(),
    });

    expect(await wishRepo().getByContributorToken(token)).toBeNull();
  });

  it("increments views without touching updated_at", async () => {
    const before = await wishRepo().getById(wishId);
    await wishRepo().incrementViews(wishId, 3);
    const after = await wishRepo().getById(wishId);

    expect(after?.views).toBe((before?.views ?? 0) + 3);
    expect(after?.updatedAt).toBe(before?.updatedAt);
  });

  it("appends contributions in order, reorders and moderates them", async () => {
    const first = await contributionRepo().create({
      wishId,
      contributorName: "Ravi",
      type: "text",
      text: "First",
    });
    const second = await contributionRepo().create({
      wishId,
      contributorName: "Meera",
      type: "text",
      text: "Second",
    });

    expect(first.order).toBe(0);
    expect(second.order).toBe(1);
    expect(second.status).toBe("pending");

    await contributionRepo().reorder(wishId, [second.contributionId, first.contributionId]);
    const ordered = await contributionRepo().listByWish(wishId);
    expect(ordered[0]?.contributionId).toBe(second.contributionId);

    await contributionRepo().updateStatus(wishId, first.contributionId, "approved");
    const approved = await contributionRepo().listByWish(wishId, "approved");
    expect(approved).toHaveLength(1);
    expect(approved[0]?.contributionId).toBe(first.contributionId);

    expect(await contributionRepo().delete(wishId, second.contributionId)).toBe(true);
  });

  it("stores replies and indexes them by owner", async () => {
    await replyRepo().create({
      wishId,
      ownerId,
      message: "Thank you",
      emoji: "❤️",
    });

    expect(await replyRepo().listByWish(wishId)).toHaveLength(1);
    const byOwner = await replyRepo().listByOwner(ownerId);
    expect(byOwner.some((reply) => reply.wishId === wishId)).toBe(true);
  });

  it("cascades deletes for contributions and replies", async () => {
    await wishRepo().delete(wishId);

    expect(await wishRepo().getById(wishId)).toBeNull();
    expect(await contributionRepo().listByWish(wishId)).toEqual([]);
    expect(await replyRepo().listByWish(wishId)).toEqual([]);

    wishId = "";
  });
});
