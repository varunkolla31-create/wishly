import { clientKey } from "@/lib/api/request";
import { HttpError, ok, route } from "@/lib/api/respond";
import { getSender } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { musicProvider } from "@/lib/music";
import {
  getMusicSearchCount,
  incrementMusicSearchCount,
  readMusicCache,
  writeMusicCache,
} from "@/lib/music/cache";
import { toMusicListItem } from "@/lib/music/dto";
import { MusicError, type MusicCandidate } from "@/lib/music/types";
import { normalizeQuery } from "@/lib/music/youtube-url";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { musicSearchQuerySchema } from "@/lib/validation/music";

export const runtime = "nodejs";

interface SearchPayload {
  items: MusicCandidate[];
}

const CACHE_TTL_SECONDS = 24 * 3600;

export function GET(request: Request) {
  return route(async () => {
    const url = new URL(request.url);
    const parsed = musicSearchQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? "",
    });
    if (!parsed.success) {
      throw new HttpError(400, "invalid_query", "Type at least 3 characters.");
    }

    const query = normalizeQuery(parsed.data.q);
    if (query.length < 3 || query.length > 100) {
      throw new HttpError(400, "invalid_query", "Type 3 to 100 characters.");
    }

    const ip = clientKey(request);
    const sender = await getSender();
    const limits = [consumeRateLimit(`music:search:ip:${ip}`, 10, 60_000)];
    if (sender) {
      limits.push(
        consumeRateLimit(`music:search:user:${sender.userId}`, 10, 60_000),
      );
    }
    if (limits.some((decision) => !decision.allowed)) {
      throw new HttpError(
        429,
        "rate_limited",
        "A little slower — try again in a minute.",
      );
    }

    const cacheKey = `search:${query}`;
    const cached = await readMusicCache<SearchPayload>(cacheKey);
    if (cached?.items) {
      return ok({
        source: "cache",
        items: cached.items.slice(0, 10).map(toMusicListItem),
      });
    }

    const used = await getMusicSearchCount();
    if (used >= env().YOUTUBE_DAILY_SEARCH_LIMIT) {
      throw new HttpError(
        429,
        "quota_busy",
        "Search is busy right now. Pick from the Top 10 or paste a link.",
      );
    }
    await incrementMusicSearchCount();

    let items: MusicCandidate[];
    try {
      items = await musicProvider().search(parsed.data.q);
    } catch (error) {
      if (error instanceof MusicError) {
        if (error.code === "quota") {
          throw new HttpError(
            429,
            "quota_busy",
            "Search is busy right now. Pick from the Top 10 or paste a link.",
          );
        }
        if (error.code === "search_disabled") {
          throw new HttpError(
            503,
            "search_unavailable",
            "Search isn't configured. Pick from the Top 10 or paste a link.",
          );
        }
      }
      throw new HttpError(
        502,
        "upstream",
        "Search is unavailable right now. Try the Top 10 or paste a link.",
      );
    }

    await writeMusicCache(cacheKey, { items }, CACHE_TTL_SECONDS);
    return ok({
      source: "youtube",
      items: items.slice(0, 10).map(toMusicListItem),
    });
  });
}
