import "server-only";

/**
 * Shared attempt counters for credential guessing.
 *
 * The in-process `Map` that used to live in `rate-limit.ts` only ever saw the
 * lambda that received the request, so on Vercel five tries per IP became five
 * tries per *instance*. This module keeps the same decision shape but lets the
 * caller supply a persistence layer; `unlock-guard.ts` picks Postgres when the
 * app is configured for it and falls back to memory for local work and tests.
 */

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterMs: number;
}

export interface AttemptRecord {
  /** Failures accumulated in the current window. */
  failures: number;
  /** Consecutive lockouts; each one doubles the cooldown. */
  strikes: number;
  /** Epoch ms when the current counting window started. */
  windowStart: number;
  /** Epoch ms until which the key is locked, or 0. */
  lockedUntil: number;
}

export interface AttemptStore {
  /** Reads the current record, or null when the key is unknown. */
  read(key: string): Promise<AttemptRecord | null>;
  write(key: string, record: AttemptRecord): Promise<void>;
  delete(key: string): Promise<void>;
}

export const MAX_ATTEMPTS = 5;
export const WINDOW_MS = 15 * 60 * 1000;
export const BASE_COOLDOWN_MS = 60 * 1000;
export const MAX_COOLDOWN_MS = 15 * 60 * 1000;

const SWEEP_THRESHOLD = 5000;

/** Default store: one process, good enough for dev, tests and single-node runs. */
export class MemoryAttemptStore implements AttemptStore {
  private readonly entries = new Map<string, AttemptRecord>();

  async read(key: string): Promise<AttemptRecord | null> {
    return this.entries.get(key) ?? null;
  }

  async write(key: string, record: AttemptRecord): Promise<void> {
    if (this.entries.size >= SWEEP_THRESHOLD) this.sweep(Date.now());
    this.entries.set(key, record);
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }

  /** Drops records that are neither locked nor inside a live window. */
  sweep(now: number): void {
    for (const [key, entry] of this.entries) {
      if (entry.lockedUntil <= now && now - entry.windowStart > WINDOW_MS) {
        this.entries.delete(key);
      }
    }
  }

  clear(): void {
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }
}

/** Pure decision logic, shared by every store. */
export function cooldownFor(strikes: number): number {
  return Math.min(BASE_COOLDOWN_MS * 2 ** Math.max(0, strikes - 1), MAX_COOLDOWN_MS);
}

export function decide(
  record: AttemptRecord | null,
  now: number,
): RateLimitDecision {
  if (!record) return { allowed: true, retryAfterMs: 0 };

  if (record.lockedUntil > now) {
    return { allowed: false, retryAfterMs: record.lockedUntil - now };
  }

  if (now - record.windowStart > WINDOW_MS) {
    return { allowed: true, retryAfterMs: 0 };
  }

  return { allowed: true, retryAfterMs: 0 };
}

/** Applies one failure to a record and returns the next state. */
export function advance(
  record: AttemptRecord | null,
  now: number,
): AttemptRecord {
  const base: AttemptRecord = record ?? {
    failures: 0,
    strikes: 0,
    windowStart: now,
    lockedUntil: 0,
  };

  const withinWindow = now - base.windowStart <= WINDOW_MS;
  const failures = (withinWindow ? base.failures : 0) + 1;
  const windowStart = withinWindow ? base.windowStart : now;

  if (failures >= MAX_ATTEMPTS) {
    const strikes = base.strikes + 1;
    return {
      failures: 0,
      strikes,
      windowStart: now,
      lockedUntil: now + cooldownFor(strikes),
    };
  }

  return { ...base, failures, windowStart, lockedUntil: base.lockedUntil };
}
