import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

/**
 * Guards a bug that only appeared in production: adding a page without adding
 * it to middleware's public-route list makes Clerk protect it, and a signed-out
 * visitor gets a 404 instead of the page. That silently broke /faq, /about and
 * — worse — /manage, which anonymous creators need to delete their wish.
 */

/** Top-level directories that are deliberately behind auth. */
const PROTECTED = new Set(["dashboard"]);

/** Route groups and system folders that are not URL segments. */
const IGNORED = new Set([
  "api",
  "offline",
  "(auth)",
  "(app)",
  "(marketing)",
]);

async function routeSegments(): Promise<string[]> {
  const entries = await readdir(path.join(ROOT, "app"), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("."));
}

async function publicMatchers(): Promise<string[]> {
  const middleware = await readFile(path.join(ROOT, "middleware.ts"), "utf8");
  const block = /const isPublicRoute = createRouteMatcher\(\[([\s\S]*?)\]\)/.exec(
    middleware,
  );
  if (!block?.[1]) return [];

  return [...block[1].matchAll(/"([^"]+)"/g)].map((match) =>
    // "/faq(.*)" -> "/faq"
    (match[1] ?? "").replace(/\(\.\*\)$/, ""),
  );
}

describe("route access", () => {
  it("makes every top-level route reachable unless it is deliberately protected", async () => {
    const matchers = await publicMatchers();
    const segments = await routeSegments();

    const missing: string[] = [];
    for (const segment of segments) {
      // "" is the "/" matcher.
      if (IGNORED.has(segment)) continue;
      if (PROTECTED.has(segment)) continue;

      const covered = matchers.some(
        (matcher) => matcher === `/${segment}` || matcher === "/",
      );
      if (!covered) missing.push(segment);
    }

    expect(
      missing,
      `Add these to isPublicRoute in middleware.ts or they 404 in production: ${missing.join(", ")}`,
    ).toHaveLength(0);
  });

  it("keeps the pages the brief added public", async () => {
    const matchers = await publicMatchers();

    for (const route of ["/faq", "/about", "/manage", "/w", "/templates", "/c"]) {
      expect(matchers, route).toContain(route);
    }
  });

  it("keeps the dashboard behind auth", async () => {
    const matchers = await publicMatchers();
    expect(matchers).not.toContain("/dashboard");
  });

  it("documents the protected set", async () => {
    const middleware = await readFile(path.join(ROOT, "middleware.ts"), "utf8");
    for (const route of PROTECTED) {
      // The dashboard must not appear in the public matcher list.
      expect(middleware).not.toContain(`"/${route}(.*)"`);
    }
  });
});
