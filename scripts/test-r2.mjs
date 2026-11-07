import { spawn } from "node:child_process";
import { loadEnv, readVar } from "./lib/load-env.mjs";

/**
 * Live R2 test runner. Opt-in: it writes and deletes real objects under
 * `tmp/test-`, so it only runs when R2_TEST_LIVE=1 and the R2 vars are present.
 */
const fileEnv = loadEnv();
const live = readVar("R2_TEST_LIVE", fileEnv);

if (live !== "1") {
  console.log(
    "R2_TEST_LIVE is not 1. Set R2_TEST_LIVE=1 to run the live R2 test.",
  );
  process.exit(0);
}

const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
const missing = required.filter((name) => !readVar(name, fileEnv));
if (missing.length > 0) {
  console.error(`Missing ${missing.join(", ")}. See docs/R2_SETUP.md.`);
  process.exit(1);
}

const child = spawn(
  process.platform === "win32" ? "pnpm.cmd" : "pnpm",
  ["exec", "vitest", "run", "--config", "vitest.r2.config.mts"],
  { stdio: "inherit", env: { ...process.env, NODE_ENV: "test" }, shell: false },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
