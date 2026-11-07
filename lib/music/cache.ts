import "server-only";
import { query } from "@/lib/db/postgres";
import { dbDriver } from "@/lib/env";

interface CacheRow {
  payload: unknown;
  expires_at: Date | string;
}

interface CountRow {
  search_count: number;
}

const memory = new Map<string, { payload: unknown; expiresAt: number }>();
let memoryDay = utcDay();
let memoryCount = 0;

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Tests only. */
export function resetMusicMemoryForTests(): void {
  memory.clear();
  memoryDay = utcDay();
  memoryCount = 0;
}

export async function readMusicCache<T>(
  key: string,
  options: { allowExpired?: boolean } = {},
): Promise<T | null> {
  if (dbDriver() !== "postgres") {
    const entry = memory.get(key);
    if (!entry) return null;
    if (!options.allowExpired && entry.expiresAt <= Date.now()) return null;
    return entry.payload as T;
  }

  const { rows } = await query<CacheRow>(
    options.allowExpired
      ? `SELECT payload, expires_at FROM music_search_cache WHERE cache_key = $1`
      : `SELECT payload, expires_at FROM music_search_cache
         WHERE cache_key = $1 AND expires_at > now()`,
    [key],
  );
  return rows[0] ? (rows[0].payload as T) : null;
}

export async function writeMusicCache(
  key: string,
  payload: unknown,
  ttlSeconds: number,
): Promise<void> {
  if (dbDriver() !== "postgres") {
    memory.set(key, {
      payload,
      expiresAt: Date.now() + Math.max(1, ttlSeconds) * 1000,
    });
    return;
  }

  await query(
    `INSERT INTO music_search_cache (cache_key, payload, expires_at)
     VALUES ($1, $2::jsonb, now() + ($3::int * interval '1 second'))
     ON CONFLICT (cache_key) DO UPDATE
       SET payload = EXCLUDED.payload,
           expires_at = EXCLUDED.expires_at,
           created_at = now()`,
    [key, JSON.stringify(payload), Math.max(1, Math.trunc(ttlSeconds))],
  );
}

export async function incrementMusicSearchCount(): Promise<number> {
  if (dbDriver() !== "postgres") {
    const today = utcDay();
    if (memoryDay !== today) {
      memoryDay = today;
      memoryCount = 0;
    }
    memoryCount += 1;
    return memoryCount;
  }

  const { rows } = await query<CountRow>(
    `INSERT INTO music_quota (quota_date, search_count)
     VALUES ($1, 1)
     ON CONFLICT (quota_date) DO UPDATE
       SET search_count = music_quota.search_count + 1,
           updated_at = now()
     RETURNING search_count`,
    [utcDay()],
  );
  return rows[0]?.search_count ?? 0;
}

export async function getMusicSearchCount(): Promise<number> {
  if (dbDriver() !== "postgres") {
    return memoryDay === utcDay() ? memoryCount : 0;
  }

  const { rows } = await query<CountRow>(
    `SELECT search_count FROM music_quota WHERE quota_date = $1`,
    [utcDay()],
  );
  return rows[0]?.search_count ?? 0;
}
