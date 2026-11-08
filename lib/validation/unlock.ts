import { z } from "zod";

export const unlockSchema = z
  .object({
    password: z.string().max(128).optional(),
    answerIndex: z.number().int().min(0).max(2).optional(),
  })
  .refine((value) => value.password !== undefined || value.answerIndex !== undefined, {
    message: "Enter the password or pick an answer.",
  });

export const replySchema = z.object({
  message: z.string().trim().min(1).max(1000),
  emoji: z.string().max(8).default("💛"),
});
