import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { contributionRepo, mediaStore, replyRepo, wishRepo } from "@/lib/repos/index";

const ENDPOINT = process.env.AWS_ENDPOINT_URL;

/**
 * Probes the endpoint before deciding whether to run. When LocalStack is not
 * up, the suite reports as skipped rather than failing — so CI without Docker
 * stays green.
 */
async function endpointReachable(): Promise<boolean> {
  if (!ENDPOINT) return false;
  try {
    const response = await fetch(`${ENDPOINT}/_localstack/health`, {
      signal: AbortSignal.timeout(1500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

const reachable = await endpointReachable();

describe.skipIf(!reachable)("AWS adapter contract (LocalStack)", () => {
  let wishId = "";

  beforeAll(() => {
    process.env.DATA_ADAPTER = "dynamodb";
    process.env.MEDIA_ADAPTER = "s3";
    process.env.AWS_REGION = process.env.AWS_REGION ?? "us-east-1";
    process.env.DYNAMODB_TABLE = process.env.DYNAMODB_TABLE ?? "wishly";
    process.env.S3_BUCKET = process.env.S3_BUCKET ?? "wishly-media";
    process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? "test";
    process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? "test";
    process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "localstack-test-secret";
    process.env.WISH_UNLOCK_SECRET =
      process.env.WISH_UNLOCK_SECRET ?? "localstack-test-secret";
  });

  afterAll(async () => {
    delete process.env.DATA_ADAPTER;
    delete process.env.MEDIA_ADAPTER;
  });

  it("creates, reads and lists a wish", async () => {
    const wish = await wishRepo().create({
      ownerId: "aws_owner",
      category: "birthday",
      templateId: "clean-white",
    });
    wishId = wish.wishId;

    const fetched = await wishRepo().getById(wishId);
    expect(fetched?.wishId).toBe(wishId);

    const listed = await wishRepo().listByOwner("aws_owner");
    expect(listed.some((item) => item.wishId === wishId)).toBe(true);
  });

  it("updates fields and keeps the owner list index in sync", async () => {
    const updated = await wishRepo().update(wishId, {
      title: "For Amma",
      message: "A letter",
      status: "published",
    });

    expect(updated?.title).toBe("For Amma");
    expect(updated?.status).toBe("published");

    const fetched = await wishRepo().getById(wishId);
    expect(fetched?.message).toBe("A letter");
  });

  it("finds a wish by contributor token and drops it on revoke", async () => {
    const token = "A".repeat(32);
    await wishRepo().update(wishId, {
      mode: "group",
      contributorToken: token,
      contributorTokenRevokedAt: null,
      status: "collecting",
    });

    const found = await wishRepo().getByContributorToken(token);
    expect(found?.wishId).toBe(wishId);

    await wishRepo().update(wishId, {
      contributorToken: null,
      contributorTokenRevokedAt: new Date().toISOString(),
    });

    const afterRevoke = await wishRepo().getByContributorToken(token);
    expect(afterRevoke).toBeNull();
  });

  it("increments views without moving the wish", async () => {
    const before = await wishRepo().getById(wishId);
    await wishRepo().incrementViews(wishId, 3);
    const after = await wishRepo().getById(wishId);

    expect(after?.views).toBe((before?.views ?? 0) + 3);
    expect(after?.updatedAt).toBe(before?.updatedAt);
  });

  it("stores, orders and moderates contributions", async () => {
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

    expect(second.order).toBe(first.order + 1);

    await contributionRepo().reorder(wishId, [second.contributionId, first.contributionId]);
    const ordered = await contributionRepo().listByWish(wishId);
    expect(ordered[0]?.contributionId).toBe(second.contributionId);

    await contributionRepo().updateStatus(wishId, first.contributionId, "approved");
    const approved = await contributionRepo().listByWish(wishId, "approved");
    expect(approved).toHaveLength(1);

    expect(await contributionRepo().delete(wishId, second.contributionId)).toBe(true);
  });

  it("stores replies and indexes them by owner", async () => {
    await replyRepo().create({
      wishId,
      ownerId: "aws_owner",
      message: "Thank you",
      emoji: "❤️",
    });

    const byWish = await replyRepo().listByWish(wishId);
    expect(byWish).toHaveLength(1);

    const byOwner = await replyRepo().listByOwner("aws_owner");
    expect(byOwner.some((reply) => reply.wishId === wishId)).toBe(true);
  });

  it("presigns uploads and serves reads from S3", async () => {
    const target = await mediaStore().createUpload({
      wishId,
      kind: "photo",
      contentType: "image/png",
      size: 64,
    });

    expect(target.uploadUrl).toContain("X-Amz-Signature");

    const s3 = new S3Client({
      endpoint: ENDPOINT,
      region: process.env.AWS_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
      },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: target.key,
        Body: Buffer.alloc(64),
        ContentType: "image/png",
      }),
    );

    const head = await s3.send(
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: target.key }),
    );
    expect(head.$metadata.httpStatusCode).toBe(200);

    const readUrl = await mediaStore().createReadUrl(target.key);
    expect(readUrl).toContain("X-Amz-Signature");

    await s3.send(
      new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: target.key }),
    );
    await mediaStore().delete(target.key);
  });

  it("cascades deletes for contributions and replies", async () => {
    await contributionRepo().deleteByWish(wishId);
    await replyRepo().deleteByWish(wishId);
    await wishRepo().delete(wishId);

    expect(await wishRepo().getById(wishId)).toBeNull();
    expect(await contributionRepo().listByWish(wishId)).toEqual([]);
    expect(await replyRepo().listByWish(wishId)).toEqual([]);
  });
});
