import { z } from "zod";
import { clientKey } from "@/lib/api/request";
import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { getOccasion } from "@/lib/catalog/occasions";
import { env } from "@/lib/env";
import { consumeRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const MODEL_FALLBACKS = [
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash",
];

const generateSchema = z.object({
  occasion: z.string().trim().max(60).optional().default("birthday"),
  recipientName: z.string().trim().max(80).optional(),
  senderName: z.string().trim().max(80).optional(),
  promptHint: z.string().trim().max(1000).optional(),
  tone: z
    .enum(["romantic", "emotional", "funny", "poetic", "warm"])
    .default("warm"),
  length: z.enum(["shorter", "longer"]).optional(),
  baseMessage: z.string().trim().max(4000).optional(),
});

type GenerateInput = z.infer<typeof generateSchema>;

function buildSystemInstruction() {
  return [
    "You are Wishly's wish-writing assistant.",
    "Write heartfelt, human-sounding messages for a private wish page that someone unlocks like a gift.",
    'Avoid generic AI phrases such as "in this digital age", "I hope this message finds you well" and "as an AI".',
    "Do not use markdown, headings, hashtags or meta commentary.",
    "Each message should be 2 to 3 short sentences (or 2 short paragraphs) and under 500 characters.",
    "Use the recipient's name naturally when it is provided.",
    "Be specific to the occasion, the requested tone and the sender's details.",
    'Return JSON only: {"messages": ["...", "...", "..."]} with exactly 3 distinct variations.',
  ].join(" ");
}

function buildPrompt(input: GenerateInput, occasionName: string): string {
  const lines = [
    `Occasion: ${occasionName}`,
    `Recipient: ${input.recipientName?.trim() || "them"}`,
    `Sender: ${input.senderName?.trim() || "someone who cares"}`,
    `Tone: ${input.tone}`,
    `Details from the sender: ${
      input.promptHint?.trim() ||
      "No extra details. Keep it universal and personal."
    }`,
  ];

  if (input.length && input.baseMessage) {
    lines.push(
      `Rewrite the base message so it is ${input.length}, keeping its facts and voice.`,
    );
    lines.push(`Base message: ${input.baseMessage}`);
  }

  lines.push("Write the 3 wish messages now.");
  return lines.join("\n");
}

function parseMessages(text: string | undefined): string[] {
  if (!text) return [];

  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const candidates = new Set<string>([cleaned]);
  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) {
    candidates.add(cleaned.slice(objectStart, objectEnd + 1));
  }
  const arrayStart = cleaned.indexOf("[");
  const arrayEnd = cleaned.lastIndexOf("]");
  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    candidates.add(cleaned.slice(arrayStart, arrayEnd + 1));
  }

  for (const candidate of candidates) {
    try {
      let parsed: unknown = JSON.parse(candidate);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);

      let list: unknown[];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && typeof parsed === "object") {
        const record = parsed as { messages?: unknown; message?: unknown };
        let rawMessages = record.messages;
        if (typeof rawMessages === "string") {
          try {
            const inner = JSON.parse(rawMessages) as { messages?: unknown };
            rawMessages = inner.messages ?? rawMessages;
          } catch {
            rawMessages = [rawMessages];
          }
        }
        list = Array.isArray(rawMessages)
          ? rawMessages
          : typeof record.message === "string"
            ? [record.message]
            : [];
      } else {
        list = [];
      }

      const messages = list
        .filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        )
        .map((item) => item.trim().slice(0, 4000))
        .slice(0, 3);

      if (messages.length > 0) return messages;
    } catch {
      // Try the next candidate.
    }
  }

  return cleaned ? [cleaned.slice(0, 4000)] : [];
}

function isModelError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (/api key|invalid key|permission|unauth|401|403/i.test(message)) {
    return false;
  }
  return /not found|no longer available|not_found|internal|500|503|unavailable|high demand|unsupported|timeout|aborted|deadline|quota|resource_exhausted|429|model/i.test(
    message,
  );
}

async function generateViaSdk(
  apiKey: string,
  model: string,
  systemInstruction: string,
  prompt: string,
): Promise<string | undefined> {
  const { GoogleGenAI, Type } = await import("@google/genai");
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: 20_000 },
  });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.95,
      maxOutputTokens: 3000,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          messages: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["messages"],
      },
    },
  });
  return response.text;
}

async function generateViaRest(
  apiKey: string,
  model: string,
  systemInstruction: string,
  prompt: string,
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.95,
          maxOutputTokens: 3000,
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(20_000),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body.slice(0, 400));
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? ""
  );
}

export function POST(request: Request) {
  return route(async () => {
    const config = env();
    if (!config.GEMINI_API_KEY) {
      throw new HttpError(
        503,
        "ai_unavailable",
        "AI writing isn't configured yet. Add GEMINI_API_KEY to enable it.",
      );
    }

    const limit = consumeRateLimit(
      `ai:write:${clientKey(request)}`,
      8,
      60_000,
    );
    if (!limit.allowed) {
      throw new HttpError(
        429,
        "rate_limited",
        "A little slower — try again in a minute.",
      );
    }

    const input = await readJson(request, generateSchema);
    const occasion = getOccasion(input.occasion);
    const occasionName = occasion?.name ?? "a celebration";
    const systemInstruction = buildSystemInstruction();
    const prompt = buildPrompt(input, occasionName);

    const candidates = [config.GEMINI_MODEL, ...MODEL_FALLBACKS].filter(
      (model): model is string => Boolean(model?.trim()),
    );
    const models = [...new Set(candidates)];

    let text = "";
    let lastError: unknown = null;
    const deadline = Date.now() + 50_000;

    for (const model of models) {
      if (Date.now() > deadline) break;

      try {
        text = (await generateViaSdk(
          config.GEMINI_API_KEY,
          model,
          systemInstruction,
          prompt,
        )) ?? "";
        if (parseMessages(text).length > 0) break;
      } catch (error) {
        lastError = error;
        if (!isModelError(error)) break;
      }

      if (Date.now() > deadline) break;

      try {
        text = await generateViaRest(
          config.GEMINI_API_KEY,
          model,
          systemInstruction,
          prompt,
        );
        if (parseMessages(text).length > 0) break;
      } catch (error) {
        lastError = error;
        if (!isModelError(error)) break;
      }
    }

    const messages = parseMessages(text);
    if (messages.length === 0) {
      console.error(
        "[ai] generate-wish failed:",
        lastError instanceof Error
          ? lastError.message.slice(0, 300)
          : "unknown error",
      );
      throw new HttpError(
        502,
        "ai_failed",
        "The writing assistant is busy. Try again in a moment.",
      );
    }

    return ok({ messages });
  });
}
