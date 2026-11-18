import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

async function source(relative: string): Promise<string> {
  return readFile(path.join(ROOT, relative), "utf8");
}

describe("wish link previews", () => {
  it("titles the preview with the receiver's name when there is one", async () => {
    const page = await source("app/w/[id]/page.tsx");

    expect(page).toContain("A wish is waiting for you");
    expect(page).toContain("receiverName");
    // The generic title is the fallback, not the only option.
    expect(page).toMatch(/receiver[\s\S]{0,80}A wish is waiting for you/);
  });

  it("never puts private content in the preview", async () => {
    const page = await source("app/w/[id]/page.tsx");
    const metaBlock = page.slice(
      page.indexOf("generateMetadata"),
      page.indexOf("export default"),
    );

    // The metadata function may read the receiver's name and nothing else.
    expect(metaBlock).not.toContain("passwordHint");
    expect(metaBlock).not.toContain("wish.message");
    expect(metaBlock).not.toContain("wish.title");
    expect(metaBlock).not.toContain("wish.mediaKeys");
    expect(metaBlock).not.toContain("wish.quizQuestion");
    expect(metaBlock).not.toContain("wish.category");
    expect(metaBlock).not.toContain("wish.unlockAt");
  });

  it("keeps crawlers out and points at the privacy-safe image", async () => {
    const page = await source("app/w/[id]/page.tsx");

    expect(page).toContain("opengraph-image");
    expect(page).toContain("index: false");
    expect(page).toContain("follow: false");
    expect(page).toContain("card: \"summary_large_image\"");
  });

  it("uses an image route that renders a locked box, not wish content", async () => {
    const image = await source("app/w/[id]/opengraph-image.tsx");

    expect(image).toContain("A locked gift box from Wishly");
    expect(image).not.toContain("receiverName");
    expect(image).not.toContain("message");
  });
});

describe("404 page", () => {
  it("exists and is not indexable", async () => {
    const page = await source("app/not-found.tsx");

    expect(page).toContain("This page isn&apos;t here.");
    expect(page).toContain("index: false");
    expect(page).toContain('href="/"');
    expect(page).toContain('href="/create"');
  });

  it("explains why a wish link may not open", async () => {
    const page = await source("app/not-found.tsx");
    expect(page).toMatch(/deleted or\s+expired/i);
  });
});
