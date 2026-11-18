import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the positioning merge: "Studio" and "3D reels" are one feature now.
 * These assertions fail if a second nav entry reappears or if the workbench is
 * only reachable by a stale path.
 */

const ROOT = process.cwd();

async function readSource(relative: string): Promise<string> {
  return readFile(path.join(ROOT, relative), "utf8");
}

describe("3D reels navigation", () => {
  it("lists exactly one 3D-reels nav entry", async () => {
    const header = await readSource("components/marketing/header.tsx");
    const labels = [...header.matchAll(/label:\s*"([^"]+)"/g)].map(
      (match) => match[1],
    );

    expect(labels).toContain("3D reels");
    expect(labels).not.toContain("Studio");
  });

  it("does not offer a separate Studio entry in the footer", async () => {
    const footer = await readSource("components/marketing/footer.tsx");
    const labels = [...footer.matchAll(/label:\s*"([^"]+)"/g)].map(
      (match) => match[1],
    );

    expect(labels).toContain("3D reels");
    expect(labels).not.toContain("Studio");
  });

  it("redirects /studio to the merged workbench tab", async () => {
    const page = await readSource("app/(marketing)/studio/page.tsx");
    expect(page).toContain("/templates?tab=workbench");
    expect(page).toContain("redirect");
  });

  it("keeps /templates as the single catalog + workbench surface", async () => {
    const page = await readSource("app/(marketing)/templates/page.tsx");
    expect(page).toContain("ReelsTabs");
    expect(page).toContain("8 scenes × 15 moods");
  });

  it("does not link the bare /studio index anywhere in the app", async () => {
    const offenders: string[] = [];
    const roots = ["components", "app", "src"];

    async function walk(dir: string) {
      for (const entry of await readdir(path.join(ROOT, dir), {
        withFileTypes: true,
      })) {
        const relative = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules" || entry.name.startsWith(".")) {
            continue;
          }
          await walk(relative);
          continue;
        }
        if (!/\.(tsx?|mts)$/.test(entry.name)) continue;

        const body = await readFile(path.join(ROOT, relative), "utf8");
        // `href="/studio"` or a template literal ending at the bare index.
        if (
          /href=["']\/studio["']/.test(body) ||
          /href=\{`\/studio`\}/.test(body)
        ) {
          offenders.push(relative);
        }
      }
    }

    for (const root of roots) await walk(root);

    expect(offenders, offenders.join(", ")).toHaveLength(0);
  });
});
