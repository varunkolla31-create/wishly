import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll } from "vitest";
import { wishlyContract } from "@/tests/contract/wishly-contract";

/**
 * Postgres contract run. Refuses to start without DATABASE_URL_TEST, because
 * pointing it at the app's own database would be a footgun. The suite creates a
 * throwaway schema, migrates it, runs the shared contract, then drops it — the
 * app's `public` schema is never touched.
 */
function loadEnvLocal(): Record<string, string> {
  const found: Record<string, string> = {};
  try {
    for (const line of readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!m) continue;
      const name = m[1];
      if (!name) continue;
      found[name] = (m[2] ?? "").trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local.
  }
  return found;
}

const fileEnv = loadEnvLocal();
const testUrl = process.env.DATABASE_URL_TEST ?? fileEnv.DATABASE_URL_TEST ?? "";
const schema = `wishly_contract_${Date.now().toString(36)}`;
const previous = { ...process.env };

beforeAll(async () => {
  if (!testUrl) {
    throw new Error(
      "DATABASE_URL_TEST is not set. Run the suite with `pnpm test:db`.",
    );
  }
  process.env.DB_DRIVER = "postgres";
  process.env.MEDIA_DRIVER = "file";
  process.env.DATABASE_URL = testUrl;
  process.env.DATABASE_SCHEMA = schema;
  delete process.env.DATA_ADAPTER;
  delete process.env.STORAGE_DRIVER;

  const { runMigrations } = await import("@/scripts/db-migrate.mjs");
  await runMigrations({ url: testUrl, schema });
});

afterAll(async () => {
  const { pool, closePool } = await import("@/lib/db/postgres");
  await pool()
    .query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
    .catch(() => undefined);
  await closePool();
  process.env = { ...previous };
});

wishlyContract(
  "postgres adapter",
  async () => {
    const { contributionRepo, replyRepo, wishRepo } = await import("@/lib/repos/index");
    return {
      wishRepo: wishRepo(),
      contributionRepo: contributionRepo(),
      replyRepo: replyRepo(),
      ownerId: `pg_owner_${Date.now()}`,
    };
  },
  async () => undefined,
);
