import "server-only";
import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { databaseUrl, env } from "@/lib/env";
import { mapPostgresError } from "@/lib/repos/errors";

let cached: Pool | null = null;

const SCHEMA_PATTERN = /^[a-z_][a-z0-9_]*$/;

/**
 * The only place that touches the driver. Every query goes through `query()` or
 * `withTransaction()` so driver errors are translated once.
 */
export function pool(): Pool {
  if (cached) return cached;

  const config = env();
  const created = new Pool({
    connectionString: databaseUrl(config),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    // TLS is enforced by env validation; Neon presents a valid certificate.
    ssl: { rejectUnauthorized: false },
  });

  // Neon's pooler rejects `search_path` as a startup parameter, so it is set
  // per connection instead. Used by the contract tests' throwaway schema.
  const schema = config.DATABASE_SCHEMA;
  if (schema) {
    if (!SCHEMA_PATTERN.test(schema)) {
      throw new Error("DATABASE_SCHEMA must be a lowercase SQL identifier.");
    }
    created.on("connect", (client) => {
      client.query(`SET search_path TO "${schema}"`).catch(() => undefined);
    });
  }

  cached = created;
  return cached;
}

/** Closes the pool. Only tests need this. */
export async function closePool(): Promise<void> {
  if (!cached) return;
  const current = cached;
  cached = null;
  await current.end().catch(() => undefined);
}

/** Parameterised query. Never interpolate user input into `text`. */
export async function query<T extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<QueryResult<T>> {
  try {
    return await pool().query<T>(text, params as unknown[]);
  } catch (error) {
    mapPostgresError(error);
  }
}

/** Runs `work` inside BEGIN/COMMIT, rolling back on any error. */
export async function withTransaction<T>(
  work: (client: {
    query: <R extends QueryResultRow>(
      text: string,
      params?: readonly unknown[],
    ) => Promise<QueryResult<R>>;
  }) => Promise<T>,
): Promise<T> {
  const client = await pool().connect().catch((error: unknown) => {
    mapPostgresError(error);
  });

  try {
    await client.query("BEGIN");
    const result = await work({
      query: async <R extends QueryResultRow>(
        text: string,
        params: readonly unknown[] = [],
      ) => client.query<R>(text, params as unknown[]),
    });
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    mapPostgresError(error);
  } finally {
    client.release();
  }
}
