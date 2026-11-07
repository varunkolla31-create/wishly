import { revalidatePath } from "next/cache";
import { HttpError, ok, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { toSenderWish } from "@/lib/repos/dto";
import { wishRepo } from "@/lib/repos/index";

export const runtime = "nodejs";

export function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    const { wish } = await getOwnedWish(id);

    if (!wish.receiverName.trim()) {
      throw new HttpError(
        400,
        "missing_receiver",
        "Add their name before publishing.",
      );
    }
    if (!wish.message.trim()) {
      throw new HttpError(
        400,
        "missing_message",
        "Add a message before publishing.",
      );
    }
    if (!wish.passwordHash) {
      throw new HttpError(
        400,
        "missing_password",
        "Set a password before publishing.",
      );
    }

    const updated = await wishRepo().update(id, { status: "published" });
    if (!updated) {
      throw new HttpError(404, "not_found", "That wish could not be found.");
    }

    revalidatePath("/dashboard");
    revalidatePath(`/w/${id}`);

    return ok(toSenderWish(updated));
  });
}
