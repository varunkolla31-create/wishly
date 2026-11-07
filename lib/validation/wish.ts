import { z } from "zod";

export const createWishSchema = z.object({
  category: z.string().min(1).max(60).default("birthday"),
  templateId: z.string().min(1).max(60).default("clean-white"),
  mode: z.enum(["solo", "group"]).default("solo"),
});
