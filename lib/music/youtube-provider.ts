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
const THUMBNAIL_FIELDS =
  "snippet(title,channelTitle,thumbnails/medium/url,thumbnails/default/url)";

interface OEmbedResponse {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
}

interface SearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
  };
}

interface SearchResponse {
  items?: SearchItem[];
}

interface VideoItem {
  id?: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
  };
  contentDetails?: { duration?: string };
  status?: { embeddable?: boolean; madeForKids?: boolean };
}

interface VideosResponse {
  items?: VideoItem[];
}

function parseIsoDuration(value: string | undefined): number {
  if (!value) return 0;
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(
    value,
  );
  if (!match) return 0;
  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);
  return Math.min(86_400, days * 86_400 + hours * 3_600 + minutes * 60 + seconds);
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    let reason = "";
    try {
      const body = (await response.json()) as {
        error?: { errors?: { reason?: string }[]; status?: string };
      };
      reason = body.error?.errors?.[0]?.reason ?? body.error?.status ?? "";
    } catch {
      reason = "";
    }

    if (response.status === 404) {
      throw new MusicError("not_found", "That video isn't available.");
    }
    if (
      response.status === 429 ||
      (response.status === 403 && /quota|rateLimit|dailyLimit/i.test(reason))
    ) {
      throw new MusicError(
        "quota",
        "Search is busy right now. Pick from the Top 10 or paste a link.",
      );
    }
    throw new MusicError(
      response.status >= 500 ? "unavailable" : "upstream",
      "YouTube didn't answer just now. Try again.",
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

function mapVideo(
  item: VideoItem,
  fallback?: SearchItem["snippet"],
): MusicCandidate | null {
  const videoId = item.id ?? "";
  if (!VIDEO_ID_PATTERN.test(videoId)) return null;
  const snippet = item.snippet ?? fallback;
  const title = snippet?.title?.trim();
  if (!title) return null;

  return {
    provider: "youtube",
    videoId,
    title: title.slice(0, 200),
    channel: (snippet?.channelTitle ?? "").trim().slice(0, 120),
    thumbnailUrl: thumbnailFor(
      {
        thumbnailUrl:
          snippet?.thumbnails?.medium?.url ??
          snippet?.thumbnails?.default?.url,
      },
      videoId,
    ),
    sourceUrl: canonicalWatchUrl(videoId),
    durationSeconds: parseIsoDuration(item.contentDetails?.duration),
    embeddable: item.status?.embeddable,
    madeForKids: item.status?.madeForKids,
  };
}

function dedupe(items: MusicCandidate[]): MusicCandidate[] {
  const seen = new Set<string>();
  const out: MusicCandidate[] = [];
  for (const item of items) {
    if (seen.has(item.videoId)) continue;
    seen.add(item.videoId);
    out.push(item);
  }
  return out;
}

export class YouTubeProvider implements MusicProvider {
  get searchEnabled(): boolean {
    return Boolean(env().YOUTUBE_API_KEY);
  }

  private requireKey(): string {
    const key = env().YOUTUBE_API_KEY;
    if (!key) {
      throw new MusicError("search_disabled", "Search isn't configured.");
    }
    return key;
  }

  private videosFields(): string {
    return `items(id,${THUMBNAIL_FIELDS},contentDetails/duration,status/embeddable,status/madeForKids)`;
  }

  private async videoDetails(
    ids: string[],
  ): Promise<Map<string, VideoItem>> {
    const key = this.requireKey();
    const params = new URLSearchParams({
      part: "snippet,contentDetails,status",
      id: ids.join(","),
      key,
      fields: this.videosFields(),
    });
    const data = await getJson<VideosResponse>(
      `${DATA_API}/videos?${params.toString()}`,
    );
    const map = new Map<string, VideoItem>();
    for (const item of data.items ?? []) {
      if (item.id) map.set(item.id, item);
    }
    return map;
  }

  /** Top 10 chart for a region. Filters non-embeddable videos. */
  async top(region: string): Promise<MusicCandidate[]> {
    const key = this.requireKey();

    const fetchChart = async (maxResults: number) => {
      const params = new URLSearchParams({
        part: "snippet,contentDetails,status",
        chart: "mostPopular",
        videoCategoryId: MUSIC_CATEGORY_ID,
        regionCode: region,
        maxResults: String(maxResults),
        key,
        fields: this.videosFields(),
      });
      const data = await getJson<VideosResponse>(
        `${DATA_API}/videos?${params.toString()}`,
      );
      return (data.items ?? [])
        .map((item) => mapVideo(item))
        .filter((item): item is MusicCandidate => item !== null);
    };

    let items = (await fetchChart(SEARCH_RESULTS)).filter(
      (item) => item.embeddable !== false,
    );
    if (items.length < SEARCH_RESULTS) {
      const more = (await fetchChart(50)).filter(
        (item) => item.embeddable !== false,
      );
      items = dedupe([...items, ...more]);
    }
    return dedupe(items).slice(0, SEARCH_RESULTS);
  }

  async search(query: string): Promise<MusicCandidate[]> {
    this.requireKey();

    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      videoEmbeddable: "true",
      videoCategoryId: MUSIC_CATEGORY_ID,
      maxResults: String(SEARCH_RESULTS),
      safeSearch: "moderate",
      q: query,
      key: this.requireKey(),
      fields: `items(id/videoId,${THUMBNAIL_FIELDS})`,
    });

    const data = await getJson<SearchResponse>(
      `${DATA_API}/search?${params.toString()}`,
    );

    const base = (data.items ?? [])
      .map((item) => ({
        videoId: item.id?.videoId ?? "",
        snippet: item.snippet,
      }))
      .filter(
        (item) => VIDEO_ID_PATTERN.test(item.videoId) && item.snippet?.title,
      );
    if (base.length === 0) return [];

    const details = await this.videoDetails(base.map((item) => item.videoId));
    const results: MusicCandidate[] = [];
    for (const item of base) {
      const detail = details.get(item.videoId);
      if (!detail) continue;
      const candidate = mapVideo(detail, item.snippet);
      if (!candidate) continue;
      if (candidate.embeddable === false) continue;
      results.push(candidate);
    }
    return results.slice(0, SEARCH_RESULTS);
  }

  /**
   * oEmbed needs no key, so pasting a link works with zero configuration.
   * When a key exists we enrich duration and embeddability.
   */
  async resolveFromUrl(url: string): Promise<MusicCandidate> {
    const parsed = parseYouTubeUrl(url);
    if (!parsed) {
      throw new MusicError(
        "invalid_url",
        "Paste a YouTube video link (youtube.com/watch, youtu.be or /shorts).",
      );
    }

    const endpoint = `${OEMBED_ENDPOINT}?url=${encodeURIComponent(
      parsed.canonicalUrl,
    )}&format=json`;
    const data = await getJson<OEmbedResponse>(endpoint);

    const title = data.title?.trim();
    if (!title) {
      throw new MusicError("not_found", "That video isn't available.");
    }

    let detail: VideoItem | undefined;
    if (env().YOUTUBE_API_KEY) {
      try {
        const details = await this.videoDetails([parsed.videoId]);
        detail = details.get(parsed.videoId);
      } catch {
        // Enrichment is best-effort; a broken API must not block a paste.
        detail = undefined;
      }
      if (detail?.status?.embeddable === false) {
        throw new MusicError(
          "unavailable",
          "That video can't be played in an embedded player.",
        );
      }
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
      durationSeconds: parseIsoDuration(detail?.contentDetails?.duration),
      embeddable: detail?.status?.embeddable,
      madeForKids: detail?.status?.madeForKids,
    };
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
