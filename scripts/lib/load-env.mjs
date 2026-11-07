import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function readFileEnv(file) {
  const values = {};
  if (!existsSync(file)) return values;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const key = match[1];
    if (!key) continue;
    values[key] = (match[2] ?? "").trim().replace(/^["']|["']$/g, "");
  }
  return values;
}

/**
 * Same order as Next.js: `.env`, then `.env.local` overrides it. The real
 * process environment still wins via `readVar`.
 */
export function loadEnv(dir = process.cwd()) {
  return {
    ...readFileEnv(path.join(dir, ".env")),
    ...readFileEnv(path.join(dir, ".env.local")),
  };
}

/** Only `.env.local`. Kept for callers that predate `loadEnv`. */
export function loadEnvLocal(dir = process.cwd()) {
  return readFileEnv(path.join(dir, ".env.local"));
}

/** Process environment wins over `.env.local`, as Next.js does. */
export function readVar(name, fileEnv) {
  const fromProcess = process.env[name];
  if (fromProcess !== undefined && fromProcess !== "") return fromProcess;
  return fileEnv[name];
}

/**
 * Validates a Postgres URL without echoing it: scheme, and mandatory TLS.
 * The error message names the variable only.
 */
export function requirePostgresUrl(name, value) {
  if (!value) throw new Error(`${name} is not set.`);
  if (!/^postgres(ql)?:\/\//.test(value)) {
    throw new Error(`${name} must start with postgres:// or postgresql://.`);
  }
  if (!/[?&]sslmode=(require|verify-ca|verify-full)\b/.test(value)) {
    throw new Error(`${name} must include sslmode=require.`);
  }
  return value;
}

export function safeSchemaName(value) {
  if (!/^[a-z_][a-z0-9_]*$/.test(value)) {
    throw new Error(
      "Schema name must start with a letter or underscore and contain only lowercase letters, digits and underscores.",
    );
  }
  return value;
}
