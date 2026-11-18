import { HttpError, ok, route } from "@/lib/api/respond";
import { isManageToken } from "@/lib/security/manage-token";
import { wishByManageToken } from "@/lib/wishes/anonymous";
import { deleteWishCascade } from "@/lib/wishes/delete";
import { isPublished } from "@/lib/wishes/public";

export const runtime = "nodejs";

interface ManageView {
  wishId: string;
  title: string;
  status: string;
  published: boolean;
  createdAt: string;
  expiresAt: string | null;
  shareUrl: string;
  views: number;
  opened: boolean;
  hasPassword: boolean;
}

function origin(request: Request): string {
  return new URL(request.url).origin;
}

function requireToken(value: string): string {
  if (!isManageToken(value)) {
    throw new HttpError(404, "not_found", "That manage link isn't valid.");
  }
  return value;
}

export function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  return route(async () => {
    const { token } = await context.params;
    const wish = await wishByManageToken(requireToken(token));

    if (!wish) {
      throw new HttpError(404, "not_found", "That manage link isn't valid.");
    }

    const view: ManageView = {
      wishId: wish.wishId,
      title: wish.title || wish.receiverName || "Untitled wish",
      status: wish.status,
      published: isPublished(wish),
      createdAt: wish.createdAt,
      expiresAt: wish.expiresAt,
      shareUrl: `${origin(request)}/w/${wish.wishId}`,
      views: wish.views,
      opened: wish.openedAt !== null,
      hasPassword: wish.passwordHash !== null,
    };

    const response = ok(view);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  });
}

export function DELETE(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  return route(async () => {
    const { token } = await context.params;
    const wish = await wishByManageToken(requireToken(token));

    if (!wish) {
      throw new HttpError(404, "not_found", "That manage link isn't valid.");
    }

    // Same cascade the dashboard uses: contributions, replies, then every
    // media object, then the row.
    await deleteWishCascade(wish);

    return ok({ deleted: true });
  });
}
