import { describe, expect, it } from "vitest";
import type {
  ContributionRepo,
  ReplyRepo,
  WishRepo,
} from "@/lib/repos/types";

export interface ContractHarness {
  wishRepo: WishRepo;
  contributionRepo: ContributionRepo;
  replyRepo: ReplyRepo;
  /** Unique per run so adapters never collide. */
  ownerId: string;
}

/**
 * One suite, every adapter. If behaviour differs between file, Postgres and
 * DynamoDB, this fails — which is the point.
 */
export function wishlyContract(
  label: string,
  setup: () => Promise<ContractHarness>,
  teardown: (harness: ContractHarness) => Promise<void>,
): void {
  describe(`${label} contract`, () => {
    it("runs the whole repository contract", async () => {
      const h = await setup();
      const { wishRepo, contributionRepo, replyRepo, ownerId } = h;

      try {
        // ---- wishes --------------------------------------------------
        const wish = await wishRepo.create({
          ownerId,
          category: "birthday",
          templateId: "clean-white",
          receiverName: "Amma",
        });
        const wishId = wish.wishId;

        expect(wish.wishId).toMatch(/^[A-Za-z0-9_-]{21}$/);
        expect(wish.mode).toBe("solo");
        expect(wish.title).toBe("");
        expect(wish.message).toBe("");
        expect(wish.bonusNote).toBeNull();
        expect(wish.reelTemplateId).toBeNull();
        expect(wish.mediaKeys).toEqual([]);
        expect(wish.musicId).toBeNull();
        expect(wish.passwordHash).toBeNull();
        expect(wish.passwordVersion).toBe(1);
        expect(wish.unlockAt).toBeNull();
        expect(wish.status).toBe("draft");
        expect(wish.contributorToken).toBeNull();
        expect(wish.contributorTokenRevokedAt).toBeNull();
        expect(wish.views).toBe(0);

        const fetched = await wishRepo.getById(wishId);
        expect(fetched?.ownerId).toBe(ownerId);
        expect(fetched?.receiverName).toBe("Amma");

        expect(await wishRepo.getById("doesnotexist123456789")).toBeNull();

        // ---- update: every patchable field ---------------------------
        const unlockAt = "2026-12-01T18:30:00.000Z";
        const updated = await wishRepo.update(wishId, {
          mode: "group",
          category: "wedding-engagement",
          templateId: "golden-hour",
          receiverName: "Amma & Ravi",
          title: "Fifty years",
          message: "A letter",
          bonusNote: "Scratch: WISH-42",
          reelTemplateId: "3d-tunnel",
          mediaKeys: ["wishes/a/photo/one.png", "wishes/a/voice/two.webm"],
          musicId: "warm-glow",
          passwordHash: "$argon2id$fake",
          passwordHint: "A flower",
          passwordVersion: 2,
          unlockAt,
          status: "published",
        });

        expect(updated?.mode).toBe("group");
        expect(updated?.category).toBe("wedding-engagement");
        expect(updated?.templateId).toBe("golden-hour");
        expect(updated?.receiverName).toBe("Amma & Ravi");
        expect(updated?.title).toBe("Fifty years");
        expect(updated?.message).toBe("A letter");
        expect(updated?.bonusNote).toBe("Scratch: WISH-42");
        expect(updated?.reelTemplateId).toBe("3d-tunnel");
        expect(updated?.mediaKeys).toEqual([
          "wishes/a/photo/one.png",
          "wishes/a/voice/two.webm",
        ]);
        expect(updated?.musicId).toBe("warm-glow");
        expect(updated?.passwordHint).toBe("A flower");
        expect(updated?.passwordVersion).toBe(2);
        expect(updated?.unlockAt).toBe(unlockAt);
        expect(updated?.status).toBe("published");

        expect(await wishRepo.update("doesnotexist123456789", { title: "x" })).toBeNull();

        // ---- nulling a field clears it -------------------------------
        await wishRepo.update(wishId, { musicId: null, unlockAt: null, bonusNote: null, reelTemplateId: null });
        const cleared = await wishRepo.getById(wishId);
        expect(cleared?.musicId).toBeNull();
        expect(cleared?.unlockAt).toBeNull();
        expect(cleared?.bonusNote).toBeNull();
        expect(cleared?.reelTemplateId).toBeNull();

        // ---- list by owner: newest-updated first, no password hash ---
        const second = await wishRepo.create({
          ownerId,
          category: "birthday",
          templateId: "clean-white",
        });
        await wishRepo.update(second.wishId, { title: "Newest" });

        const listed = await wishRepo.listByOwner(ownerId);
        expect(listed.length).toBeGreaterThanOrEqual(2);
        expect(listed[0]?.wishId).toBe(second.wishId);
        expect(listed.every((item) => item.passwordHash === null)).toBe(true);
        expect(await wishRepo.listByOwner("someone_else")).toEqual([]);

        // ---- contributor token --------------------------------------
        const token = `T${Date.now()}`.padEnd(32, "x").slice(0, 32);
        await wishRepo.update(wishId, {
          contributorToken: token,
          contributorTokenRevokedAt: null,
        });
        expect((await wishRepo.getByContributorToken(token))?.wishId).toBe(wishId);

        await wishRepo.update(wishId, {
          contributorToken: null,
          contributorTokenRevokedAt: new Date().toISOString(),
        });
        expect(await wishRepo.getByContributorToken(token)).toBeNull();

        // ---- views increment without touching updatedAt --------------
        const before = await wishRepo.getById(wishId);
        await wishRepo.incrementViews(wishId, 3);
        const after = await wishRepo.getById(wishId);
        expect(after?.views).toBe((before?.views ?? 0) + 3);
        expect(after?.updatedAt).toBe(before?.updatedAt);

        // ---- contributions ------------------------------------------
        const first = await contributionRepo.create({
          wishId,
          contributorName: "Ravi",
          type: "text",
          text: "First",
        });
        const secondContribution = await contributionRepo.create({
          wishId,
          contributorName: "Meera",
          type: "text",
          text: "Second",
        });

        expect(first.order).toBe(0);
        expect(secondContribution.order).toBe(1);
        expect(secondContribution.status).toBe("pending");
        expect(secondContribution.type).toBe("text");
        expect(secondContribution.mediaKey).toBeNull();

        const ordered = await contributionRepo.listByWish(wishId);
        expect(ordered.map((item) => item.contributionId)).toEqual([
          first.contributionId,
          secondContribution.contributionId,
        ]);

        await contributionRepo.reorder(wishId, [
          secondContribution.contributionId,
          first.contributionId,
        ]);
        const reordered = await contributionRepo.listByWish(wishId);
        expect(reordered[0]?.contributionId).toBe(secondContribution.contributionId);
        expect(reordered[0]?.order).toBe(0);
        expect(reordered[1]?.order).toBe(1);

        const approved = await contributionRepo.updateStatus(
          wishId,
          first.contributionId,
          "approved",
        );
        expect(approved?.status).toBe("approved");
        expect(await contributionRepo.listByWish(wishId, "approved")).toHaveLength(1);
        expect(await contributionRepo.listByWish(wishId, "hidden")).toEqual([]);

        const hidden = await contributionRepo.updateStatus(
          wishId,
          first.contributionId,
          "hidden",
        );
        expect(hidden?.status).toBe("hidden");
        expect(await contributionRepo.listByWish(wishId, "approved")).toEqual([]);

        expect(
          await contributionRepo.updateStatus(wishId, "nope12345678901234", "approved"),
        ).toBeNull();

        expect(
          (await contributionRepo.getById(wishId, first.contributionId))?.status,
        ).toBe("hidden");

        expect(
          await contributionRepo.delete(wishId, secondContribution.contributionId),
        ).toBe(true);
        expect(
          await contributionRepo.delete(wishId, secondContribution.contributionId),
        ).toBe(false);

        // ---- replies ------------------------------------------------
        const replyFirst = await replyRepo.create({
          wishId,
          ownerId,
          message: "Thank you",
          emoji: "❤️",
        });
        const replySecond = await replyRepo.create({
          wishId,
          ownerId,
          message: "And again",
          emoji: "🎉",
        });

        const byWish = await replyRepo.listByWish(wishId);
        expect(byWish.map((item) => item.replyId)).toEqual([
          replyFirst.replyId,
          replySecond.replyId,
        ]);

        const byOwner = await replyRepo.listByOwner(ownerId);
        expect(byOwner.some((item) => item.replyId === replySecond.replyId)).toBe(true);
        expect(await replyRepo.listByOwner("someone_else")).toEqual([]);

        // ---- delete ------------------------------------------------
        // The app deletes children explicitly (lib/wishes/delete.ts), so a bare
        // wish delete is not required to cascade on every adapter. Postgres has
        // ON DELETE CASCADE as a safety net; the file adapter does not.
        await contributionRepo.deleteByWish(wishId);
        await replyRepo.deleteByWish(wishId);

        expect(await wishRepo.delete(wishId)).toBe(true);
        expect(await wishRepo.delete(wishId)).toBe(false);

        expect(await wishRepo.getById(wishId)).toBeNull();
        expect(await contributionRepo.listByWish(wishId)).toEqual([]);
        expect(await replyRepo.listByWish(wishId)).toEqual([]);
        expect(await replyRepo.listByOwner(ownerId)).toEqual([]);
        expect(await wishRepo.getByContributorToken("nope")).toBeNull();

        // ---- explicit deleteByWish also clears children -------------
        await contributionRepo.create({
          wishId: second.wishId,
          contributorName: "Cleanup",
          type: "text",
          text: "x",
        });
        await replyRepo.create({
          wishId: second.wishId,
          ownerId,
          message: "x",
          emoji: "💛",
        });
        await contributionRepo.deleteByWish(second.wishId);
        await replyRepo.deleteByWish(second.wishId);
        expect(await contributionRepo.listByWish(second.wishId)).toEqual([]);
        expect(await replyRepo.listByWish(second.wishId)).toEqual([]);
      } finally {
        await teardown(h);
      }
    });
  });
}
