import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll } from "vitest";
import { wishlyContract } from "@/tests/contract/wishly-contract";
import { contributionRepo, replyRepo, wishRepo } from "@/lib/repos/index";

/**
 * Runs the shared contract against the file adapter, proving it behaves the
 * same as Postgres. Uses a temp data dir and the file driver.
 */
let dir = "";
const previous = { ...process.env };

beforeAll(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "wishly-contract-file-"));
  process.env.WISHLY_DATA_DIR = dir;
  process.env.DB_DRIVER = "file";
  process.env.MEDIA_DRIVER = "file";
  delete process.env.DATA_ADAPTER;
  delete process.env.STORAGE_DRIVER;
});

afterAll(async () => {
  process.env = { ...previous };
  if (dir) await rm(dir, { recursive: true, force: true });
});

wishlyContract(
  "file adapter",
  async () => ({
    wishRepo: wishRepo(),
    contributionRepo: contributionRepo(),
    replyRepo: replyRepo(),
    ownerId: `file_owner_${Date.now()}`,
  }),
  async () => undefined,
);
