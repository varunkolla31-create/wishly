import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/**
 * Applies db/schema.sql. DATABASE_URL is read from the environment, falling
 * back to .env.local so `pnpm db:push` works without exporting anything.
 */
async function connectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  try {
    const envLocal = await readFile(path.join(projectRoot, ".env.local"), "utf8");
    for (const line of envLocal.split(/\r?\n/)) {
      const match = /^\s*DATABASE_URL\s*=\s*(.+)$/.exec(line);
      if (match?.[1]) return match[1].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local; fall through to the error below.
  }

  throw new Error("DATABASE_URL is not set and .env.local has no DATABASE_URL.");
}

const schemaPath = path.join(projectRoot, "db", "schema.sql");
const sql = await readFile(schemaPath, "utf8");

const client = new pg.Client({
  connectionString: await connectionString(),
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name IN ('wishes','contributions','replies')
     ORDER BY table_name`,
  );
  console.log(`schema applied: ${rows.map((row) => row.table_name).join(", ")}`);
} finally {
  await client.end();
}
