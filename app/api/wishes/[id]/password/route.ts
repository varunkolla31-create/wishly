import { revalidatePath } from "next/cache";
import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { wishRepo } from "@/lib/repos/index";
import { hashPassword } from "@/lib/security/password";
import { setPasswordSchema } from "@/lib/validation/draft";

export const runtime = "nodejs";

export function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    const { wish } = await getOwnedWish(id);
    const input = await readJson(request, setPasswordSchema);

    const passwordHash = await hashPassword(input.password);
    const updated = await wishRepo().update(id, {
      passwordHash,
      passwordHint: input.hint?.trim() ? input.hint.trim() : null,
      passwordVersion: wish.passwordVersion + 1,
    });

    if (!updated) {
      throw new HttpError(404, "not_found", "That wish could not be found.");
    }

    revalidatePath("/dashboard");

    return ok({
      hasPassword: true,
      passwordVersion: updated.passwordVersion,
    });
  });
}
