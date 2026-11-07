import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { replyRepo, wishRepo } from "@/lib/repos/index";
import { replySchema } from "@/lib/validation/unlock";
import { isPublished, isUnlockTimeReached } from "@/lib/wishes/public";
import { hasUnlocked } from "@/lib/wishes/unlocked";

export const runtime = "nodejs";

export function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    const wish = await wishRepo().getById(id);

    if (!wish || !isPublished(wish)) {
      throw new HttpError(404, "not_found", "This wish isn't available.");
    }
    if (!isUnlockTimeReached(wish) || !(await hasUnlocked(wish))) {
      throw new HttpError(401, "locked", "Unlock this wish first.");
    }

    const input = await readJson(request, replySchema);
    const reply = await replyRepo().create({
      wishId: wish.wishId,
      ownerId: wish.ownerId,
      message: input.message,
      emoji: input.emoji,
    });

    const response = ok({ replyId: reply.replyId });
    response.headers.set("Cache-Control", "no-store");
    return response;
  });
}
