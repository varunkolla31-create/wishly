import os from "node:os";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const dataDir = path.join(
  os.tmpdir(),
  "wishly-e2e",
  `${Date.now().toString(36)}-${process.pid}`,
);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 90_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      AUTH_MODE: "dev",
      WISHLY_DEV_AUTH_BYPASS: "true",
      WISHLY_DATA_DIR: dataDir,
      // Never let an e2e run touch a real database or bucket, even when
      // .env.local points at Neon. Explicit process env wins over .env.local.
      DATA_ADAPTER: "file",
      MEDIA_ADAPTER: "file",
    },
  },
});
