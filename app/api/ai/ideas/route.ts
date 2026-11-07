import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { requireSender } from "@/lib/auth/session";
import { getOccasion } from "@/lib/catalog/occasions";
import { generateIdeas } from "@/lib/ai/ideas";
import { ideaRequestSchema } from "@/lib/validation/ai";

export const runtime = "nodejs";

export function POST(request: Request) {
  return route(async () => {
    await requireSender();
    const input = await readJson(request, ideaRequestSchema);
    const occasion = getOccasion(input.category);

    if (!occasion) {
      throw new HttpError(400, "invalid_category", "Pick a supported occasion.");
    }

    const ideas = await generateIdeas({
      categoryName: occasion.name,
      tone: occasion.tone,
      relationship: input.relationship,
    });

    return ok({ ideas });
  });
}
