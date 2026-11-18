/**
 * Per-wish media ceilings. Kept free of `server-only` because the manage page
 * and the wizard display them to the creator; enforcement lives in
 * `lib/media/quota.ts` on the server.
 */

export const MAX_MEDIA_PER_WISH = 20;

/** Anonymous creators get a tighter ceiling than signed-in senders. */
export const MAX_MEDIA_PER_ANON_WISH = 12;

/** Total bytes a single wish may store, across every kind. */
export const MAX_WISH_BYTES = 250 * 1024 * 1024;
export const MAX_ANON_WISH_BYTES = 120 * 1024 * 1024;
