import { revalidatePath } from "next/cache";
import { HttpError, ok, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { toSenderWish } from "@/lib/repos/dto";
import { wishRepo } from "@/lib/repos/index";
import { newContributorToken } from "@/lib/security/contributor-token";
import { modeTransitionPatch } from "@/lib/wishes/mode";

export const runtime = "nodejs";

/** Mints a fresh token, or rotates an existing one so old links stop working. */
export function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    const { wish } = await getOwnedWish(id);

    const updated = await wishRepo().update(id, {
      ...modeTransitionPatch(wish, "group"),
      mode: "group",
      contributorToken: newContributorToken(),
      contributorTokenRevokedAt: null,
    });

    if (!updated) {
      throw new HttpError(404, "not_found", "That wish could not be found.");
    }

    revalidatePath(`/dashboard/wishes/${id}/collect`);
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
    await getOwnedWish(id);

    const updated = await wishRepo().update(id, {
      contributorToken: null,
      contributorTokenRevokedAt: new Date().toISOString(),
    });

    if (!updated) {
      throw new HttpError(404, "not_found", "That wish could not be found.");
    }

    revalidatePath(`/dashboard/wishes/${id}/collect`);
    revalidatePath("/dashboard");

    return ok(toSenderWish(updated));
  });
}
