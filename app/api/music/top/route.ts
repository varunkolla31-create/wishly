import { clientKey } from "@/lib/api/request";
import { HttpError, ok, route } from "@/lib/api/respond";
import { env } from "@/lib/env";
import { musicProvider } from "@/lib/music";
import { readMusicCache, writeMusicCache } from "@/lib/music/cache";
import { toMusicListItem } from "@/lib/music/dto";
import { CURATED_TOP_FALLBACK } from "@/lib/music/fallback";
import type { MusicCandidate } from "@/lib/music/types";
import { consumeRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

interface TopPayload {
  items: MusicCandidate[];
}

export function GET(request: Request) {
  return route(async () => {
    const ip = clientKey(request);
    const limit = consumeRateLimit(`music:top:${ip}`, 60, 60_000);
    if (!limit.allowed) {
      throw new HttpError(429, "rate_limited", "Too many requests. Try again.");
    }

    const config = env();
    const region = config.YOUTUBE_REGION_CODE;
    const cacheKey = `top:${region}`;
    const ttlSeconds = config.YOUTUBE_TOP_CACHE_HOURS * 3600;

    try {
      const fresh = await musicProvider().top(region);
      if (fresh.length >= 5) {
        const items = fresh.slice(0, 10);
        await writeMusicCache(cacheKey, { items }, ttlSeconds);
        return ok({ source: "youtube", items: items.map(toMusicListItem) });
      }
    } catch {
      // Fall through to cache, then curated picks.
    }

    const cached = await readMusicCache<TopPayload>(cacheKey, {
      allowExpired: true,
    });
    if (cached?.items && cached.items.length >= 5) {
      return ok({
        source: "cache",
        items: cached.items.slice(0, 10).map(toMusicListItem),
      });
    }

    return ok({
      source: "fallback",
      items: CURATED_TOP_FALLBACK.map(toMusicListItem),
    });
  });
}
