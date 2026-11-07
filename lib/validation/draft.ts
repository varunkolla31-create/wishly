import { z } from "zod";
import { isValidMediaKey } from "@/lib/media/validate";

const isoDate = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Use a valid date and time.",
);

export const draftPatchSchema = z.object({
  category: z.string().min(1).max(60).optional(),
  templateId: z.string().min(1).max(60).optional(),
  mode: z.enum(["solo", "group"]).optional(),
  receiverName: z.string().trim().max(80).optional(),
  title: z.string().trim().max(120).optional(),
  message: z.string().max(4000).optional(),
  mediaKeys: z
    .array(z.string().refine(isValidMediaKey, "Invalid media key"))
    .max(30)
    .refine(
      (keys) => new Set(keys).size === keys.length,
      "The same media was added twice.",
    )
    .optional(),
  musicId: z.string().max(60).nullable().optional(),
  unlockAt: isoDate.nullable().optional(),
});

export type DraftPatch = z.infer<typeof draftPatchSchema>;

export const setPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Use at least 6 characters.")
    .max(128, "Keep it under 128 characters."),
  hint: z.string().trim().max(80).optional(),
});
