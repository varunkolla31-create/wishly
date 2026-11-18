import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  MEMORY_TEMPLATES,
  MEMORY_RIGS_PUBLIC,
  MEMORY_ATMOSPHERES_PUBLIC,
} from "@/src/components/three-memory/catalog";

const ROOT = process.cwd();

async function walkSource(dir: string, out: string[] = []): Promise<string[]> {
  for (const entry of await readdir(path.join(ROOT, dir), {
    withFileTypes: true,
  })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkSource(relative, out);
      continue;
    }
    if (/\.(tsx?|mts)$/.test(entry.name)) out.push(relative);
  }
  return out;
}

describe("catalog honesty", () => {
  it("ships 8 scenes and 15 moods", () => {
    expect(MEMORY_RIGS_PUBLIC).toHaveLength(8);
    expect(MEMORY_ATMOSPHERES_PUBLIC).toHaveLength(15);
    expect(MEMORY_TEMPLATES).toHaveLength(120);
  });

  it("gives every card a distinct tagline", () => {
    const taglines = MEMORY_TEMPLATES.map((template) => template.tagline);

    expect(new Set(taglines).size).toBe(taglines.length);
    // The old repeated line must not be the whole tagline of any card.
    for (const tagline of taglines) {
      expect(tagline.trim()).not.toBe("Warm gold and honest light.");
      expect(tagline.trim().length).toBeGreaterThan(5);
    }
  });

  it("gives every card a distinct name", () => {
    const names = MEMORY_TEMPLATES.map((template) => template.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("does not advertise a bare '120' in user-facing copy", async () => {
    const files = [
      ...(await walkSource("app")),
      ...(await walkSource("components")),
      ...(await walkSource("src")),
    ];

    const offenders: string[] = [];
    for (const file of files) {
      const body = await readFile(path.join(ROOT, file), "utf8");
      // "120 reels", "All 120", "120 original" — but not geometry or timeouts.
      if (/\b120\s+(?:original\s+)?(?:3d\s+)?reels\b/i.test(body)) {
        offenders.push(file);
      }
      if (/All\s+120/i.test(body)) offenders.push(file);
    }

    expect(offenders, offenders.join(", ")).toHaveLength(0);
  });

  it("names the catalog as scenes and moods, not rigs and atmospheres", async () => {
    const page = await readFile(
      path.join(ROOT, "app/(marketing)/templates/page.tsx"),
      "utf8",
    );
    expect(page).toContain("8 scenes × 15 moods");
    expect(page).not.toContain("rigs and atmospheres");
  });
});
