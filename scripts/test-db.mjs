import { spawn } from "node:child_process";
import { loadEnv, readVar } from "./lib/load-env.mjs";

/**
 * Runs the Postgres contract suite. Refuses to start unless DATABASE_URL_TEST
 * is set: the suite works in a throwaway schema, but pointing a test runner at
 * the app's own database by accident is not a mistake worth allowing.
 */
const fileEnv = loadEnv();
const testUrl = readVar("DATABASE_URL_TEST", fileEnv);

if (!testUrl) {
  console.error(
    "DATABASE_URL_TEST is not set. Add it to .env.local (it may point at the same Neon database — the suite uses its own throwaway schema) and run again.",
  );
  process.exit(1);
}

if (!/[?&]sslmode=(require|verify-ca|verify-full)\b/.test(testUrl)) {
  console.error("DATABASE_URL_TEST must include sslmode=require.");
  process.exit(1);
}

const child = spawn(
  process.platform === "win32" ? "pnpm.cmd" : "pnpm",
  ["exec", "vitest", "run", "--config", "vitest.db.config.mts"],
  { stdio: "inherit", env: { ...process.env, NODE_ENV: "test" }, shell: false },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
