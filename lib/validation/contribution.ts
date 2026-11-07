import { z } from "zod";
import { isValidMediaKey } from "@/lib/media/validate";

export const CONTRIBUTION_TYPES = ["photo", "video", "voice", "text"] as const;

export const contributionSchema = z
  .object({
    contributorName: z.string().trim().min(1, "Add your name.").max(60),
    type: z.enum(CONTRIBUTION_TYPES),
    mediaKey: z
      .string()
      .refine(isValidMediaKey, "That upload could not be verified.")
      .optional(),
    text: z.string().trim().max(500, "Keep it under 500 characters.").optional(),
  })
  .refine((value) => (value.type === "text" ? Boolean(value.text) : Boolean(value.mediaKey)), {
    message: "Add the thing you want to share.",
    path: ["text"],
  });

export type ContributionInput = z.infer<typeof contributionSchema>;

export const contributionStatusSchema = z.object({
  status: z.enum(["pending", "approved", "hidden"]),
});

export const contributionOrderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).max(200),
});

/** Per-wish ceiling on items still waiting for approval. */
export const MAX_PENDING_CONTRIBUTIONS = 30;
