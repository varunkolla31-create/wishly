import { HttpError, fail, ok, readJson, route } from "@/lib/api/respond";
import { clientKey } from "@/lib/api/request";
import { validateUpload } from "@/lib/media/validate";
import { mediaStore } from "@/lib/repos/index";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { presignSchema } from "@/lib/validation/upload";
import { requireContributorWish } from "@/lib/wishes/contributor";

export const runtime = "nodejs";

const UPLOAD_LIMIT = 30;
const UPLOAD_WINDOW_MS = 10 * 60 * 1000;

export function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  return route(async () => {
    const { token } = await context.params;
    const wish = await requireContributorWish(token);

    const gate = consumeRateLimit(
      `contrib-upload:${clientKey(request)}`,
      UPLOAD_LIMIT,
      UPLOAD_WINDOW_MS,
    );
    if (!gate.allowed) {
      const response = fail(
        429,
        "rate_limited",
        "That's a lot of uploads. Try again in a few minutes.",
      );
      response.headers.set(
        "Retry-After",
        String(Math.max(1, Math.ceil(gate.retryAfterMs / 1000))),
      );
      return response;
    }

    const input = await readJson(
      request,
      presignSchema.pick({ kind: true, contentType: true, size: true }),
    );

    const validation = validateUpload(input.kind, input.contentType, input.size);
    if (!validation.ok) {
      throw new HttpError(400, "invalid_upload", validation.reason);
    }

    const store = mediaStore();
    const target = await store.createUpload({
      wishId: wish.wishId,
      kind: input.kind,
      contentType: input.contentType,
      size: input.size,
    });
    const readUrl = await store.createReadUrl(target.key);

    return ok({ ...target, readUrl }, 201);
  });
}
