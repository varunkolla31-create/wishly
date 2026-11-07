import { z } from "zod";

export const ideaRequestSchema = z.object({
  category: z.string().min(1).max(60),
  relationship: z.string().trim().max(80).default(""),
});
