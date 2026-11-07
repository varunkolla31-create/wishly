import "server-only";
import { Pool } from "pg";
import { env } from "@/lib/env";

let cached: Pool | null = null;

/**
 * One pool per process. Neon's pooled connection string is expected here; when
 * it lacks an explicit sslmode we still require TLS, because managed Postgres
 * refuses plaintext connections.
 */
export function pool(): Pool {
  if (cached) return cached;

  const connectionString = env().DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for DATA_ADAPTER=postgres.");
  }

  cached = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: /sslmode=disable/.test(connectionString)
      ? undefined
      : { rejectUnauthorized: false },
  });

  return cached;
}

export function quoteIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}
