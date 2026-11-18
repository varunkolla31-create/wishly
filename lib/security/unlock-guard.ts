import "server-only";
import { createHmac } from "node:crypto";
import { env } from "@/lib/env";
import type { RateLimitDecision } from "@/lib/security/attempt-store";
import {
  checkAttempts,
  clearAttempts,
  recordAttemptFailure,
} from "@/lib/security/attempt-store-pg";

/**
 * Unlock attempt limits, in two dimensions at once:
 *
 *  - per wish: stops a distributed push against one page (many IPs, same wish);
 *  - per IP:   stops one client walking through many wishes.
 *
 * Both must allow the attempt. Only a salted hash of the IP is used as a key,
 * so the ledger never holds a raw address.
 */

/** Demo wishes are public by design; their passwords are printed on the page. */
const DEMO_PREFIX = "demo-";

/** Looser bucket for the permanent demos so a curious visitor is not locked out. */
export const DEMO_MAX_ATTEMPTS = 25;
export const DEMO_WINDOW_MS = 15 * 60 * 1000;

export interface UnlockGate {
  allowed: boolean;
  retryAfterMs: number;
  /** Keys to clear once the correct password arrives. */
  keys: string[];
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}

/**
 * Stable, non-reversible key for an address. `AUTH_SECRET` is already required
 * in production, so no separate salt needs to be provisioned.
 */
export function hashIp(ip: string): string {
  return createHmac("sha256", env().AUTH_SECRET).update(ip).digest("base64url");
}

export function isDemoWish(wishId: string): boolean {
  return wishId.startsWith(DEMO_PREFIX);
}

export function attemptKeys(wishId: string, ip: string): string[] {
  const ipHash = hashIp(ip);
  return [`${wishId}:${ipHash}`, `ip-scope:${ipHash}`];
}

function mostRestrictive(decisions: RateLimitDecision[]): RateLimitDecision {
  const blocked = decisions.filter((decision) => !decision.allowed);
  if (blocked.length === 0) return { allowed: true, retryAfterMs: 0 };
  return {
    allowed: false,
    retryAfterMs: Math.max(...blocked.map((decision) => decision.retryAfterMs)),
  };
}

export async function gateUnlock(
  wishId: string,
  ip: string,
  now = Date.now(),
): Promise<UnlockGate> {
  const keys = attemptKeys(wishId, ip);
  const decisions = await Promise.all(keys.map((key) => checkAttempts(key, now)));
  const decision = mostRestrictive(decisions);
  return { ...decision, keys };
}

export async function recordUnlockFailure(
  wishId: string,
  ip: string,
  now = Date.now(),
): Promise<UnlockGate> {
  const keys = attemptKeys(wishId, ip);

  if (isDemoWish(wishId)) {
    // Demos are client-side and need no server ledger; the browser already
    // throttles itself. Return an allow so the route never blocks a demo.
    return { allowed: true, retryAfterMs: 0, keys };
  }

  const decisions = await Promise.all(
    keys.map((key) => recordAttemptFailure(key, now)),
  );
  const decision = mostRestrictive(decisions);
  return { ...decision, keys };
}

export async function clearUnlockFailures(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => clearAttempts(key)));
}

/**
 * Volume limits for the endpoints an anonymous sender can reach without an
 * account. These count every call, not just failures.
 */
export const UNLOCK_VOLUME = 30;
export const UNLOCK_VOLUME_WINDOW_MS = 10 * 60 * 1000;
