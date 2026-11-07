import "server-only";
import { getOccasion } from "@/lib/catalog/occasions";
import { mediaKindFromKey } from "@/lib/media/validate";
import type { MediaItem } from "@/lib/media/types";
import { mediaStore } from "@/lib/repos/index";
import type { Wish } from "@/lib/repos/types";

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
}

export interface PublicWishContent {
  id: string;
  receiverName: string;
  title: string;
  message: string;
  templateId: string;
  category: string;
  musicId: string | null;
  unlockAt: string | null;
  media: MediaItem[];
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
  };
}

export async function buildWishContent(
  wish: Wish,
): Promise<PublicWishContent> {
  const store = mediaStore();
  const media = await Promise.all(
    wish.mediaKeys.map(async (key) => ({
      key,
      url: await store.createReadUrl(key),
      kind: mediaKindFromKey(key) ?? "photo",
    })),
  );

  return {
    id: wish.wishId,
    receiverName: wish.receiverName,
    title: wish.title,
    message: wish.message,
    templateId: wish.templateId,
    category: wish.category,
    musicId: wish.musicId,
    unlockAt: wish.unlockAt,
    media,
  };
}
