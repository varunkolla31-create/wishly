import "server-only";
import { env } from "@/lib/env";
import {
  canonicalWatchUrl,
  parseYouTubeUrl,
  VIDEO_ID_PATTERN,
} from "@/lib/music/youtube-url";
import {
  MUSIC_HOST,
  MusicError,
  type MusicCandidate,
  type MusicEmbed,
  type MusicProvider,
} from "@/lib/music/types";

const OEMBED_ENDPOINT = "https://www.youtube.com/oembed";
const DATA_API = "https://www.googleapis.com/youtube/v3";
const TIMEOUT_MS = 8_000;
const SEARCH_RESULTS = 10;
const MUSIC_CATEGORY_ID = "10";

interface OEmbedResponse {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
}

interface SearchResponse {
  items?: {
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      channelTitle?: string;
      thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
    };
  }[];
}

interface VideosResponse {
  items?: { id?: string; status?: { madeForKids?: boolean } }[];
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new MusicError(
      response.status === 404 ? "not_found" : "upstream",
      response.status === 404
        ? "That video isn't available."
        : "YouTube didn't answer just now. Try again.",
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new MusicError("upstream", "YouTube sent something we couldn't read.");
  }
}

function thumbnailFor(candidate: Partial<MusicCandidate>, videoId: string): string {
  const provided = candidate.thumbnailUrl?.trim();
  if (provided && /^https:\/\//.test(provided)) return provided;
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

export class YouTubeProvider implements MusicProvider {
  get searchEnabled(): boolean {
    return Boolean(env().YOUTUBE_API_KEY);
  }

  /**
   * oEmbed needs no API key, so pasting a link works with zero configuration.
   * Embeddability is not knowable here; the player reports it via onError.
   */
  async resolveFromUrl(url: string): Promise<MusicCandidate> {
    const parsed = parseYouTubeUrl(url);
    if (!parsed) {
      throw new MusicError(
        "invalid_url",
        "Paste a YouTube video link (youtube.com/watch, youtu.be or /shorts).",
      );
    }

    if (!VIDEO_ID_PATTERN.test(parsed.videoId)) {
      throw new MusicError("invalid_url", "That video id doesn't look right.");
    }

    const endpoint = `${OEMBED_ENDPOINT}?url=${encodeURIComponent(
      parsed.canonicalUrl,
    )}&format=json`;
    const data = await getJson<OEmbedResponse>(endpoint);

    const title = data.title?.trim();
    if (!title) {
      throw new MusicError("not_found", "That video isn't available.");
    }

    return {
      provider: "youtube",
      videoId: parsed.videoId,
      title: title.slice(0, 200),
      channel: (data.author_name ?? "").trim().slice(0, 120),
      thumbnailUrl: thumbnailFor(
        { thumbnailUrl: data.thumbnail_url },
        parsed.videoId,
      ),
      sourceUrl: canonicalWatchUrl(parsed.videoId),
      madeForKids: await this.madeForKids(parsed.videoId),
    };
  }

  /**
   * Optional policy lookup (Developer Policies III.E.4.b.11). Costs 1 quota and
   * fails soft: an unknown status must never block resolving a link.
   */
  private async madeForKids(videoId: string): Promise<boolean | undefined> {
    const key = env().YOUTUBE_API_KEY;
    if (!key) return undefined;

    try {
      const data = await getJson<VideosResponse>(
        `${DATA_API}/videos?part=status&id=${videoId}&key=${encodeURIComponent(key)}`,
      );
      return data.items?.[0]?.status?.madeForKids;
    } catch {
      return undefined;
    }
  }

  async search(query: string): Promise<MusicCandidate[]> {
    const key = env().YOUTUBE_API_KEY;
    if (!key) {
      throw new MusicError("search_disabled", "Search isn't configured.");
    }

    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      videoEmbeddable: "true",
      videoCategoryId: MUSIC_CATEGORY_ID,
      maxResults: String(SEARCH_RESULTS),
      safeSearch: "moderate",
      q: query,
      key,
      fields:
        "items(id/videoId,snippet(title,channelTitle,thumbnails/medium/url))",
    });

    const data = await getJson<SearchResponse>(
      `${DATA_API}/search?${params.toString()}`,
    );

    const results: MusicCandidate[] = [];
    for (const item of data.items ?? []) {
      const videoId = item.id?.videoId ?? "";
      const title = item.snippet?.title?.trim();
      if (!VIDEO_ID_PATTERN.test(videoId) || !title) continue;

      results.push({
        provider: "youtube",
        videoId,
        title: title.slice(0, 200),
        channel: (item.snippet?.channelTitle ?? "").trim().slice(0, 120),
        thumbnailUrl: thumbnailFor(
          {
            thumbnailUrl:
              item.snippet?.thumbnails?.medium?.url ??
              item.snippet?.thumbnails?.default?.url,
          },
          videoId,
        ),
        sourceUrl: canonicalWatchUrl(videoId),
      });
    }

    return results;
  }

  getEmbed(binding: {
    videoId: string;
    startAtSeconds: number | null;
  }): MusicEmbed {
    return {
      host: MUSIC_HOST,
      videoId: binding.videoId,
      startAtSeconds: Math.max(0, Math.trunc(binding.startAtSeconds ?? 0)),
    };
  }
}
