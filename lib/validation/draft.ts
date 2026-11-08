import { z } from "zod";
import { isValidMediaKey } from "@/lib/media/validate";
import { musicBindingSchema } from "@/lib/validation/music";

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
  bonusNote: z.string().trim().max(300).nullable().optional(),
  milestoneDate: isoDate.nullable().optional(),
  milestoneLabel: z.string().trim().max(60).nullable().optional(),
  secretScratchMessage: z.string().trim().max(300).nullable().optional(),
  giftVoucherCode: z.string().trim().max(80).nullable().optional(),
  quizQuestion: z.string().trim().max(140).nullable().optional(),
  quizOptions: z
    .array(z.string().trim().min(1).max(60))
    .length(3)
    .nullable()
    .optional(),
  quizAnswerIndex: z.number().int().min(0).max(2).nullable().optional(),
  quizWrongToast: z.string().trim().max(120).nullable().optional(),
  gateMode: z.enum(["password", "quiz", "both"]).optional(),
  reelTemplateId: z.string().max(60).nullable().optional(),
  /** YouTube music binding. Never both this and musicId. */
  music: musicBindingSchema.nullable().optional(),
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
    .regex(/^\d{4,6}$/, "Use 4 to 6 digits."),
  hint: z.string().trim().max(80).optional(),
});
