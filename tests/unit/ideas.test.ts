import { afterEach, describe, expect, it } from "vitest";
import { fallbackIdeas, generateIdeas } from "@/lib/ai/ideas";

describe("idea generation", () => {
  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("returns three fallback ideas for fun occasions", () => {
    const ideas = fallbackIdeas({
      categoryName: "Birthday",
      tone: "fun",
      relationship: "my sister",
    });

    expect(ideas).toHaveLength(3);
    for (const idea of ideas) {
      expect(idea.trim().length).toBeGreaterThan(10);
    }
  });

  it("keeps calm occasions calm", () => {
    const ideas = fallbackIdeas({
      categoryName: "Get Well Soon",
      tone: "calm",
      relationship: "a friend",
    });

    expect(ideas).toHaveLength(3);
    expect(ideas.join(" ")).not.toMatch(/!/);
  });

  it("is deterministic for the same relationship", () => {
    const input = {
      categoryName: "Friendship",
      tone: "fun" as const,
      relationship: "Arun",
    };
    expect(fallbackIdeas(input)).toEqual(fallbackIdeas(input));
  });

  it("uses the local bank when no Gemini key is configured", async () => {
    delete process.env.GEMINI_API_KEY;
    const ideas = await generateIdeas({
      categoryName: "Anniversary",
      tone: "fun",
      relationship: "my partner",
    });
    expect(ideas).toHaveLength(3);
  });
});
