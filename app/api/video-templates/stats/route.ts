import { ok, route } from "@/lib/api/respond";
import { listTemplateStats } from "@/lib/repos/video-template-stats";

export const runtime = "nodejs";

export function GET() {
  return route(async () => ok({ stats: await listTemplateStats() }));
}
