import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { validateUpload } from "@/lib/media/validate";
import { mediaStore } from "@/lib/repos/index";
import { presignSchema } from "@/lib/validation/upload";

export const runtime = "nodejs";

export function POST(request: Request) {
  return route(async () => {
    const input = await readJson(request, presignSchema);
    await getOwnedWish(input.wishId);

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
    const readUrl = await store.createReadUrl(target.key);

    return ok({ ...target, readUrl }, 201);
  });
}
