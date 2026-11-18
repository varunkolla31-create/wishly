import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

async function source(relative: string): Promise<string> {
  return readFile(path.join(ROOT, relative), "utf8");
}

describe("create flow order", () => {
  it("orders the steps Occasion → Words → Photos → 3D Reel → Lock", async () => {
    const wizard = await source("components/wizard/guest-wizard.tsx");
    const match = /const STEPS = \[([^\]]+)\] as const/.exec(wizard);

    expect(match).not.toBeNull();
    const steps = (match?.[1] ?? "")
      .split(",")
      .map((step) => step.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);

    expect(steps).toEqual(["Occasion", "Words", "Photos", "3D Reel", "Lock"]);
  });

  it("renders each step block at its new index", async () => {
    const wizard = await source("components/wizard/guest-wizard.tsx");

    // Words is index 1 and is the step that contains the message field.
    const wordsBlock = /\{step === 1 \? \(\s*<div>[\s\S]*?Give it the words\./.test(
      wizard,
    );
    expect(wordsBlock).toBe(true);

    // The reel picker moved to index 3.
    const reelBlock = /\{step === 3 \? \(\s*<TemplateStep/.test(wizard);
    expect(reelBlock).toBe(true);

    // Photos stays at index 2.
    expect(/\{step === 2 \? \(\s*<div>/.test(wizard)).toBe(true);

    // Lock is still last.
    expect(/\{step === 4 \? \(\s*<div>/.test(wizard)).toBe(true);
  });

  it("sends an incomplete publish back to the Words step, not a stale index", async () => {
    const wizard = await source("components/wizard/guest-wizard.tsx");
    const jumps = [...wizard.matchAll(/setStep\((\d+)\)/g)].map((match) =>
      Number(match[1]),
    );

    // No jump may target index 3 for the "add a message" path any more.
    expect(jumps).not.toContain(3);
  });

  it("keeps ?occasion= and ?reel= wired through to the wizard", async () => {
    const page = await source("app/(marketing)/create/page.tsx");
    expect(page).toContain("initialOccasion={occasion");
    expect(page).toContain("initialReelId={reel");
    expect(page).toContain("initialTemplateId={template");

    const wizard = await source("components/wizard/guest-wizard.tsx");
    // The params are applied on mount, after any stored draft.
    expect(wizard).toContain("initialReelId ? { reelTemplateId: initialReelId }");
    expect(wizard).toContain("initialOccasion");
    expect(wizard).toContain("getOccasion(initialOccasion)");
  });
});

describe("draft autosave", () => {
  it("persists the draft on every change and restores it on mount", async () => {
    const wizard = await source("components/wizard/guest-wizard.tsx");

    expect(wizard).toContain("localStorage.setItem(DRAFT_KEY");
    expect(wizard).toContain("localStorage.getItem(DRAFT_KEY)");
    expect(wizard).toContain("localStorage.setItem(STEP_KEY");
    expect(wizard).toContain("localStorage.getItem(STEP_KEY)");
  });

  it("versioned the draft keys so an old order cannot resume wrongly", async () => {
    const wizard = await source("components/wizard/guest-wizard.tsx");
    expect(wizard).toContain('"wishly_guest_draft_v2"');
    expect(wizard).toContain('"wishly_guest_step_v2"');
  });
});

describe("group wishes on the homepage", () => {
  it("explains group wishes and only what the code supports", async () => {
    const page = await source("app/(marketing)/page.tsx");

    expect(page).toContain("One wish, everyone&apos;s memories.");
    expect(page).toContain("contributor link");
    // Honest limitation: contributor links need an account.
    expect(page).toContain("wishes saved to an account");
  });

  it("does not promise a feature the code lacks", async () => {
    const page = await source("app/(marketing)/page.tsx");
    // There is no group flow in the anonymous wizard, so the copy must not
    // claim "no sign-in at all" for group wishes.
    expect(page).not.toMatch(/group wish[^.]*no sign-?in[^.]*at all/i);
  });
});
