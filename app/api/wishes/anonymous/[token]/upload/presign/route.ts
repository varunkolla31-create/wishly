import { fail, HttpError, ok, readJson, route } from "@/lib/api/respond";
import { checkMediaQuota } from "@/lib/media/quota";
import { validateUpload } from "@/lib/media/validate";
import { mediaStore } from "@/lib/repos/index";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { clientIp, hashIp } from "@/lib/security/unlock-guard";
import { isManageToken } from "@/lib/security/manage-token";
import { wishByManageToken } from "@/lib/wishes/anonymous";
import { presignSchema } from "@/lib/validation/upload";

export const runtime = "nodejs";

const UPLOAD_LIMIT = 20;
const UPLOAD_WINDOW_MS = 10 * 60 * 1000;

/**
 * Upload target for an anonymous creator, scoped by the manage token. Returns
 * an upload URL and the key only — no read URL, because the browser already
 * has the local file and the wish is not published yet.
 */
export function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  return route(async () => {
    const { token } = await context.params;
    if (!isManageToken(token)) {
      throw new HttpError(404, "not_found", "That link isn't valid.");
    }

    const wish = await wishByManageToken(token);
    if (!wish) {
      throw new HttpError(404, "not_found", "That link isn't valid.");
    }
    if (wish.status === "published") {
      throw new HttpError(409, "already_published", "This wish is already live.");
    }

    const gate = consumeRateLimit(
      `anon-upload:${hashIp(clientIp(request))}`,
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

    const quota = checkMediaQuota(wish, input.size);
    if (!quota.ok) {
      throw new HttpError(400, "quota_exceeded", quota.reason);
    }

    const target = await mediaStore().createUpload({
      wishId: wish.wishId,
      kind: input.kind,
      contentType: input.contentType,
      size: input.size,
    });

    return ok({ ...target }, 201);
  });
}
