import { clientKey } from "@/lib/api/request";
import { HttpError, ok, readJson, route } from "@/lib/api/respond";
import type { MusicBinding, MusicProviderId } from "@/lib/music/types";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { musicResolveSchema } from "@/lib/validation/music";

export const runtime = "nodejs";

interface ParsedLink {
  provider: MusicProviderId;
  id: string;
  canonical: string;
}

function parseLink(value: string): ParsedLink | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "");

  if (host === "open.spotify.com") {
    const match = url.pathname.match(/\/track\/([A-Za-z0-9]+)/);
    if (!match?.[1]) return null;
    return {
      provider: "spotify",
      id: match[1],
      canonical: `https://open.spotify.com/track/${match[1]}`,
    };
  }

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return {
      provider: "youtube",
      id,
      canonical: `https://www.youtube.com/watch?v=${id}`,
    };
  }

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com"
  ) {
    const id = url.searchParams.get("v");
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return {
      provider: "youtube",
      id,
      canonical: `https://www.youtube.com/watch?v=${id}`,
    };
  }

  return null;
}

async function fetchOEmbed(url: string): Promise<{
  title: string;
  thumbnailUrl: string;
  channel: string;
}> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error("oembed_failed");
  const data = (await response.json()) as {
    title?: string;
    thumbnail_url?: string;
    author_name?: string;
    provider_name?: string;
  };
  if (!data.title) throw new Error("oembed_empty");
  return {
    title: data.title,
    thumbnailUrl: data.thumbnail_url ?? "",
    channel:
      data.author_name?.trim() ||
      data.provider_name?.trim() ||
      (data.thumbnail_url ? "Music" : "Music"),
  };
}

export function POST(request: Request) {
  return route(async () => {
    const input = await readJson(request, musicResolveSchema);
    const limit = consumeRateLimit(
      `music:link:${clientKey(request)}`,
      20,
      60_000,
    );
    if (!limit.allowed) {
      throw new HttpError(429, "rate_limited", "Too many requests. Try again.");
    }

    const parsed = parseLink(input.url);
    if (!parsed) {
      throw new HttpError(
        400,
        "invalid_url",
        "Paste a Spotify track or YouTube video link.",
      );
    }

    try {
      const oembed =
        parsed.provider === "spotify"
          ? await fetchOEmbed(
              `https://open.spotify.com/oembed?url=${encodeURIComponent(parsed.canonical)}`,
            )
          : await fetchOEmbed(
              `https://noembed.com/embed?url=${encodeURIComponent(parsed.canonical)}`,
            );

      const thumbnailUrl =
        oembed.thumbnailUrl ||
        (parsed.provider === "youtube"
          ? `https://i.ytimg.com/vi/${parsed.id}/hqdefault.jpg`
          : "https://open.spotify.com/favicon.ico");

      const binding: MusicBinding = {
        provider: parsed.provider,
        videoId: parsed.id,
        title: oembed.title,
        channel: oembed.channel,
        thumbnailUrl,
        sourceUrl: parsed.canonical,
        durationSeconds: 0,
        startAtSeconds: 0,
        endAtSeconds: null,
      };

      return ok(binding);
    } catch {
      throw new HttpError(
        502,
        "upstream",
        "Couldn't read that song link. Try another one.",
      );
    }
  });
}
