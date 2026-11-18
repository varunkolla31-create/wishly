import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { mediaProxyUrl } from "@/lib/media/read-url";
import { validateUpload } from "@/lib/media/validate";
import { mediaStore } from "@/lib/repos/index";
import { presignSchema } from "@/lib/validation/upload";

export const runtime = "nodejs";

export function POST(request: Request) {
  return route(async () => {
    const input = await readJson(request, presignSchema);
    const { wish } = await getOwnedWish(input.wishId);

    const validation = validateUpload(
      input.kind,
      input.contentType,
      input.size,
    );
    if (!validation.ok) {
      throw new HttpError(400, "invalid_upload", validation.reason);
    }

    const store = mediaStore();
    const target = await store.createUpload(input);
    // Preview URL for the wizard. It goes through /api/media, which re-checks
    // ownership, rather than exposing a raw storage link in the browser.
    const readUrl = mediaProxyUrl(target.key, wish.passwordVersion);

    return ok({ ...target, readUrl }, 201);
  });
}
