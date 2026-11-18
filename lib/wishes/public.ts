import "server-only";
import { getOccasion } from "@/lib/catalog/occasions";
import { mediaKindFromKey } from "@/lib/media/validate";
import { mediaProxyUrl } from "@/lib/media/read-url";
import type { MediaItem } from "@/lib/media/types";
import type { MusicBinding } from "@/lib/music/types";
import { contributionRepo } from "@/lib/repos/index";
import type { ContributionType, Wish, WishGateMode } from "@/lib/repos/types";

export type LockState = "locked" | "counting_down";

export interface PublicWishMeta {
  id: string;
  receiverName: string;
  hint: string | null;
  templateId: string;
  category: string;
  tone: "fun" | "calm";
  lockState: LockState;
  unlockAt: string | null;
  gateMode: WishGateMode;
  hasPassword: boolean;
  quizQuestion: string | null;
  quizOptions: string[] | null;
  quizWrongToast: string | null;
}

export interface PublicContribution {
  contributionId: string;
  contributorName: string;
  type: ContributionType;
  text: string | null;
  media: MediaItem | null;
}

export interface PublicWishContent {
  id: string;
  receiverName: string;
  title: string;
  message: string;
  bonusNote: string | null;
  milestoneDate: string | null;
  milestoneLabel: string | null;
  secretScratchMessage: string | null;
  giftVoucherCode: string | null;
  reelTemplateId: string | null;
  templateId: string;
  category: string;
  musicId: string | null;
  music: MusicBinding | null;
  unlockAt: string | null;
  media: MediaItem[];
  contributions: PublicContribution[];
}

export function isPublished(wish: Wish): boolean {
  return wish.status === "published";
}

export function isUnlockTimeReached(wish: Wish, now = Date.now()): boolean {
  if (!wish.unlockAt) return true;
  const timestamp = Date.parse(wish.unlockAt);
  return Number.isNaN(timestamp) || timestamp <= now;
}

export function toPublicWishMeta(
  wish: Wish,
  now = Date.now(),
): PublicWishMeta {
  return {
    id: wish.wishId,
    receiverName: wish.receiverName,
    hint: wish.passwordHint,
    templateId: wish.templateId,
    category: wish.category,
    tone: getOccasion(wish.category)?.tone ?? "fun",
    lockState: isUnlockTimeReached(wish, now) ? "locked" : "counting_down",
    unlockAt: wish.unlockAt,
    gateMode: wish.gateMode ?? "password",
    hasPassword: wish.passwordHash !== null,
    quizQuestion: wish.quizQuestion,
    quizOptions: wish.quizOptions,
    quizWrongToast: wish.quizWrongToast,
  };
}

export async function buildWishContent(
  wish: Wish,
): Promise<PublicWishContent> {
  // Read URLs are minted here and only here, after the caller has already
  // proven the unlock session. They point at /api/media, which re-checks the
  // unlock cookie, so these strings are useless on their own.
  const version = wish.passwordVersion;
  const media = wish.mediaKeys.map((key) => ({
    key,
    url: mediaProxyUrl(key, version),
    kind: mediaKindFromKey(key) ?? "photo",
  }));

  const approved =
    wish.mode === "group"
      ? await contributionRepo().listByWish(wish.wishId, "approved")
      : [];

  const contributions = approved.map(
    (item): PublicContribution => ({
      contributionId: item.contributionId,
      contributorName: item.contributorName,
      type: item.type,
      text: item.text,
      media: item.mediaKey
        ? {
            key: item.mediaKey,
            url: mediaProxyUrl(item.mediaKey, version),
            kind: mediaKindFromKey(item.mediaKey) ?? "photo",
          }
        : null,
    }),
  );

  return {
    id: wish.wishId,
    receiverName: wish.receiverName,
    title: wish.title,
    message: wish.message,
    bonusNote: wish.bonusNote,
    milestoneDate: wish.milestoneDate,
    milestoneLabel: wish.milestoneLabel,
    secretScratchMessage: wish.secretScratchMessage,
    giftVoucherCode: wish.giftVoucherCode,
    reelTemplateId: wish.reelTemplateId,
    templateId: wish.templateId,
    category: wish.category,
    musicId: wish.musicId,
    music: wish.music,
    unlockAt: wish.unlockAt,
    media,
    contributions,
  };
}
