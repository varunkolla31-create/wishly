import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Live R2 test. Only runs through `pnpm test:r2` with R2_TEST_LIVE=1, and only
 * touches objects under `tmp/test-`, deleting everything it creates.
 */
const live = process.env.R2_TEST_LIVE === "1";

function loadEnvFiles(): Record<string, string> {
  const values: Record<string, string> = {};
  for (const file of [".env", ".env.local"]) {
    try {
      const raw = readFileSync(path.join(process.cwd(), file), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
        if (!m) continue;
        const name = m[1];
        if (!name) continue;
        values[name] = (m[2] ?? "").trim().replace(/^["']|["']$/g, "");
      }
    } catch {
      // File absent.
    }
  }
  return values;
}

describe.skipIf(!live)("R2 media store (live)", () => {
  const wishId = `tmp-test-${Date.now().toString(36)}`;

  it("uploads, verifies, reads back and deletes an object", async () => {
    const fileEnv = loadEnvFiles();
    for (const name of [
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET",
      "R2_ENDPOINT",
    ]) {
      process.env[name] = process.env[name] ?? fileEnv[name];
    }
    process.env.MEDIA_DRIVER = "r2";

    const { R2MediaStore } = await import("@/lib/repos/r2/media-store");
    const store = new R2MediaStore();

    const body = Buffer.from("wishly live r2 test", "utf8");
    const target = await store.createUpload({
      wishId,
      kind: "photo",
      contentType: "image/png",
      size: body.byteLength,
    });

    // Upload directly with the presigned URL, exactly as the browser does.
    const put = await fetch(target.uploadUrl, {
      method: "PUT",
      headers: target.headers,
      body,
    });
    expect(put.ok, `PUT failed with ${put.status}`).toBe(true);

    const verified = await store.verifyUpload(target.key);
    expect(verified.ok).toBe(true);

    const readUrl = await store.createReadUrl(target.key);
    const got = await fetch(readUrl);
    expect(got.status).toBe(200);
    expect((await got.arrayBuffer()).byteLength).toBe(body.byteLength);

    await store.delete(target.key);
    expect(await store.verifyUpload(target.key)).toEqual({
      ok: false,
      reason: "missing",
    });
  });
});
