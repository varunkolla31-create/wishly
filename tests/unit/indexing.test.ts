import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import nextConfig from "../../next.config";
import { metadata as wishLayoutMetadata } from "@/app/w/layout";
import { OCCASIONS } from "@/lib/catalog/occasions";

async function headersFor(pathname: string) {
  const groups = await nextConfig.headers?.();
  const matches = (groups ?? [])
    .map((group) => {
      // Next treats `:path*` as a catch-all covering zero or more segments, so
      // "/w/:path*" must match "/w/abc/reveal" as well as "/w/abc".
      const pattern = group.source
        .replace(/\/:([A-Za-z]+)\*/g, "(?:/.*)?")
        .replace(/:([A-Za-z]+)/g, "[^/]+")
        .replace(/\//g, "\\/");
      return { group, matches: new RegExp(`^${pattern}$`).test(pathname) };
    })
    .filter((entry) => entry.matches);

  // Next applies the most specific matching rule; so does this.
  const best = matches.sort(
    (a, b) => b.group.source.length - a.group.source.length,
  )[0];
  return best?.group.headers ?? [];
}

describe("robots", () => {
  it("keeps wish pages and the dashboard out of the crawl", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;

    expect(rules?.disallow).toContain("/w/");
    expect(rules?.disallow).toContain("/dashboard");
    expect(rules?.disallow).toContain("/api");
    expect(config.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});

describe("sitemap", () => {
  it("lists the public pages and every occasion", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls.some((url) => url.endsWith("/templates"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/pricing"))).toBe(true);
    expect(urls).toHaveLength(
      urls.filter((url) => !url.includes("/occasions/")).length +
        OCCASIONS.length,
    );
  });

  it("never contains a private route", () => {
    for (const entry of sitemap()) {
      expect(entry.url).not.toMatch(/\/w\//);
      expect(entry.url).not.toMatch(/\/manage\//);
      expect(entry.url).not.toMatch(/\/dashboard/);
      expect(entry.url).not.toMatch(/\/c\//);
    }
  });
});

describe("/w/* indexing", () => {
  it("sends X-Robots-Tag: noindex, nofollow", async () => {
    const headers = await headersFor("/w/demo-midnight");
    const tag = headers.find(
      (header) => header.key.toLowerCase() === "x-robots-tag",
    );

    expect(tag?.value).toBe("noindex, nofollow");
  });

  it("also covers nested reveal pages", async () => {
    const headers = await headersFor("/w/abc123/reveal");
    expect(
      headers.some(
        (header) =>
          header.key.toLowerCase() === "x-robots-tag" &&
          header.value.includes("noindex"),
      ),
    ).toBe(true);
  });

  it("adds a matching meta robots tag for the whole /w tree", () => {
    const robotsMeta = wishLayoutMetadata.robots;
    expect(robotsMeta).toMatchObject({ index: false, follow: false });
  });

  it("keeps contributor links and manage pages out of indexes too", async () => {
    for (const path of ["/c/some-token", "/manage/some-token"]) {
      const headers = await headersFor(path);
      expect(
        headers.some((header) => header.key.toLowerCase() === "x-robots-tag"),
        `${path} should send X-Robots-Tag`,
      ).toBe(true);
    }
  });
});
