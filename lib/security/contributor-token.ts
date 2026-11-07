import "server-only";
import { timingSafeEqual } from "node:crypto";
import { customAlphabet } from "nanoid";

const TOKEN_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateToken = customAlphabet(TOKEN_ALPHABET, 32);

export const CONTRIBUTOR_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32}$/;

/**
 * Bearer secret for a group wish's contributor link. Anyone holding it can add
 * a contribution; the sender revokes it by clearing the stored token.
 */
export function newContributorToken(): string {
  return generateToken();
}

export function isContributorToken(value: string): boolean {
  return CONTRIBUTOR_TOKEN_PATTERN.test(value);
}

export function tokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
