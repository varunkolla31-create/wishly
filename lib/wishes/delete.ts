import "server-only";
import {
  contributionRepo,
  mediaStore,
  replyRepo,
  wishRepo,
} from "@/lib/repos/index";
import type { Wish } from "@/lib/repos/types";

/**
 * Deletes a wish and everything attached to it. Media failures are reported
 * without blocking deletion — a missing object is already the desired state.
 */
export async function deleteWishCascade(wish: Wish): Promise<void> {
  const contributions = await contributionRepo().listByWish(wish.wishId);
  const mediaKeys = new Set(wish.mediaKeys);

  for (const contribution of contributions) {
    if (contribution.mediaKey) mediaKeys.add(contribution.mediaKey);
  }

  await contributionRepo().deleteByWish(wish.wishId);
  await replyRepo().deleteByWish(wish.wishId);
  await wishRepo().delete(wish.wishId);

  const store = mediaStore();
  await Promise.all(
    [...mediaKeys].map(async (key) => {
      try {
        await store.delete(key);
      } catch {
        console.error("[media] failed to delete one object during wish deletion");
      }
    }),
  );
}
