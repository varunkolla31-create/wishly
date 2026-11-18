import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { OCCASIONS, getOccasion } from "@/lib/catalog/occasions";

const ROOT = process.cwd();

describe("occasion sample content", () => {
  it("gives every occasion its own sample title", () => {
    const titles = OCCASIONS.map((occasion) => occasion.sample.title);
    expect(new Set(titles).size).toBe(OCCASIONS.length);
  });

  it("gives every occasion its own sample note", () => {
    const notes = OCCASIONS.map((occasion) => occasion.sample.note);
    expect(new Set(notes).size).toBe(OCCASIONS.length);
  });

  it("gives every occasion its own alternate headline", () => {
    const titles = OCCASIONS.map((occasion) => occasion.sample.altTitle);
    expect(new Set(titles).size).toBe(OCCASIONS.length);
  });

  it("no longer repeats 'For you, always' across occasions", () => {
    const repeated = OCCASIONS.filter(
      (occasion) => occasion.sample.title === "For you, always",
    );
    expect(repeated).toHaveLength(0);
  });

  it("writes festival pages differently from each other", () => {
    const pongal = getOccasion("pongal");
    const diwali = getOccasion("diwali");
    const eid = getOccasion("eid");

    expect(pongal?.sample.title).toContain("Pongal");
    expect(diwali?.sample.title).toContain("Diwali");
    expect(eid?.sample.title).toContain("Eid");

    const titles = [pongal, diwali, eid].map((item) => item?.sample.title);
    expect(new Set(titles).size).toBe(3);
  });

  it("never promises confetti on a calm occasion", () => {
    for (const occasion of OCCASIONS.filter((item) => item.tone === "calm")) {
      const text = `${occasion.sample.title} ${occasion.sample.note} ${occasion.sample.altTitle}`.toLowerCase();
      // "no confetti" is fine; promising it is not.
      const promises = /confetti/.test(text) && !/no confetti/.test(text);
      expect(promises, occasion.slug).toBe(false);
    }
  });
});

describe("occasion page wiring", () => {
  it("links back to /occasions, not the homepage", async () => {
    const page = await readFile(
      path.join(ROOT, "app/(marketing)/occasions/[slug]/page.tsx"),
      "utf8",
    );

    const backLink = /href="(\/[^"]*)"\s*\n?\s*className="text-sm text-ink-muted[^"]*"[\s\S]{0,80}All occasions/.exec(
      page,
    );
    expect(backLink?.[1]).toBe("/occasions");
  });

  it("renders the occasion sample instead of a generic title", async () => {
    const page = await readFile(
      path.join(ROOT, "app/(marketing)/occasions/[slug]/page.tsx"),
      "utf8",
    );

    expect(page).toContain("occasion.sample.title");
    expect(page).toContain("occasion.sample.note");
    expect(page).toContain("occasion.sample.altTitle");
    expect(page).not.toContain("For ${occasion.name.toLowerCase()}");
  });
});
