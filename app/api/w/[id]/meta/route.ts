import { HttpError, ok, route } from "@/lib/api/respond";
import { wishRepo } from "@/lib/repos/index";
import { isPublished, toPublicWishMeta } from "@/lib/wishes/public";

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

    const response = ok(toPublicWishMeta(wish));
    response.headers.set("Cache-Control", "no-store");
    return response;
  });
}
