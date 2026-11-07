import { HttpError, fail, ok, readJson, route } from "@/lib/api/respond";
import { clientKey } from "@/lib/api/request";
import { mediaKeyPrefix } from "@/lib/media/validate";
import { contributionRepo } from "@/lib/repos/index";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import {
  contributionSchema,
  MAX_PENDING_CONTRIBUTIONS,
} from "@/lib/validation/contribution";
import { requireContributorWish } from "@/lib/wishes/contributor";

export const runtime = "nodejs";

const CONTRIBUTE_LIMIT = 10;
const CONTRIBUTE_WINDOW_MS = 10 * 60 * 1000;

export function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  return route(async () => {
    const { token } = await context.params;
    const wish = await requireContributorWish(token);

    const gate = consumeRateLimit(
      `contrib-send:${clientKey(request)}`,
      CONTRIBUTE_LIMIT,
      CONTRIBUTE_WINDOW_MS,
    );
    if (!gate.allowed) {
      const response = fail(
        429,
        "rate_limited",
        "That's a lot at once. Try again in a few minutes.",
      );
      response.headers.set(
        "Retry-After",
        String(Math.max(1, Math.ceil(gate.retryAfterMs / 1000))),
      );
      return response;
    }

    const input = await readJson(request, contributionSchema);

    if (input.mediaKey && !input.mediaKey.startsWith(mediaKeyPrefix(wish.wishId))) {
      throw new HttpError(400, "invalid_media_key", "That upload does not belong here.");
    }

    const pending = await contributionRepo().listByWish(wish.wishId, "pending");
    if (pending.length >= MAX_PENDING_CONTRIBUTIONS) {
      throw new HttpError(
        409,
        "too_many_pending",
        "This page has plenty waiting already. Try again later.",
      );
    }

    const contribution = await contributionRepo().create({
      wishId: wish.wishId,
      contributorName: input.contributorName,
      type: input.type,
      mediaKey: input.mediaKey ?? null,
      text: input.text ?? null,
      status: "pending",
    });

    return ok(
      {
        contributionId: contribution.contributionId,
        status: contribution.status,
        contributorName: contribution.contributorName,
      },
      201,
    );
  });
}
