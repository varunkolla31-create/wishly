import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as contributorPresign } from "@/app/api/c/[token]/upload/presign/route";
import { POST as contribute } from "@/app/api/c/[token]/contribute/route";
import { PATCH as patchWish } from "@/app/api/wishes/[id]/route";
import {
  DELETE as removeContribution,
  PATCH as patchContribution,
} from "@/app/api/wishes/[id]/contributions/[contributionId]/route";
import { contributionRepo, wishRepo } from "@/lib/repos/index";
import { buildWishContent } from "@/lib/wishes/public";
import { canAcceptContributions } from "@/lib/wishes/contributor";
import { newContributorToken } from "@/lib/security/contributor-token";

function params<T extends Record<string, string>>(value: T) {
  return { params: Promise.resolve(value) };
}

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function patch(body: unknown): Request {
  return new Request("http://localhost/api", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("group mode", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-group-"));
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

  async function groupWish() {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "wedding-engagement",
      templateId: "golden-hour",
      receiverName: "Amma",
      mode: "group",
    });

    return wishRepo().update(wish.wishId, {
      contributorToken: newContributorToken(),
      status: "collecting",
    });
  }

  it("mints a contributor token and moves a draft into collecting", async () => {
    const wish = await wishRepo().create({
      ownerId: "dev_sender",
      category: "birthday",
      templateId: "clean-white",
    });

    const response = await patchWish(patch({ mode: "group" }), params({ id: wish.wishId }));
    expect(response.status).toBe(200);

    const stored = await wishRepo().getById(wish.wishId);
    expect(stored?.mode).toBe("group");
    expect(stored?.status).toBe("collecting");
    expect(stored?.contributorToken).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });

  it("clears the token when switching back to solo", async () => {
    const wish = await groupWish();

    await patchWish(patch({ mode: "solo" }), params({ id: wish.wishId! }));

    const stored = await wishRepo().getById(wish.wishId);
    expect(stored?.mode).toBe("solo");
    expect(stored?.status).toBe("draft");
    expect(stored?.contributorToken).toBeNull();
  });

  it("accepts a contribution through a valid token", async () => {
    const wish = await groupWish();

    const response = await contribute(
      post({ contributorName: "Ravi", type: "text", text: "With you both." }),
      params({ token: wish.contributorToken! }),
    );
    expect(response.status).toBe(201);

    const stored = await contributionRepo().listByWish(wish.wishId);
    expect(stored).toHaveLength(1);
    expect(stored[0]?.status).toBe("pending");
    expect(stored[0]?.contributorName).toBe("Ravi");
  });

  it("rejects a revoked or unknown token", async () => {
    const wish = await groupWish();
    const token = wish.contributorToken!;

    await wishRepo().update(wish.wishId, {
      contributorToken: null,
      contributorTokenRevokedAt: new Date().toISOString(),
    });

    const revoked = await contribute(
      post({ contributorName: "Ravi", type: "text", text: "Hello" }),
      params({ token }),
    );
    expect(revoked.status).toBe(404);

    const unknown = await contribute(
      post({ contributorName: "Ravi", type: "text", text: "Hello" }),
      params({ token: "a".repeat(32) }),
    );
    expect(unknown.status).toBe(404);
  });

  it("stops accepting once the wish is published", async () => {
    const wish = await groupWish();
    await wishRepo().update(wish.wishId, { status: "published" });

    const response = await contribute(
      post({ contributorName: "Ravi", type: "text", text: "Late" }),
      params({ token: wish.contributorToken! }),
    );
    expect(response.status).toBe(404);

    const stored = await wishRepo().getById(wish.wishId);
    expect(canAcceptContributions(stored!)).toBe(false);
  });

  it("scopes contributor uploads to the wish", async () => {
    const wish = await groupWish();

    const response = await contributorPresign(
      post({ kind: "photo", contentType: "image/png", size: 1024 }),
      params({ token: wish.contributorToken! }),
    );

    expect(response.status).toBe(201);
    const payload = (await response.json()) as {
      data: { key: string };
    };
    expect(payload.data.key.startsWith(`wishes/${wish.wishId}/photo/`)).toBe(
      true,
    );
  });

  it("refuses media keys belonging to another wish", async () => {
    const wish = await groupWish();

    const response = await contribute(
      post({
        contributorName: "Ravi",
        type: "photo",
        mediaKey: "wishes/someoneelse123/photo/object1.png",
      }),
      params({ token: wish.contributorToken! }),
    );
    expect(response.status).toBe(400);
  });

  it("only exposes approved contributions in the reveal content", async () => {
    const wish = await groupWish();

    const approved = await contributionRepo().create({
      wishId: wish.wishId,
      contributorName: "Ravi",
      type: "text",
      text: "Approved note",
      status: "approved",
    });
    await contributionRepo().create({
      wishId: wish.wishId,
      contributorName: "Pending",
      type: "text",
      text: "Pending note",
      status: "pending",
    });

    const content = await buildWishContent(wish);
    expect(content.contributions).toHaveLength(1);
    expect(content.contributions[0]?.contributionId).toBe(
      approved.contributionId,
    );
    expect(JSON.stringify(content)).not.toContain("Pending note");
  });

  it("moderates and removes contributions", async () => {
    const wish = await groupWish();
    const item = await contributionRepo().create({
      wishId: wish.wishId,
      contributorName: "Ravi",
      type: "text",
      text: "Hello",
    });

    const approved = await patchContribution(
      patch({ status: "approved" }),
      params({ id: wish.wishId, contributionId: item.contributionId }),
    );
    expect(approved.status).toBe(200);

    const stored = await contributionRepo().getById(
      wish.wishId,
      item.contributionId,
    );
    expect(stored?.status).toBe("approved");

    const removed = await removeContribution(
      new Request("http://localhost/api", { method: "DELETE" }),
      params({ id: wish.wishId, contributionId: item.contributionId }),
    );
    expect(removed.status).toBe(200);
    await expect(
      contributionRepo().getById(wish.wishId, item.contributionId),
    ).resolves.toBeNull();
  });

  it("refuses moderation on a wish owned by somebody else", async () => {
    const wish = await wishRepo().create({
      ownerId: "another_owner",
      category: "birthday",
      templateId: "clean-white",
      mode: "group",
    });
    const item = await contributionRepo().create({
      wishId: wish.wishId,
      contributorName: "Ravi",
      type: "text",
      text: "Hello",
    });

    const response = await patchContribution(
      patch({ status: "approved" }),
      params({ id: wish.wishId, contributionId: item.contributionId }),
    );
    expect(response.status).toBe(404);
  });
});
