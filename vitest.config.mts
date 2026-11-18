import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
      "next/cache": fileURLToPath(
        new URL("./tests/stubs/next-cache.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    restoreMocks: true,
    // Vitest sets NODE_ENV=test itself, but a shell that exports a global
    // NODE_ENV=production (some CI images and Windows setups do) wins over it.
    // Pin it here so lib/env.ts never demands production secrets under test.
    env: { NODE_ENV: "test" },
    // One worker per test file, each importing the Next bundle, occasionally
    // exceeds the default heap and the worker dies during collection (reported
    // as a file-level failure with no failed assertions). Serialising the run
    // and giving the worker a larger heap keeps it deterministic.
    pool: "forks",
    maxWorkers: 1,
    poolOptions: {
      forks: { execArgv: ["--max-old-space-size=4096"] },
    },
  },
});
