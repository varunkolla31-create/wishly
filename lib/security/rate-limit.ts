import "server-only";

/**
 * Sliding-window request counters for volume limits (music search, AI ideas,
 * uploads). These count successful calls too, so they are deliberately
 * best-effort and in-process: a limit that is occasionally per-instance is
 * fine for cost control. Credential guessing does NOT live here — see
 * `attempt-store-pg.ts`, which is shared and persistent.
 */

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterMs: number;
}

interface Window {
  count: number;
  startedAt: number;
}

const windows = new Map<string, Window>();

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitDecision {
  const existing = windows.get(key);

  if (!existing || now - existing.startedAt > windowMs) {
    windows.set(key, { count: 1, startedAt: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterMs: existing.startedAt + windowMs - now,
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

/** Test seam. */
export function resetRateLimiter(): void {
  windows.clear();
}
