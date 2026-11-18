import { fail, HttpError, ok, readJson, route } from "@/lib/api/respond";
import { getOccasion } from "@/lib/catalog/occasions";
import { getTemplate } from "@/lib/catalog/templates";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/unlock-guard";
import { createAnonymousWish } from "@/lib/wishes/anonymous";
import { z } from "zod";

export const runtime = "nodejs";

/** Anonymous creation is the one write a stranger can make; keep it tight. */
const CREATE_LIMIT = 5;
const CREATE_WINDOW_MS = 60 * 60 * 1000;

const anonymousDraftSchema = z.object({
  category: z.string().min(1).max(60).default("birthday"),
  templateId: z.string().min(1).max(60),
  receiverName: z.string().trim().max(80).default(""),
  title: z.string().trim().max(120).default(""),
});

/**
 * Step 1 of an anonymous publish: creates a draft and returns the one-time
 * manage token. The token then authorises uploading media and publishing, so
 * the creator never needs an account and never needs an owner session.
 */
export function POST(request: Request) {
  return route(async () => {
    const gate = consumeRateLimit(
      `anon-create:${clientIp(request)}`,
      CREATE_LIMIT,
      CREATE_WINDOW_MS,
    );
    if (!gate.allowed) {
      const response = fail(
        429,
        "rate_limited",
        "That's a few wishes in a row. Try again a little later.",
      );
      response.headers.set(
        "Retry-After",
        String(Math.max(1, Math.ceil(gate.retryAfterMs / 1000))),
      );
      return response;
    }

    const input = await readJson(request, anonymousDraftSchema);

    const occasion = getOccasion(input.category);
    const template = getTemplate(input.templateId);
    if (!occasion || !template) {
      throw new HttpError(
        400,
        "invalid_catalog",
        "Pick a supported occasion and template.",
      );
    }

    const { wish, manageToken } = await createAnonymousWish({
      category: occasion.slug,
      templateId: template.id,
      receiverName: input.receiverName,
      title: input.title,
    });

    const origin = new URL(request.url).origin;

    return ok(
      {
        wishId: wish.wishId,
        manageToken,
        manageUrl: `${origin}/manage/${manageToken}`,
        expiresAt: wish.expiresAt,
      },
      201,
    );
  });
}
