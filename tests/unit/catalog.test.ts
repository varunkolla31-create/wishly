import { describe, expect, it } from "vitest";
import { OCCASIONS, getOccasion } from "@/lib/catalog/occasions";
import { MUSIC_TRACKS, getMusicTrack } from "@/lib/catalog/music";
import { TEMPLATES, getTemplate } from "@/lib/catalog/templates";

describe("occasion catalog", () => {
  it("has unique slugs", () => {
    const slugs = OCCASIONS.map((occasion) => occasion.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves every occasion by slug", () => {
    for (const occasion of OCCASIONS) {
      expect(getOccasion(occasion.slug)?.name).toBe(occasion.name);
    }
    expect(getOccasion("not-a-real-occasion")).toBeNull();
  });

  it("points every occasion at an existing template and music track", () => {
    for (const occasion of OCCASIONS) {
      const template = getTemplate(occasion.defaultTemplateId);
      expect(template, occasion.slug).not.toBeNull();
      expect(getMusicTrack(occasion.defaultMusicId), occasion.slug).not.toBeNull();
    }
  });

  it("keeps calm occasions calm: calm template and no confetti", () => {
    const calmOccasions = OCCASIONS.filter(
      (occasion) => occasion.tone === "calm",
    );

    expect(calmOccasions.length).toBeGreaterThan(0);

    for (const occasion of calmOccasions) {
      const template = getTemplate(occasion.defaultTemplateId);
      expect(template?.tone, occasion.slug).toBe("calm");
      expect(template?.confetti, occasion.slug).toBe("none");
    }
  });

  it("ships at least three writing prompts and SEO copy per occasion", () => {
    for (const occasion of OCCASIONS) {
      expect(occasion.prompts.length, occasion.slug).toBeGreaterThanOrEqual(3);
      expect(occasion.blurb.length).toBeGreaterThan(20);
      expect(occasion.seoTitle.length).toBeGreaterThan(5);
      expect(occasion.seoDescription.length).toBeGreaterThan(20);
    }
  });
});

describe("template catalog", () => {
  it("has unique ids and the eight promised templates", () => {
    const ids = TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(8);
  });

  it("only uses calm templates for calm content", () => {
    for (const template of TEMPLATES) {
      if (template.confetti === "none") {
        expect(template.tone).toBe("calm");
      }
    }
  });
});

describe("music catalog", () => {
  it("has unique ids and resolvable files", () => {
    const ids = MUSIC_TRACKS.map((track) => track.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const track of MUSIC_TRACKS) {
      expect(track.file.startsWith("/music/")).toBe(true);
      expect(getMusicTrack(track.id)?.title).toBe(track.title);
    }
    expect(getMusicTrack(null)).toBeNull();
  });

  it("ships the eight promised tracks", () => {
    expect(MUSIC_TRACKS).toHaveLength(8);
  });

  it("has a track for every template music mood", () => {
    const moods = new Set(MUSIC_TRACKS.map((track) => track.mood));

    for (const template of TEMPLATES) {
      expect(moods.has(template.musicMood), template.id).toBe(true);
    }
  });
});
