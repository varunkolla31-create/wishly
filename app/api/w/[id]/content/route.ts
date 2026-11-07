import { HttpError, ok, route } from "@/lib/api/respond";
import { wishRepo } from "@/lib/repos/index";
import {
  isPublished,
  isUnlockTimeReached,
  buildWishContent,
} from "@/lib/wishes/public";
import { hasUnlocked } from "@/lib/wishes/unlocked";

export const runtime = "nodejs";

export function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    const wish = await wishRepo().getById(id);

    if (!wish || !isPublished(wish)) {
      throw new HttpError(404, "not_found", "This wish isn't available.");
    }
    if (!isUnlockTimeReached(wish)) {
      throw new HttpError(403, "not_yet", "This wish opens later.");
    }
    if (!(await hasUnlocked(wish))) {
      throw new HttpError(401, "locked", "Unlock this wish first.");
    }

    const response = ok(await buildWishContent(wish));
    response.headers.set("Cache-Control", "no-store");
    return response;
  });
}
