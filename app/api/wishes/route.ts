import { revalidatePath } from "next/cache";
import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { requireSender } from "@/lib/auth/session";
import { getOccasion } from "@/lib/catalog/occasions";
import { getTemplate } from "@/lib/catalog/templates";
import { toSenderWish } from "@/lib/repos/dto";
import { wishRepo } from "@/lib/repos/index";
import { createWishSchema } from "@/lib/validation/wish";

export const runtime = "nodejs";

export function POST(request: Request) {
  return route(async () => {
    const sender = await requireSender();
    const input = await readJson(request, createWishSchema);

    const occasion = getOccasion(input.category);
    const template = getTemplate(input.templateId);

    if (!occasion || !template) {
      throw new HttpError(
        400,
        "invalid_catalog",
        "Pick a supported occasion and template.",
      );
    }

    const wish = await wishRepo().create({
      ownerId: sender.userId,
      category: occasion.slug,
      templateId: template.id,
      mode: input.mode,
    });

    revalidatePath("/dashboard");

    return ok(toSenderWish(wish), 201);
  });
}
