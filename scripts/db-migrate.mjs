import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import pg from "pg";
import {
  loadEnv,
  readVar,
  requirePostgresUrl,
  safeSchemaName,
} from "./lib/load-env.mjs";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const migrationsDir = path.join(projectRoot, "db", "migrations");

/**
 * Applies every unapplied file in db/migrations, in filename order, each inside
 * its own transaction and recorded in schema_migrations. Safe to re-run.
 *
 * `schema` is used by the contract tests to work in a throwaway schema instead
 * of `public`. When omitted, the connection's default search_path applies.
 */
export async function runMigrations({ url, schema } = {}) {
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    if (schema) {
      const name = safeSchemaName(schema);
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${name}"`);
      await client.query(`SET search_path TO "${name}"`);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const { rows } = await client.query("SELECT version FROM schema_migrations");
    const applied = new Set(rows.map((row) => row.version));

    const files = (await readdir(migrationsDir))
      .filter((name) => name.endsWith(".sql"))
      .sort();

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) continue;

      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      await client.query("BEGIN");
      try {
        // No parameters here, so pg uses the simple protocol and the file may
        // contain several statements.
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [file],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(
          `Migration ${file} failed: ${String(error?.message ?? error).slice(0, 200)}`,
        );
      }

      count += 1;
      console.log(`applied ${file}`);
    }

    return { applied: count, total: files.length };
  } finally {
    await client.end();
  }
}

/** Drops the app's tables in the current schema. Destructive; CLI-gated. */
export async function resetSchema(url) {
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(`
      DROP TABLE IF EXISTS replies, contributions, unlock_attempts, wishes,
                           schema_migrations CASCADE
    `);
  } finally {
    await client.end();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const schemaArg = args.find((arg) => arg.startsWith("--schema="));
  const schema = schemaArg ? schemaArg.slice("--schema=".length) : undefined;
  const wantsReset = args.includes("--reset");
  const confirmed = args.includes("--yes");

  const fileEnv = loadEnv(projectRoot);
  const url = requirePostgresUrl(
    "DATABASE_URL_UNPOOLED or DATABASE_URL",
    readVar("DATABASE_URL_UNPOOLED", fileEnv) ?? readVar("DATABASE_URL", fileEnv),
  );

  if (wantsReset) {
    if (!confirmed) {
      throw new Error(
        "Refusing to drop tables without --yes. Run: pnpm db:reset (which passes --yes).",
      );
    }
    await resetSchema(url);
    console.log("dropped app tables");
  }

  const result = await runMigrations({ url, schema });
  console.log(
    result.applied === 0
      ? `up to date (${result.total} migration(s) already applied)`
      : `applied ${result.applied} migration(s) · ${result.total} total`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error?.message ?? error);
    process.exitCode = 1;
  });
}
