import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { customAlphabet } from "nanoid";

/**
 * Manage tokens for creators who published without signing in.
 *
 * The raw token exists only in the response that creates it and in the link the
 * creator saves. The database holds a SHA-256 of it, so a dump of the wishes
 * table cannot be replayed into someone's manage page.
 */

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const TOKEN_LENGTH = 32;

const generate = customAlphabet(ALPHABET, TOKEN_LENGTH);

export const MANAGE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32}$/;

export function newManageToken(): string {
  return generate();
}

export function isManageToken(value: string): boolean {
  return MANAGE_TOKEN_PATTERN.test(value);
}

/**
 * Deterministic so it can be used as a lookup key. A random per-row salt would
 * be better against precomputation, but a 32-character random token is not
 * guessable by hash walking, and a deterministic value keeps the query simple.
 */
export function hashManageToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Constant-time compare for callers that already hold a stored hash. */
export function manageTokenMatches(token: string, storedHash: string): boolean {
  const computed = Buffer.from(hashManageToken(token), "utf8");
  const stored = Buffer.from(storedHash, "utf8");
  if (computed.length !== stored.length) return false;
  return timingSafeEqual(computed, stored);
}

export function manageUrl(token: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/manage/${token}`;
}
