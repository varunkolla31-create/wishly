import { revalidatePath } from "next/cache";
import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { getMusicTrack } from "@/lib/catalog/music";
import { getOccasion } from "@/lib/catalog/occasions";
import { getTemplate } from "@/lib/catalog/templates";
import { mediaKeyPrefix } from "@/lib/media/validate";
import { toSenderWish } from "@/lib/repos/dto";
import { mediaStore, wishRepo } from "@/lib/repos/index";
import { draftPatchSchema } from "@/lib/validation/draft";
import { modeTransitionPatch } from "@/lib/wishes/mode";
import { deleteWishCascade } from "@/lib/wishes/delete";

export const runtime = "nodejs";

export function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    const { wish } = await getOwnedWish(id);
    const patch = await readJson(request, draftPatchSchema);

    if (patch.category && !getOccasion(patch.category)) {
      throw new HttpError(400, "invalid_category", "Pick a supported occasion.");
    }
    if (patch.templateId && !getTemplate(patch.templateId)) {
      throw new HttpError(400, "invalid_template", "Pick a supported template.");
    }
    if (patch.musicId && !getMusicTrack(patch.musicId)) {
      throw new HttpError(400, "invalid_music", "Pick a supported track.");
    }

    if (patch.mediaKeys) {
      const prefix = mediaKeyPrefix(id);
      for (const key of patch.mediaKeys) {
        if (!key.startsWith(prefix)) {
          throw new HttpError(
            400,
            "invalid_media_key",
            "That media does not belong to this wish.",
          );
        }
      }
    }

    const { mode, ...rest } = patch;
    const effective: typeof patch =
      mode === undefined ? rest : { ...rest, ...modeTransitionPatch(wish, mode) };

    const updated = await wishRepo().update(id, effective);
    if (!updated) {
      throw new HttpError(404, "not_found", "That wish could not be found.");
    }

    if (patch.mediaKeys) {
      const removed = wish.mediaKeys.filter(
        (key) => !patch.mediaKeys?.includes(key),
      );
      const store = mediaStore();
      await Promise.all(
        removed.map(async (key) => {
          try {
            await store.delete(key);
          } catch {
            console.error("[media] failed to delete one removed object");
          }
        }),
      );
    }

    revalidatePath("/dashboard");

    return ok(toSenderWish(updated));
  });
}

export function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    const { wish } = await getOwnedWish(id);

    await deleteWishCascade(wish);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/replies");

    return ok({ deleted: true });
  });
}
