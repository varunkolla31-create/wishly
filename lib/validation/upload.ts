import { z } from "zod";
import { MEDIA_KINDS } from "@/lib/media/validate";

export const presignSchema = z.object({
  wishId: z.string().min(10).max(40),
  kind: z.enum(MEDIA_KINDS),
  contentType: z.string().min(3).max(100),
  size: z.number().int().positive(),
});
