import "server-only";

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterMs: number;
}

interface Entry {
  failures: number;
  windowStart: number;
  lockedUntil: number;
  strikes: number;
}

export const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BASE_COOLDOWN_MS = 60 * 1000;
const MAX_COOLDOWN_MS = 15 * 60 * 1000;
const SWEEP_THRESHOLD = 5000;

/**
 * In-process attempt ledger. Single-instance only — M5 moves this to a shared
 * store (DynamoDB/Redis) when the app runs across multiple instances.
 */
const entries = new Map<string, Entry>();

function sweep(now: number) {
  if (entries.size < SWEEP_THRESHOLD) return;
  for (const [key, entry] of entries) {
    if (entry.lockedUntil < now && now - entry.windowStart > WINDOW_MS) {
      entries.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  now = Date.now(),
): RateLimitDecision {
  const entry = entries.get(key);
  if (!entry) return { allowed: true, retryAfterMs: 0 };

  if (entry.lockedUntil > now) {
    return { allowed: false, retryAfterMs: entry.lockedUntil - now };
  }

  if (now - entry.windowStart > WINDOW_MS) {
    entries.delete(key);
  }

  return { allowed: true, retryAfterMs: 0 };
}

export function recordFailure(
  key: string,
  now = Date.now(),
): RateLimitDecision {
  sweep(now);

  const entry: Entry = entries.get(key) ?? {
    failures: 0,
    windowStart: now,
    lockedUntil: 0,
    strikes: 0,
  };

  if (now - entry.windowStart > WINDOW_MS) {
    entry.failures = 0;
    entry.windowStart = now;
  }

  entry.failures += 1;

  if (entry.failures >= MAX_ATTEMPTS) {
    entry.strikes += 1;
    const cooldown = Math.min(
      BASE_COOLDOWN_MS * 2 ** (entry.strikes - 1),
      MAX_COOLDOWN_MS,
    );
    entry.lockedUntil = now + cooldown;
    entry.failures = 0;
    entry.windowStart = now;
  }

  entries.set(key, entry);
  return checkRateLimit(key, now);
}

export function clearRateLimit(key: string): void {
  entries.delete(key);
}

export function resetRateLimiter(): void {
  entries.clear();
}
