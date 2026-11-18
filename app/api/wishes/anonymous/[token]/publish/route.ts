import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { isValidMediaKey } from "@/lib/media/validate";
import { wishRepo } from "@/lib/repos/index";
import { isManageToken } from "@/lib/security/manage-token";
import { wishByManageToken } from "@/lib/wishes/anonymous";
import { setWishPassword } from "@/lib/wishes/password";
import { z } from "zod";

export const runtime = "nodejs";

const publishSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  title: z.string().trim().max(120).optional(),
  mediaKeys: z
    .array(z.string().refine(isValidMediaKey, "Invalid media key"))
    .max(20)
    .default([]),
  reelTemplateId: z.string().max(60).nullable().default(null),
  musicId: z.string().max(60).nullable().default(null),
  hint: z.string().trim().max(80).nullable().default(null),
  password: z.string().min(1).max(128),
});

/**
 * Step 2 of an anonymous publish: fills in the content, sets the password and
 * flips the wish to published. Authorised by the manage token, so no account
 * is involved and no owner-scoped route is reachable.
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

    const input = await readJson(request, publishSchema);

    // Media keys must belong to this wish.
    const prefix = `wishes/${wish.wishId}/`;
    if (input.mediaKeys.some((key) => !key.startsWith(prefix))) {
      throw new HttpError(
        400,
        "invalid_media_key",
        "That media does not belong to this wish.",
      );
    }

    const withPassword = await setWishPassword(wish, input.password, input.hint);
    if (!withPassword.ok) {
      throw new HttpError(400, "weak_password", withPassword.message);
    }

    const published = await wishRepo().update(wish.wishId, {
      message: input.message,
      ...(input.title ? { title: input.title } : {}),
      mediaKeys: input.mediaKeys,
      reelTemplateId: input.reelTemplateId,
      musicId: input.musicId,
      status: "published",
    });

    if (!published) {
      throw new HttpError(500, "publish_failed", "Couldn't publish that wish.");
    }

    const origin = new URL(request.url).origin;

    return ok(
      {
        wishId: published.wishId,
        shareUrl: `${origin}/w/${published.wishId}`,
        manageUrl: `${origin}/manage/${token}`,
        expiresAt: published.expiresAt,
      },
      200,
    );
  });
}
