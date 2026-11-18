import "server-only";
import type { Wish } from "@/lib/repos/types";
import {
  MAX_ANON_WISH_BYTES as ANON_BYTES,
  MAX_MEDIA_PER_ANON_WISH as ANON_FILES,
  MAX_MEDIA_PER_WISH as FILES,
  MAX_WISH_BYTES as BYTES,
} from "@/lib/media/limits";

/**
 * Per-wish ceilings, enforced before a presign is issued rather than after a
 * file has already landed in the bucket.
 *
 * The per-file limits in `media/validate.ts` stop one giant upload; these stop
 * a thousand small ones.
 */

export const MAX_MEDIA_PER_WISH = FILES;
export const MAX_MEDIA_PER_ANON_WISH = ANON_FILES;
export const MAX_WISH_BYTES = BYTES;
export const MAX_ANON_WISH_BYTES = ANON_BYTES;

export interface MediaQuota {
  maxFiles: number;
  maxBytes: number;
}

export function wishQuota(wish: Wish): MediaQuota {
  const anonymous = wish.ownerId.startsWith("anon:");
  return anonymous
    ? { maxFiles: MAX_MEDIA_PER_ANON_WISH, maxBytes: MAX_ANON_WISH_BYTES }
    : { maxFiles: MAX_MEDIA_PER_WISH, maxBytes: MAX_WISH_BYTES };
}

export type QuotaCheck = { ok: true } | { ok: false; reason: string };

/**
 * `additionalBytes` is what the caller is about to add. Existing usage is
 * counted from the keys already attached to the wish; object sizes are not
 * re-read, so a generous per-file cap keeps this honest without a HEAD per key.
 */
export function checkMediaQuota(
  wish: Wish,
  additionalBytes = 0,
): QuotaCheck {
  const quota = wishQuota(wish);

  if (wish.mediaKeys.length >= quota.maxFiles) {
    return {
      ok: false,
      reason: `A wish can hold ${quota.maxFiles} files. Remove one to add another.`,
    };
  }

  if (additionalBytes > quota.maxBytes) {
    return {
      ok: false,
      reason: `That file would take this wish past its ${Math.round(
        quota.maxBytes / (1024 * 1024),
      )}MB limit.`,
    };
  }

  return { ok: true };
}

/** The count cap that the confirm step can enforce once the key is attached. */
export function mediaCountExceeded(wish: Wish): boolean {
  return wish.mediaKeys.length >= wishQuota(wish).maxFiles;
}
