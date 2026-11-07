import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Live R2 test. Opt-in only: `R2_TEST_LIVE=1 pnpm test:r2`.
 */
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
    include: ["tests/integration/r2-live.test.ts"],
    setupFiles: ["tests/setup.ts"],
    restoreMocks: true,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
