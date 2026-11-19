import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { canNotifySender, notifyWishOpened } from "@/lib/notify";
import { mailConfigured } from "@/lib/email";
import { siteUrl } from "@/lib/config-public";
import { publicEnv } from "@/lib/env-public";
import type { Wish } from "@/lib/repos/types";

const ROOT = process.cwd();

const ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL",
  "NEXT_PUBLIC_VERCEL_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
  "RESEND_API_KEY",
  "EMAIL_FROM",
] as const;

function clearEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

function wish(overrides: Partial<Wish> = {}): Wish {
  return {
    wishId: "wish_1",
    ownerId: "user_1",
    ownerEmail: null,
    mode: "solo",
    category: "birthday",
    templateId: "confetti-pop",
    receiverName: "Amma",
    title: "Happy birthday",
    message: "A letter",
    bonusNote: null,
    milestoneDate: null,
    milestoneLabel: null,
    secretScratchMessage: null,
    giftVoucherCode: null,
    quizQuestion: null,
    quizOptions: null,
    quizAnswerIndex: null,
    quizWrongToast: null,
    gateMode: "password",
    reelTemplateId: null,
    music: null,
    mediaKeys: [],
    musicId: null,
    passwordHash: null,
    passwordHint: null,
    passwordVersion: 1,
    unlockAt: null,
    status: "published",
    contributorToken: null,
    contributorTokenRevokedAt: null,
    manageTokenHash: null,
    expiresAt: null,
    claimedAt: null,
    openedAt: "2026-01-01T00:00:00.000Z",
    views: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("site url", () => {
  afterEach(clearEnv);

  it("prefers NEXT_PUBLIC_SITE_URL so a custom domain is a config change", () => {
    clearEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://wishes.example.com/";
    expect(siteUrl()).toBe("https://wishes.example.com");
  });

  it("falls back to the legacy app url", () => {
    clearEnv();
    process.env.NEXT_PUBLIC_APP_URL = "https://legacy.example.com";
    expect(siteUrl()).toBe("https://legacy.example.com");
  });

  it("falls back to the Vercel production url, then preview", () => {
    clearEnv();
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL = "wishly.vercel.app";
    expect(siteUrl()).toBe("https://wishly.vercel.app");

    clearEnv();
    process.env.NEXT_PUBLIC_VERCEL_URL = "wishly-abc123.vercel.app";
    expect(siteUrl()).toBe("https://wishly-abc123.vercel.app");
  });

  it("reads Vercel's server-side system variables on the server", () => {
    clearEnv();
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "wishly.vercel.app";
    expect(siteUrl()).toBe("https://wishly.vercel.app");

    clearEnv();
    process.env.VERCEL_URL = "wishly-abc123.vercel.app";
    expect(siteUrl()).toBe("https://wishly-abc123.vercel.app");
  });

  it("keeps the public facade on the single resolver", () => {
    clearEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://wishes.example.com/";
    expect(publicEnv.appUrl).toBe(siteUrl());
  });

  it("defaults to localhost", () => {
    clearEnv();
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("is the only resolver: nothing else reads the Vercel vars", async () => {
    clearEnv();
    for (const relative of [
      "app/layout.tsx",
      "app/sitemap.ts",
      "app/robots.ts",
    ]) {
      const body = await readFile(path.join(ROOT, relative), "utf8");
      expect(body, relative).not.toContain("VERCEL_PROJECT_PRODUCTION_URL");
      expect(body, relative).not.toContain("VERCEL_URL");
    }
  });
});

describe("your wish was opened", () => {
  afterEach(clearEnv);

  beforeEach(clearEnv);

  it("is a no-op when no mail provider is configured", () => {
    expect(mailConfigured()).toBe(false);
    expect(canNotifySender()).toBe(false);
  });

  it("is a no-op for an anonymous wish with no address", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.EMAIL_FROM = "wishes@example.com";

    // Must not throw and must not attempt a send without an address.
    await expect(notifyWishOpened(wish({ ownerEmail: null }))).resolves.toBeUndefined();
  });

  it("records only a boolean open event, never who opened it", async () => {
    const repo = await readFile(
      path.join(ROOT, "app/api/w/[id]/unlock/route.ts"),
      "utf8",
    );

    expect(repo).toContain("openedAt");
    expect(repo).toContain("if (wish.openedAt === null)");
    // No IP, user agent or per-visit record anywhere near the open event.
    expect(repo).not.toContain("userAgent");
    expect(repo).not.toContain("openedBy");
  });

  it("tells the sender it was a one-off, not a read receipt", async () => {
    const body = await readFile(path.join(ROOT, "lib/notify.ts"), "utf8");
    expect(body).toMatch(/single yes\/no/);
    expect(body).toMatch(/not who opened it or how often/i);
  });
});

describe("trust pages", () => {
  it("has an FAQ answering the questions the brief asked for", async () => {
    const faq = await readFile(
      path.join(ROOT, "app/(marketing)/faq/page.tsx"),
      "utf8",
    );

    for (const question of [
      "What is a wish?",
      "Is it private?",
      "How do passwords work?",
      "How do I delete a wish?",
      "What does it cost?",
      "Which occasions does it fit?",
    ]) {
      expect(faq, question).toContain(question);
    }
  });

  it("has an About page with a contact route", async () => {
    const about = await readFile(
      path.join(ROOT, "app/(marketing)/about/page.tsx"),
      "utf8",
    );

    expect(about).toContain("contactEmail");
    expect(about).toContain("/report");
  });

  it("lists both in the sitemap and the footer", async () => {
    const sitemap = await readFile(path.join(ROOT, "app/sitemap.ts"), "utf8");
    expect(sitemap).toContain('"/faq"');
    expect(sitemap).toContain('"/about"');

    const footer = await readFile(
      path.join(ROOT, "components/marketing/footer.tsx"),
      "utf8",
    );
    expect(footer).toContain('href: "/faq"');
    expect(footer).toContain('href: "/about"');
  });
});
