import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { isValidMediaKey } from "@/lib/media/validate";
import { mediaStore } from "@/lib/repos/index";
import { z } from "zod";

export const runtime = "nodejs";

const confirmSchema = z.object({
  key: z.string().refine(isValidMediaKey, "That upload key is not valid."),
});

/** `wishes/<wishId>/<kind>/<name>.<ext>` — the segment after `wishes/`. */
function wishIdFromKey(key: string): string | null {
  const [, wishId] = key.split("/");
  return wishId ?? null;
}

/**
 * Called by the browser after the direct upload. Nothing is attached to the
 * draft until the object exists, matches its key's type and fits the size cap;
 * a bad object is deleted so the bucket does not accumulate junk.
 */
export function POST(request: Request) {
  return route(async () => {
    const input = await readJson(request, confirmSchema);

    const wishId = wishIdFromKey(input.key);
    if (!wishId) {
      throw new HttpError(400, "invalid_key", "That upload key is not valid.");
    }
    await getOwnedWish(wishId);

    const store = mediaStore();
    const verification = await store.verifyUpload(input.key);

    if (!verification.ok) {
      await store.delete(input.key).catch(() => undefined);

      if (verification.reason === "missing") {
        throw new HttpError(
          404,
          "upload_missing",
          "That upload didn't arrive. Try again.",
        );
      }
      throw new HttpError(
        400,
        verification.reason === "size" ? "upload_too_large" : "upload_type",
        verification.reason === "size"
          ? "That file is too large."
          : "That file type isn't allowed.",
      );
    }

    return ok(
      {
        key: input.key,
        size: verification.size,
        contentType: verification.contentType,
      },
      201,
    );
  });
}
