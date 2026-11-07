import { clientKey } from "@/lib/api/request";
import { HttpError, ok, route } from "@/lib/api/respond";
import { getCanvaVideoTemplate } from "@/lib/catalog/canva-videos";
import type { TemplateStatKind } from "@/lib/catalog/ranking";
import { incrementTemplateStat } from "@/lib/repos/video-template-stats";
import { consumeRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const ACTIONS: Record<string, TemplateStatKind> = {
  like: "like",
  share: "share",
  use: "use",
};

export function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  return route(async () => {
    const { id, action } = await params;

    if (!getCanvaVideoTemplate(id)) {
      throw new HttpError(404, "not_found", "That template does not exist.");
    }

    const kind = ACTIONS[action];
    if (!kind) {
      throw new HttpError(404, "not_found", "That action is not supported.");
    }

    const decision = consumeRateLimit(
      `video-template:${kind}:${clientKey(request)}`,
      kind === "use" ? 20 : 40,
      60_000,
    );
    if (!decision.allowed) {
      throw new HttpError(
        429,
        "rate_limited",
        "Too many requests. Try again in a minute.",
      );
    }

    const stats = await incrementTemplateStat(id, kind);
    return ok({ stats });
  });
}
