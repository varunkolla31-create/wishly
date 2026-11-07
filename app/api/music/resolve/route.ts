import { clientKey } from "@/lib/api/request";
import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import { musicProvider } from "@/lib/music";
import { toMusicListItem } from "@/lib/music/dto";
import { MusicError } from "@/lib/music/types";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { musicResolveSchema } from "@/lib/validation/music";

export const runtime = "nodejs";

export function POST(request: Request) {
  return route(async () => {
    const input = await readJson(request, musicResolveSchema);

    const ip = clientKey(request);
    const limit = consumeRateLimit(`music:resolve:${ip}`, 15, 60_000);
    if (!limit.allowed) {
      throw new HttpError(429, "rate_limited", "Too many requests. Try again.");
    }

    try {
      const candidate = await musicProvider().resolveFromUrl(input.url);
      return ok(toMusicListItem(candidate));
    } catch (error) {
      if (error instanceof MusicError) {
        if (error.code === "invalid_url") {
          throw new HttpError(400, "invalid_url", error.message);
        }
        if (error.code === "not_found") {
          throw new HttpError(404, "not_found", "That video isn't available.");
        }
        if (error.code === "unavailable") {
          throw new HttpError(
            422,
            "unavailable",
            "That video can't be played in an embedded player.",
          );
        }
      }
      throw new HttpError(
        502,
        "upstream",
        "Couldn't read that link just now. Try again.",
      );
    }
  });
}
