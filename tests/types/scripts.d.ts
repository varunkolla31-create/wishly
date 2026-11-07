/**
 * `scripts/db-migrate.mjs` is plain JavaScript (it also runs outside Vitest),
 * so the TypeScript side declares the shape it relies on.
 */
declare module "@/scripts/db-migrate.mjs" {
  export function runMigrations(options: {
    url: string;
    schema?: string;
  }): Promise<{ applied: number; total: number }>;

  export function resetSchema(url: string): Promise<void>;
}
