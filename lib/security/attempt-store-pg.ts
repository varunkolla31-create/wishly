import "server-only";
import { dbDriver } from "@/lib/env";
import { query } from "@/lib/db/postgres";
import {
  advance,
  decide,
  MemoryAttemptStore,
  type AttemptRecord,
  type AttemptStore,
  type RateLimitDecision,
} from "@/lib/security/attempt-store";

/**
 * Postgres-backed attempt ledger. `unlock_attempts` (migration 002) already
 * existed for exactly this purpose but nothing used it; the in-process Map was
 * a single-lambda shortcut. One row per (wish_id, ip_hash).
 */
export class PostgresAttemptStore implements AttemptStore {
  async read(key: string): Promise<AttemptRecord | null> {
    const { wishId, ipHash } = splitKey(key);
    const { rows } = await query<{
      attempts: number;
      strikes: number;
      window_start: Date | string;
      locked_until: Date | string | null;
    }>(
      `SELECT attempts, strikes, window_start, locked_until
         FROM unlock_attempts
        WHERE wish_id = $1 AND ip_hash = $2`,
      [wishId, ipHash],
    );

    const row = rows[0];
    if (!row) return null;

    return {
      failures: row.attempts,
      strikes: row.strikes,
      windowStart: toMs(row.window_start),
      lockedUntil: row.locked_until ? toMs(row.locked_until) : 0,
    };
  }

  async write(key: string, record: AttemptRecord): Promise<void> {
    const { wishId, ipHash } = splitKey(key);
    await query(
      `INSERT INTO unlock_attempts
         (wish_id, ip_hash, attempts, strikes, window_start, locked_until)
       VALUES ($1, $2, $3, $4, to_timestamp($5 / 1000.0), $6)
       ON CONFLICT (wish_id, ip_hash) DO UPDATE SET
         attempts = EXCLUDED.attempts,
         strikes = EXCLUDED.strikes,
         window_start = EXCLUDED.window_start,
         locked_until = EXCLUDED.locked_until`,
      [
        wishId,
        ipHash,
        record.failures,
        record.strikes,
        record.windowStart,
        record.lockedUntil > 0 ? new Date(record.lockedUntil) : null,
      ],
    );
  }

  async delete(key: string): Promise<void> {
    const { wishId, ipHash } = splitKey(key);
    await query(
      `DELETE FROM unlock_attempts WHERE wish_id = $1 AND ip_hash = $2`,
      [wishId, ipHash],
    );
  }
}

function toMs(value: Date | string): number {
  return value instanceof Date ? value.getTime() : Date.parse(value);
}

/**
 * The table is keyed by a real wish id, so a limiter key is split rather than
 * stored verbatim. Keys are built by `unlock-guard.ts` as `<wishId>:<ipHash>`.
 */
function splitKey(key: string): { wishId: string; ipHash: string } {
  const index = key.lastIndexOf(":");
  if (index <= 0) throw new Error("Attempt keys must be `<wishId>:<ipHash>`.");
  return { wishId: key.slice(0, index), ipHash: key.slice(index + 1) };
}

const memory = new MemoryAttemptStore();
let selected: AttemptStore | null = null;

/**
 * Postgres when the app is configured to use it; memory otherwise. The choice
 * is memoised because `dbDriver()` reads and validates the environment.
 */
export function attemptStore(): AttemptStore {
  if (selected) return selected;
  selected = dbDriver() === "postgres" ? new PostgresAttemptStore() : memory;
  return selected;
}

/** Test seam: forget the memoised store and drop in-memory rows. */
export function resetAttemptStore(): void {
  selected = null;
  memory.clear();
}

export async function checkAttempts(
  key: string,
  now = Date.now(),
  store: AttemptStore = attemptStore(),
): Promise<RateLimitDecision> {
  return decide(await store.read(key), now);
}

export async function recordAttemptFailure(
  key: string,
  now = Date.now(),
  store: AttemptStore = attemptStore(),
): Promise<RateLimitDecision> {
  const next = advance(await store.read(key), now);
  await store.write(key, next);
  return decide(next, now);
}

export async function clearAttempts(
  key: string,
  store: AttemptStore = attemptStore(),
): Promise<void> {
  await store.delete(key);
}
