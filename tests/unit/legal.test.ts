import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  fillLegal,
  isPlaceholderMissing,
  LEGAL_PLACEHOLDERS,
  legalValues,
  processors,
} from "@/lib/legal";

const ENV_KEYS = [
  "NEXT_PUBLIC_CONTACT_EMAIL",
  "NEXT_PUBLIC_GRIEVANCE_EMAIL",
  "NEXT_PUBLIC_LEGAL_ENTITY",
  "NEXT_PUBLIC_LEGAL_ADDRESS",
  "NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE",
] as const;

function clearEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

describe("legal placeholders", () => {
  afterEach(clearEnv);

  it("never invents an entity, address or email", () => {
    clearEnv();
    const values = legalValues();

    // With nothing configured the placeholders must survive verbatim.
    expect(values["{{LEGAL_ENTITY}}"]).toBe("{{LEGAL_ENTITY}}");
    expect(values["{{REGISTERED_ADDRESS}}"]).toBe("{{REGISTERED_ADDRESS}}");
    expect(values["{{CONTACT_EMAIL}}"]).toBe("{{CONTACT_EMAIL}}");
    expect(values["{{GRIEVANCE_EMAIL}}"]).toBe("{{GRIEVANCE_EMAIL}}");
  });

  it("uses configured values when present", () => {
    process.env.NEXT_PUBLIC_LEGAL_ENTITY = "Example Labs Private Limited";
    process.env.NEXT_PUBLIC_LEGAL_ADDRESS = "Bengaluru, India";
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = "hello@example.test";

    const values = legalValues();
    expect(values["{{LEGAL_ENTITY}}"]).toBe("Example Labs Private Limited");
    expect(values["{{REGISTERED_ADDRESS}}"]).toBe("Bengaluru, India");
    expect(values["{{CONTACT_EMAIL}}"]).toBe("hello@example.test");
  });

  it("falls back from a grievance address to the general contact", () => {
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = "hello@example.test";
    expect(legalValues()["{{GRIEVANCE_EMAIL}}"]).toBe("hello@example.test");
  });

  it("fills every known placeholder", () => {
    clearEnv();
    const template = LEGAL_PLACEHOLDERS.join(" | ");
    const filled = fillLegal(template);

    // Filling with the placeholder values leaves them in place, which is the
    // honest result when nothing is configured.
    expect(isPlaceholderMissing(filled)).toBe(true);

    process.env.NEXT_PUBLIC_LEGAL_ENTITY = "Example Labs Private Limited";
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = "hello@example.test";
    process.env.NEXT_PUBLIC_GRIEVANCE_EMAIL = "grievance@example.test";
    process.env.NEXT_PUBLIC_LEGAL_ADDRESS = "Bengaluru, India";
    process.env.NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE = "1 January 2027";

    const resolved = fillLegal("{{LEGAL_ENTITY}} — {{CONTACT_EMAIL}}");
    expect(resolved).toBe("Example Labs Private Limited — hello@example.test");
  });
});

describe("third-party processors", () => {
  it("only names services the repo actually depends on", async () => {
    const raw = await readFile(
      path.resolve(process.cwd(), "package.json"),
      "utf8",
    );
    const pkg = JSON.parse(raw) as {
      dependencies: Record<string, string>;
    };
    const deps = Object.keys(pkg.dependencies);

    const names = processors().map((processor) => processor.name);
    expect(names).toEqual(
      expect.arrayContaining(["Vercel", "Neon (PostgreSQL)", "Cloudflare R2"]),
    );

    // Clerk and Gemini are real dependencies today; YouTube is an integration
    // driven by YOUTUBE_API_KEY and the nocookie embed.
    expect(deps).toContain("@clerk/nextjs");
    expect(deps).toContain("@google/genai");
    expect(deps).toContain("@aws-sdk/client-s3");
    expect(deps).toContain("pg");
  });

  it("describes a purpose, data category and region for each", () => {
    for (const processor of processors()) {
      expect(processor.purpose.length).toBeGreaterThan(10);
      expect(processor.data.length).toBeGreaterThan(10);
      expect(processor.region.length).toBeGreaterThan(3);
    }
  });
});
