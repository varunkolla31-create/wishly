import "server-only";
import { dbDriver } from "@/lib/env";
import { query } from "@/lib/db/postgres";
import { collectionPath } from "@/lib/storage/paths";
import { JsonCollection } from "@/lib/storage/json-collection";

/**
 * "Tell me when paid plans land" captures.
 *
 * One row per address. Nothing else is stored — no IP, no user agent, no
 * marketing profile — and the consent timestamp is kept so the basis for the
 * message is auditable.
 */

export interface NotifySignup {
  email: string;
  source: string;
  consentedAt: string;
}

interface NotifyRepo {
  add(email: string, source: string): Promise<{ created: boolean }>;
  count(): Promise<number>;
}

class PostgresNotifyRepo implements NotifyRepo {
  async add(email: string, source: string): Promise<{ created: boolean }> {
    const { rowCount } = await query(
      `INSERT INTO notify_signups (email, source)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING`,
      [email, source],
    );
    return { created: (rowCount ?? 0) > 0 };
  }

  async count(): Promise<number> {
    const { rows } = await query<{ n: string }>(
      `SELECT count(*)::text AS n FROM notify_signups`,
    );
    return Number(rows[0]?.n ?? "0");
  }
}

class FileNotifyRepo implements NotifyRepo {
  private readonly collection: JsonCollection<NotifySignup>;

  constructor() {
    this.collection = new JsonCollection<NotifySignup>(
      collectionPath("notify-signups"),
    );
  }

  async add(email: string, source: string): Promise<{ created: boolean }> {
    return this.collection.mutate<{ created: boolean }>((items) => {
      if (items.some((item) => item.email === email)) {
        return { items, result: { created: false } };
      }
      const entry: NotifySignup = {
        email,
        source,
        consentedAt: new Date().toISOString(),
      };
      return { items: [...items, entry], result: { created: true } };
    });
  }

  async count(): Promise<number> {
    return (await this.collection.read()).length;
  }
}

let cached: NotifyRepo | null = null;

export function notifyRepo(): NotifyRepo {
  if (cached) return cached;
  cached = dbDriver() === "postgres" ? new PostgresNotifyRepo() : new FileNotifyRepo();
  return cached;
}

/**
 * Test seam. The repo is memoised because `dbDriver()` validates the whole
 * environment, and the file adapter binds to a path on construction — so tests
 * that point WISHLY_DATA_DIR at a fresh directory must drop the memo.
 */
export function resetNotifyRepo(): void {
  cached = null;
}
