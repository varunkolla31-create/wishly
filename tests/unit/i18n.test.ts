import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, locale, t } from "@/lib/i18n";
import { en } from "@/lib/i18n/en";

describe("i18n", () => {
  it("falls back to English when no locale is configured", () => {
    const previous = process.env.NEXT_PUBLIC_LOCALE;
    delete process.env.NEXT_PUBLIC_LOCALE;

    expect(locale()).toBe(DEFAULT_LOCALE);
    expect(t("reveal.action")).toBe("Unwrap it");

    process.env.NEXT_PUBLIC_LOCALE = previous;
  });

  it("ignores a locale it has no dictionary for", () => {
    const previous = process.env.NEXT_PUBLIC_LOCALE;
    process.env.NEXT_PUBLIC_LOCALE = "xx";

    expect(locale()).toBe(DEFAULT_LOCALE);

    process.env.NEXT_PUBLIC_LOCALE = previous;
  });

  it("interpolates placeholders and leaves unknown ones intact", () => {
    expect(t("reveal.heading", { name: "Amma" })).toBe("For Amma.");
    expect(t("reveal.heading", {})).toBe("For {name}.");
  });

  it("keeps the dictionary free of empty strings", () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value.length, key).toBeGreaterThan(0);
    }
  });
});
