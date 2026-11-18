import { revalidatePath } from "next/cache";
import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { setPasswordSchema } from "@/lib/validation/draft";
import { setWishPassword } from "@/lib/wishes/password";

export const runtime = "nodejs";

export function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    const { wish } = await getOwnedWish(id);
    const input = await readJson(request, setPasswordSchema);

    const result = await setWishPassword(wish, input.password, input.hint);
    if (!result.ok) {
      throw new HttpError(400, "weak_password", result.message);
    }

    revalidatePath("/dashboard");

    return ok({
      hasPassword: true,
      passwordVersion: result.wish.passwordVersion,
    });
  });
}
