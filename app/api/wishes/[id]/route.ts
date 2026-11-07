import { revalidatePath } from "next/cache";
import { ok, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { deleteWishCascade } from "@/lib/wishes/delete";

export const runtime = "nodejs";

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
