import { describe, expect, it } from "vitest";
import { CANVA_VIDEO_TEMPLATES } from "@/lib/catalog/canva-videos";
import { getStudioTemplate } from "@/lib/catalog/studio-templates";
import { TEMPLATES } from "@/lib/catalog/templates";

describe("studio template lookup", () => {
  it("opens Canva video templates from the same id space", () => {
    const first = CANVA_VIDEO_TEMPLATES[0];
    expect(first).toBeDefined();
    if (!first) return;

    const studio = getStudioTemplate(first.id);
    expect(studio?.id).toBe(first.id);
    expect(studio?.title).toBe(first.title);
    expect(studio?.thumb).toBe(first.thumb);
    expect(studio?.category).toBe(first.category);
  });

  it("opens every Wishly page look with its own palette", () => {
    for (const page of TEMPLATES) {
      const studio = getStudioTemplate(page.id);
      expect(studio, page.id).not.toBeNull();
      expect(studio?.categoryName).toBe("Wishly");
      expect(studio?.aspect_ratio).toBe("16:9");
      expect(studio?.thumb).toBeUndefined();
      expect(studio?.palette).toEqual({
        from: page.preview.from,
        to: page.preview.to,
        accent: page.palette.accent,
      });
    }
  });

  it("returns null for unknown ids", () => {
    expect(getStudioTemplate("not-a-template")).toBeNull();
  });
});
