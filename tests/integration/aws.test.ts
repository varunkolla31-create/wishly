import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Contract test against a real AWS account. Opt-in, because it writes:
 *
 *   AWS_TEST_WRITE=1 pnpm test:aws
 *
 * It creates records under a unique `test_<timestamp>` owner and deletes them
 * afterwards. Without the flag (or credentials) the suite reports as skipped,
 * so `pnpm test` and CI never touch live data.
 */
function loadEnvLocal(): Record<string, string> {
  const found: Record<string, string> = {};
  try {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!m) continue;
      const name = m[1];
      if (!name) continue;
      found[name] = (m[2] ?? "").trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local; fall back to the real environment.
  }
  return found;
}

const local = loadEnvLocal();
const pick = (name: string) => process.env[name] ?? local[name];

const enabled =
  process.env.AWS_TEST_WRITE === "1" &&
  Boolean(pick("AWS_REGION")) &&
  Boolean(pick("S3_BUCKET"));

describe.skipIf(!enabled)("AWS adapters (real account)", () => {
  const ownerId = `test_${Date.now()}`;
  let wishId = "";
  let repos: typeof import("@/lib/repos/index");

  beforeAll(async () => {
    process.env.DATA_ADAPTER = "dynamodb";
    process.env.MEDIA_ADAPTER = "s3";
    process.env.AWS_REGION = pick("AWS_REGION");
    process.env.S3_BUCKET = pick("S3_BUCKET");
    process.env.DYNAMODB_WISHES_TABLE =
      pick("DYNAMODB_WISHES_TABLE") ?? pick("DYNAMODB_TABLE") ?? "Wishes";
    process.env.DYNAMODB_CONTRIBUTIONS_TABLE =
      pick("DYNAMODB_CONTRIBUTIONS_TABLE") ?? "Contributions";
    process.env.DYNAMODB_REPLIES_TABLE =
      pick("DYNAMODB_REPLIES_TABLE") ?? "Replies";
    process.env.AWS_ACCESS_KEY_ID = pick("AWS_ACCESS_KEY_ID");
    process.env.AWS_SECRET_ACCESS_KEY = pick("AWS_SECRET_ACCESS_KEY");
    process.env.AWS_ENDPOINT_URL = pick("AWS_ENDPOINT_URL");
    process.env.AUTH_SECRET =
      process.env.AUTH_SECRET ?? "aws-contract-secret-value";
    process.env.WISH_UNLOCK_SECRET =
      process.env.WISH_UNLOCK_SECRET ?? "aws-contract-secret-value";

    repos = await import("@/lib/repos/index");
  });

  afterAll(async () => {
    if (wishId) {
      try {
        await repos.contributionRepo().deleteByWish(wishId);
        await repos.replyRepo().deleteByWish(wishId);
        await repos.wishRepo().delete(wishId);
      } catch {
        // Best effort: a leftover test_ row is harmless.
      }
    }

    for (const name of [
      "DATA_ADAPTER",
      "MEDIA_ADAPTER",
      "DYNAMODB_WISHES_TABLE",
      "DYNAMODB_CONTRIBUTIONS_TABLE",
      "DYNAMODB_REPLIES_TABLE",
      "AWS_ENDPOINT_URL",
    ]) {
      delete process.env[name];
    }
  });

  it("creates, reads and lists a wish", async () => {
    const wish = await repos.wishRepo().create({
      ownerId,
      category: "birthday",
      templateId: "clean-white",
      receiverName: "Contract",
    });
    wishId = wish.wishId;

    expect((await repos.wishRepo().getById(wishId))?.ownerId).toBe(ownerId);

    const listed = await repos.wishRepo().listByOwner(ownerId);
    expect(listed.some((item) => item.wishId === wishId)).toBe(true);
    expect(listed.every((item) => item.passwordHash === null)).toBe(true);
  });

  it("updates fields and returns the merged record", async () => {
    const updated = await repos.wishRepo().update(wishId, {
      title: "Contract title",
      message: "Contract message",
      mediaKeys: ["wishes/x/photo/a.png"],
    });

    expect(updated?.title).toBe("Contract title");
    expect(updated?.mediaKeys).toEqual(["wishes/x/photo/a.png"]);

    const fetched = await repos.wishRepo().getById(wishId);
    expect(fetched?.message).toBe("Contract message");
  });

  it("finds a wish by contributor token and drops it on revoke", async () => {
    const token = `T${Date.now()}`.padEnd(32, "x").slice(0, 32);

    await repos.wishRepo().update(wishId, {
      mode: "group",
      contributorToken: token,
      contributorTokenRevokedAt: null,
      status: "collecting",
    });
    expect(
      (await repos.wishRepo().getByContributorToken(token))?.wishId,
    ).toBe(wishId);

    await repos.wishRepo().update(wishId, {
      contributorToken: null,
      contributorTokenRevokedAt: new Date().toISOString(),
    });
    expect(await repos.wishRepo().getByContributorToken(token)).toBeNull();
  });

  it("increments views without moving updatedAt", async () => {
    const before = await repos.wishRepo().getById(wishId);
    await repos.wishRepo().incrementViews(wishId, 2);
    const after = await repos.wishRepo().getById(wishId);

    expect(after?.views).toBe((before?.views ?? 0) + 2);
    expect(after?.updatedAt).toBe(before?.updatedAt);
  });

  it("stores, orders and moderates contributions", async () => {
    const first = await repos.contributionRepo().create({
      wishId,
      contributorName: "Contract A",
      type: "text",
      text: "first",
    });
    const second = await repos.contributionRepo().create({
      wishId,
      contributorName: "Contract B",
      type: "text",
      text: "second",
    });

    expect(second.order).toBe(first.order + 1);

    await repos.contributionRepo().reorder(wishId, [
      second.contributionId,
      first.contributionId,
    ]);
    const ordered = await repos.contributionRepo().listByWish(wishId);
    expect(ordered[0]?.contributionId).toBe(second.contributionId);

    const approved = await repos.contributionRepo().updateStatus(
      wishId,
      first.contributionId,
      "approved",
    );
    expect(approved?.status).toBe("approved");
    expect(
      await repos.contributionRepo().listByWish(wishId, "approved"),
    ).toHaveLength(1);

    expect(
      await repos.contributionRepo().delete(wishId, second.contributionId),
    ).toBe(true);
  });

  it("stores replies and indexes them by owner", async () => {
    await repos.replyRepo().create({
      wishId,
      ownerId,
      message: "contract reply",
      emoji: "❤️",
    });

    expect(await repos.replyRepo().listByWish(wishId)).toHaveLength(1);
    expect(
      (await repos.replyRepo().listByOwner(ownerId)).some(
        (reply) => reply.wishId === wishId,
      ),
    ).toBe(true);
  });

  it("round-trips a presigned upload and read", async () => {
    const target = await repos.mediaStore().createUpload({
      wishId,
      kind: "photo",
      contentType: "image/png",
      size: 64,
    });

    const put = await fetch(target.uploadUrl, {
      method: target.method,
      headers: target.headers,
      body: Buffer.alloc(64),
    });
    expect(put.ok).toBe(true);

    const readUrl = await repos.mediaStore().createReadUrl(target.key);
    const got = await fetch(readUrl);
    expect(got.status).toBe(200);

    await repos.mediaStore().delete(target.key);
  });

  it("cascades deletes", async () => {
    await repos.contributionRepo().deleteByWish(wishId);
    await repos.replyRepo().deleteByWish(wishId);
    expect(await repos.wishRepo().delete(wishId)).toBe(true);

    expect(await repos.wishRepo().getById(wishId)).toBeNull();
    expect(await repos.contributionRepo().listByWish(wishId)).toEqual([]);
    expect(await repos.replyRepo().listByWish(wishId)).toEqual([]);
    wishId = "";
  });
});
