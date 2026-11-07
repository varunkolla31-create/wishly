import { z } from "zod";

export const unlockSchema = z.object({
  password: z.string().min(1).max(128),
});

export const replySchema = z.object({
  message: z.string().trim().min(1).max(1000),
  emoji: z.string().max(8).default("💛"),
});
