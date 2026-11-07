import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import {
  loadEnv,
  readVar,
  requirePostgresUrl,
} from "./lib/load-env.mjs";

/**
 * Read-only readiness report. Prints variable names and pass/fail only — never
 * the connection string, and never a row of user data.
 */
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const EXPECTED = {
  wishes: [
    "wish_id",
    "owner_id",
    "mode",
    "category",
    "template_id",
    "receiver_name",
    "title",
    "message",
    "media_keys",
    "music",
    "music_id",
    "password_hash",
    "password_hint",
    "password_version",
    "unlock_at",
    "status",
    "contributor_token",
    "contributor_token_revoked_at",
    "views",
    "created_at",
    "updated_at",
  ],
  contributions: [
    "wish_id",
    "contribution_id",
    "contributor_name",
    "type",
    "media_key",
    "text",
    "status",
    "sort_order",
    "created_at",
  ],
  replies: ["wish_id", "reply_id", "owner_id", "message", "emoji", "created_at"],
  unlock_attempts: [
    "wish_id",
    "ip_hash",
    "attempts",
    "strikes",
    "window_start",
    "locked_until",
  ],
  schema_migrations: ["version", "applied_at"],
};

const EXPECTED_INDEXES = [
  "wishes_owner_updated_idx",
  "wishes_contributor_token_idx",
  "contributions_wall_idx",
  "replies_owner_created_idx",
  "unlock_attempts_locked_idx",
];

let failures = 0;
const ok = (label) => console.log(`  ok    ${label}`);
const fail = (label, detail) => {
  failures += 1;
  console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
};

const fileEnv = loadEnv(projectRoot);
const url = requirePostgresUrl(
  "DATABASE_URL_UNPOOLED or DATABASE_URL",
  readVar("DATABASE_URL_UNPOOLED", fileEnv) ?? readVar("DATABASE_URL", fileEnv),
);

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

console.log("Wishly database check\n");

try {
  await client.connect();
} catch (error) {
  console.log(`  FAIL  connect — ${String(error?.message ?? error).slice(0, 120)}`);
  process.exitCode = 1;
  process.exit();
}

try {
  console.log("connection");
  const ping = await client.query("SELECT 1 AS one");
  if (ping.rows[0]?.one === 1) ok("SELECT 1");
  else fail("SELECT 1");

  const version = await client.query("SELECT version() AS v");
  ok(`server ${String(version.rows[0]?.v ?? "").split(" ").slice(0, 2).join(" ")}`);

  const { rows: columnRows } = await client.query(
    `SELECT table_name, column_name, data_type
       FROM information_schema.columns
      WHERE table_schema = current_schema()`,
  );
  const columns = new Map();
  for (const row of columnRows) {
    if (!columns.has(row.table_name)) columns.set(row.table_name, new Map());
    columns.get(row.table_name).set(row.column_name, row.data_type);
  }

  console.log("\ntables");
  for (const [table, expected] of Object.entries(EXPECTED)) {
    const present = columns.get(table);
    if (!present) {
      fail(`${table}`, "table missing — run pnpm db:migrate");
      continue;
    }
    const missing = expected.filter((name) => !present.has(name));
    if (missing.length === 0) {
      ok(`${table} (${expected.length} columns)`);
    } else {
      fail(`${table}`, `missing column(s): ${missing.join(", ")} — run pnpm db:migrate`);
    }
  }

  const mediaType = columns.get("wishes")?.get("media_keys");
  if (mediaType === "jsonb") ok("wishes.media_keys is jsonb");
  else fail("wishes.media_keys", `expected jsonb, found ${mediaType ?? "missing"}`);

  console.log("\nindexes");
  const { rows: indexRows } = await client.query(
    `SELECT indexname FROM pg_indexes WHERE schemaname = current_schema()`,
  );
  const indexes = new Set(indexRows.map((row) => row.indexname));
  for (const name of EXPECTED_INDEXES) {
    if (indexes.has(name)) ok(name);
    else fail(name, "index missing");
  }

  console.log("\nmigrations");
  const files = (await readdir(path.join(projectRoot, "db", "migrations")))
    .filter((name) => name.endsWith(".sql"))
    .sort();
  let applied = new Set();
  if (columns.has("schema_migrations")) {
    const { rows } = await client.query("SELECT version FROM schema_migrations");
    applied = new Set(rows.map((row) => row.version));
  }
  const unapplied = files.filter((name) => !applied.has(name));
  if (unapplied.length === 0) {
    ok(`${files.length} migration(s) applied`);
  } else {
    fail("pending migrations", `${unapplied.join(", ")} — run pnpm db:migrate`);
  }
} finally {
  await client.end();
}

console.log("\nresult");
if (failures === 0) {
  console.log("Database is ready.");
} else {
  console.log(`${failures} check(s) failed. See docs/NEON_SETUP.md.`);
  process.exitCode = 1;
}
