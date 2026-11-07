import { z } from "zod";

const httpsUrl = z.string().refine((value) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}, "Use an https URL.");

export const musicBindingSchema = z.object({
  provider: z.literal("youtube"),
  videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/, "Use a YouTube video id."),
  title: z.string().trim().min(1).max(200),
  channel: z.string().trim().max(120),
  thumbnailUrl: httpsUrl,
  sourceUrl: httpsUrl,
  durationSeconds: z.number().int().min(0).max(86_400),
  startAtSeconds: z.number().int().min(0).max(86_400).nullable(),
});

export type MusicBindingInput = z.infer<typeof musicBindingSchema>;

export const musicSearchQuerySchema = z.object({
  q: z.string().trim().min(1, "Type something to search.").max(200),
});

export const musicResolveSchema = z.object({
  url: z.string().trim().min(1).max(2048),
});
