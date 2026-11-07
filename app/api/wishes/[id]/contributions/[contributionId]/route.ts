import { revalidatePath } from "next/cache";
import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { contributionRepo, mediaStore } from "@/lib/repos/index";
import { contributionStatusSchema } from "@/lib/validation/contribution";
import { toSenderContributions } from "@/lib/wishes/contributions-dto";

export const runtime = "nodejs";

export function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; contributionId: string }> },
) {
  return route(async () => {
    const { id, contributionId } = await context.params;
    await getOwnedWish(id);

    const { status } = await readJson(request, contributionStatusSchema);
    const updated = await contributionRepo().updateStatus(
      id,
      contributionId,
      status,
    );

    if (!updated) {
      throw new HttpError(404, "not_found", "That contribution is gone.");
    }

    revalidatePath(`/dashboard/wishes/${id}/collect`);
    return ok((await toSenderContributions([updated]))[0]);
  });
}

export function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; contributionId: string }> },
) {
  return route(async () => {
    const { id, contributionId } = await context.params;
    await getOwnedWish(id);

    const existing = await contributionRepo().getById(id, contributionId);
    if (!existing) {
      throw new HttpError(404, "not_found", "That contribution is gone.");
    }

    const removed = await contributionRepo().delete(id, contributionId);
    if (!removed) {
      throw new HttpError(404, "not_found", "That contribution is gone.");
    }

    if (existing.mediaKey) {
      try {
        await mediaStore().delete(existing.mediaKey);
      } catch {
        console.error("[media] failed to delete one contribution object");
      }
    }

    revalidatePath(`/dashboard/wishes/${id}/collect`);
    return ok({ deleted: true });
  });
}
