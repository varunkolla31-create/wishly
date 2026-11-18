import "server-only";
import { env } from "@/lib/env";
import { wishRepo } from "@/lib/repos/index";
import type { NewWish, Wish } from "@/lib/repos/types";
import {
  hashManageToken,
  newManageToken,
} from "@/lib/security/manage-token";

/**
 * Anonymous wishes have no Clerk account behind them, so they carry three
 * extra things: an `anon:` owner id, a manage token shown once, and an expiry.
 */

export const ANON_OWNER_PREFIX = "anon:";

export function isAnonymousWish(wish: Wish): boolean {
  return wish.ownerId.startsWith(ANON_OWNER_PREFIX);
}

export function anonOwnerId(): string {
  return `${ANON_OWNER_PREFIX}${crypto.randomUUID()}`;
}

export function anonExpiryFromNow(now = Date.now()): string {
  const days = env().ANON_WISH_TTL_DAYS;
  return new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
}

export function isExpired(wish: Wish, now = Date.now()): boolean {
  if (!wish.expiresAt) return false;
  const timestamp = Date.parse(wish.expiresAt);
  return !Number.isNaN(timestamp) && timestamp <= now;
}

export interface CreatedAnonymousWish {
  wish: Wish;
  /** The only moment this value exists in plaintext. */
  manageToken: string;
}

/**
 * Creates the wish row for an anonymous creator. Media and content are filled
 * in afterwards by the existing draft routes, exactly as for a signed-in wish.
 */
export async function createAnonymousWish(
  input: Omit<NewWish, "ownerId">,
  now = Date.now(),
): Promise<CreatedAnonymousWish> {
  const manageToken = newManageToken();

  const created = await wishRepo().create({
    ...input,
    ownerId: anonOwnerId(),
  });

  const wish = await wishRepo().update(created.wishId, {
    manageTokenHash: hashManageToken(manageToken),
    expiresAt: anonExpiryFromNow(now),
  });

  if (!wish) {
    throw new Error("Anonymous wish creation returned no row.");
  }

  return { wish, manageToken };
}

/**
 * Resolves a raw manage token to its wish. Returns null for unknown tokens and
 * for wishes that have since expired, so a dead link reads as "not found".
 */
export async function wishByManageToken(
  token: string,
  now = Date.now(),
): Promise<Wish | null> {
  const wish = await wishRepo().getByManageTokenHash(hashManageToken(token));
  if (!wish) return null;
  if (isExpired(wish, now)) return null;
  return wish;
}
