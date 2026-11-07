import type { Wish } from "@/lib/repos/types";

export type SenderWish = Omit<Wish, "passwordHash"> & {
  hasPassword: boolean;
};

/**
 * Explicit mapping so a future secret field cannot leak by accident.
 * The password hash never leaves the server; only its presence is exposed.
 */
export function toSenderWish(wish: Wish): SenderWish {
  return {
    wishId: wish.wishId,
    ownerId: wish.ownerId,
    mode: wish.mode,
    category: wish.category,
    templateId: wish.templateId,
    receiverName: wish.receiverName,
    title: wish.title,
    message: wish.message,
    mediaKeys: wish.mediaKeys,
    musicId: wish.musicId,
    passwordHint: wish.passwordHint,
    passwordVersion: wish.passwordVersion,
    unlockAt: wish.unlockAt,
    status: wish.status,
    contributorToken: wish.contributorToken,
    contributorTokenRevokedAt: wish.contributorTokenRevokedAt,
    views: wish.views,
    createdAt: wish.createdAt,
    updatedAt: wish.updatedAt,
    hasPassword: wish.passwordHash !== null,
  };
}
