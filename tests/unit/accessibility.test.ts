import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

async function source(relative: string): Promise<string> {
  return readFile(path.join(ROOT, relative), "utf8");
}

describe("accessibility", () => {
  it("never announces the create link twice", async () => {
    const header = await source("components/marketing/header.tsx");

    // Two spans exist for responsive labels, so the accessible name must come
    // from aria-label and both spans must be hidden from assistive tech.
    expect(header).toContain('aria-label="Create a wish"');
    expect(header).toMatch(/aria-hidden="true"\s+className="hidden sm:inline"/);
    expect(header).toMatch(/aria-hidden="true"\s+className="sm:hidden"/);
  });

  it("labels the unlock password field", async () => {
    const lock = await source("components/receiver/lock-screen.tsx");

    expect(lock).toMatch(/htmlFor="wish-password"[\s\S]{0,80}Password/);
    expect(lock).toContain('id="wish-password"');
    // The error must be announced and tied to the input.
    expect(lock).toContain('role="alert"');
    expect(lock).toContain("aria-describedby");
    expect(lock).toContain("aria-invalid");
  });

  it("gives the unlock button an accessible name in every state", async () => {
    const lock = await source("components/receiver/lock-screen.tsx");

    // The label changes (Unlock / Unlocking… / Try again in Ns) but the button is
    // always a submit inside a labelled form.
    expect(lock).toContain('type="submit"');
    expect(lock).toMatch(/t\("lock\.action"\)/);
  });

  it("keeps one h1 per rendered branch on the wish lock screen", async () => {
    const lock = await source("components/receiver/lock-screen.tsx");
    const h1Count = (lock.match(/<h1/g) ?? []).length;

    // Two exist, one in the countdown branch and one in the unlock branch, and
    // they are mutually exclusive.
    expect(h1Count).toBe(2);
    expect(lock).toContain('key="waiting"');
    expect(lock).toContain('key="unlock"');
  });

  it("exposes visible focus rings through a shared token", async () => {
    const css = await source("app/globals.css");
    expect(css).toContain("focus-visible");
  });

  it("announces the countdown politely instead of constantly", async () => {
    const lock = await source("components/receiver/lock-screen.tsx");
    // A per-second live region would be unusable; the timer itself is aria-label
    // and a single status line summarises it.
    expect(lock).toContain('aria-live="polite"');
    expect(lock).toContain('className="sr-only"');
  });

  it("keeps the skip link on every marketing page", async () => {
    const layout = await source("app/(marketing)/layout.tsx");
    expect(layout).toContain('href="#main"');
    expect(layout).toContain("Skip to content");
  });
});
