import { describe, expect, it } from "vitest";
import {
  CANVA_VIDEO_CATEGORIES,
  CANVA_VIDEO_TEMPLATES,
} from "@/lib/catalog/canva-videos";

const ASPECTS = new Set(["16:9", "9:16", "1:1"]);
const TIERS = new Set(["FREE", "PRO"]);

describe("canva video catalog", () => {
  it("ships a meaningful catalog", () => {
    expect(CANVA_VIDEO_TEMPLATES.length).toBeGreaterThanOrEqual(150);
    expect(CANVA_VIDEO_CATEGORIES.length).toBeGreaterThanOrEqual(10);
  });

  it("has unique template ids and unique category keys", () => {
    const ids = CANVA_VIDEO_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);

    const keys = CANVA_VIDEO_CATEGORIES.map((category) => category.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses valid aspect ratios and plan tiers", () => {
    for (const template of CANVA_VIDEO_TEMPLATES) {
      expect(ASPECTS.has(template.aspect_ratio), template.id).toBe(true);
      expect(TIERS.has(template.plan_tier), template.id).toBe(true);
    }
  });

  it("links every template to canva.com and a Canva-hosted preview", () => {
    for (const template of CANVA_VIDEO_TEMPLATES) {
      expect(template.url.startsWith("https://www.canva.com/templates/")).toBe(
        true,
      );
      expect(template.url.startsWith(`https://www.canva.com/templates/${template.id}-`)).toBe(
        true,
      );
      expect(template.thumb.startsWith("https://template.canva.com/")).toBe(true);
      expect(template.thumb.endsWith(".jpg")).toBe(true);
      expect(template.title.length).toBeGreaterThan(3);
    }
  });

  it("maps every template to a declared category with matching name", () => {
    const byKey = new Map(
      CANVA_VIDEO_CATEGORIES.map((category) => [category.key, category.name]),
    );

    for (const template of CANVA_VIDEO_TEMPLATES) {
      expect(byKey.get(template.category), template.id).toBe(
        template.categoryName,
      );
    }
  });

  it("gives every declared category templates", () => {
    for (const category of CANVA_VIDEO_CATEGORIES) {
      const count = CANVA_VIDEO_TEMPLATES.filter(
        (template) => template.category === category.key,
      ).length;
      expect(count, category.key).toBeGreaterThanOrEqual(5);
    }
  });
});
