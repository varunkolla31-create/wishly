import "server-only";
import type { OccasionTone } from "@/lib/catalog/types";
import { env } from "@/lib/env";

export interface IdeaInput {
  categoryName: string;
  tone: OccasionTone;
  relationship: string;
}

const FALLBACK_IDEAS: Record<OccasionTone, string[]> = {
  fun: [
    "The first time I knew you were going to be trouble, in the best way.",
    "Three things I hope this year hands you, and one I hope it doesn't.",
    "A photo from the day that still makes me laugh.",
    "Something small you do that I never want to forget.",
    "The ordinary Tuesday that I keep coming back to.",
  ],
  calm: [
    "A memory of a quiet, ordinary day with you.",
    "No pressure to reply — I just wanted you to know I'm thinking of you.",
    "Something small that made me think of you today.",
    "A photo from a good afternoon we had.",
  ],
};

function fallbackIdeas(input: IdeaInput): string[] {
  const pool = FALLBACK_IDEAS[input.tone];
  const offset =
    [...input.relationship].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    pool.length;

  return Array.from({ length: Math.min(3, pool.length) }, (_, index) => {
    const idea = pool[(offset + index) % pool.length];
    if (!idea) throw new Error("Empty idea bank.");
    return idea;
  });
}

function buildPrompt(input: IdeaInput): string {
  return [
    `You help someone write a short, warm, specific ${input.categoryName.toLowerCase()} message.`,
    input.relationship
      ? `They are writing to: ${input.relationship}.`
      : "They haven't described the relationship.",
    input.tone === "calm"
      ? "Keep it gentle and unhurried. No jokes, no exclamation marks."
      : "Keep it warm and playful, but not cheesy.",
    "Return exactly 3 ideas as a JSON array of strings.",
    "Each idea is one or two sentences in first person, ready to edit, with no placeholders like [name].",
    "Return JSON only, no markdown.",
  ].join(" ");
}

function extractText(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates)) return null;
  const first = candidates[0];
  if (typeof first !== "object" || first === null) return null;
  const content = (first as { content?: unknown }).content;
  if (typeof content !== "object" || content === null) return null;
  const parts = (content as { parts?: unknown }).parts;
  if (!Array.isArray(parts)) return null;
  const part = parts[0];
  if (typeof part !== "object" || part === null) return null;
  const text = (part as { text?: unknown }).text;
  return typeof text === "string" ? text : null;
}

export async function generateIdeas(input: IdeaInput): Promise<string[]> {
  const config = env();
  if (!config.GEMINI_API_KEY) return fallbackIdeas(input);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      config.GEMINI_MODEL,
    )}:generateContent?key=${encodeURIComponent(config.GEMINI_API_KEY)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
        generationConfig: {
          temperature: 0.9,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) throw new Error("gemini_failed");

    const text = extractText(await response.json());
    if (!text) throw new Error("gemini_empty");

    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error("gemini_shape");

    const ideas = parsed
      .filter((item): item is string => typeof item === "string")
      .map((idea) => idea.trim())
      .filter(Boolean)
      .slice(0, 3);

    return ideas.length > 0 ? ideas : fallbackIdeas(input);
  } catch {
    return fallbackIdeas(input);
  }
}

export { fallbackIdeas };
