import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  defaultMemoryTemplateId,
  getMemoryTemplate,
  MEMORY_TEMPLATES,
  memoryTemplatesForCategory,
} from "@/src/components/three-memory/catalog";
import { OCCASIONS } from "@/lib/catalog/occasions";

describe("3D memory reel catalog", () => {
  it("ships exactly six unique native templates", () => {
    const ids = MEMORY_TEMPLATES.map((template) => template.id);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
    for (const template of MEMORY_TEMPLATES) {
      expect(getMemoryTemplate(template.id)?.name).toBe(template.name);
      expect(template.samplePhotos.length).toBeGreaterThanOrEqual(3);
      expect(template.samplePhotos.length).toBeLessThanOrEqual(10);
    }
    expect(getMemoryTemplate("not-a-template")).toBeNull();
  });

  it("covers every occasion with a filtered reel", () => {
    for (const occasion of OCCASIONS) {
      const matches = memoryTemplatesForCategory(occasion.slug);
      expect(matches.length, occasion.slug).toBeGreaterThan(0);
      expect(matches).toContainEqual(
        expect.objectContaining({
          id: defaultMemoryTemplateId(occasion.slug),
        }),
      );
    }
  });

  it("keeps calm occasions in the calm scene", () => {
    for (const occasion of OCCASIONS.filter((item) => item.tone === "calm")) {
      const template = getMemoryTemplate(defaultMemoryTemplateId(occasion.slug));
      expect(template?.tone, occasion.slug).toBe("calm");
    }
  });

  it("ships every sample photo locally", () => {
    for (const template of MEMORY_TEMPLATES) {
      for (const photo of template.samplePhotos) {
        expect(photo.startsWith("/three-memory/")).toBe(true);
        expect(
          existsSync(
            path.join(process.cwd(), "public", photo.replace(/^\//, "")),
          ),
          photo,
        ).toBe(true);
      }
    }
  });
});
