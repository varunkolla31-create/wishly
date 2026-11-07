import { revalidatePath } from "next/cache";
import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { contributionRepo } from "@/lib/repos/index";
import { contributionOrderSchema } from "@/lib/validation/contribution";
import { toSenderContributions } from "@/lib/wishes/contributions-dto";

export const runtime = "nodejs";

export function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    await getOwnedWish(id);

    const items = await contributionRepo().listByWish(id);
    const response = ok(await toSenderContributions(items));
    response.headers.set("Cache-Control", "no-store");
    return response;
  });
}

export function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    await getOwnedWish(id);

    const { orderedIds } = await readJson(request, contributionOrderSchema);
    const existing = await contributionRepo().listByWish(id);
    const known = new Set(existing.map((item) => item.contributionId));

    if (orderedIds.some((candidate) => !known.has(candidate))) {
      throw new HttpError(
        400,
        "invalid_order",
        "That order references a contribution that isn't here.",
      );
    }

    await contributionRepo().reorder(id, orderedIds);
    revalidatePath(`/dashboard/wishes/${id}/collect`);

    const items = await contributionRepo().listByWish(id);
    return ok(await toSenderContributions(items));
  });
}
