import {
  MUSIC_HOST,
  MusicError,
  type MusicCandidate,
  type MusicEmbed,
  type MusicProvider,
} from "@/lib/music/types";
import {
  canonicalWatchUrl,
  parseYouTubeUrl,
  VIDEO_ID_PATTERN,
} from "@/lib/music/youtube-url";

const FIXTURES: MusicCandidate[] = [
  {
    provider: "youtube",
    videoId: "dQw4w9WgXcQ",
    title: "Mock Ballad",
    channel: "Mock Records",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("dQw4w9WgXcQ"),
  },
  {
    provider: "youtube",
    videoId: "9bZkp7q19f0",
    title: "Mock Celebration",
    channel: "Mock Records",
    thumbnailUrl: "https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("9bZkp7q19f0"),
  },
];

/**
 * Deterministic provider for unit tests. Never touches the network, so tests
 * stay fast and free of quota. `searchEnabled` is injectable to model both the
 * keyed and keyless app.
 */
export class MockMusicProvider implements MusicProvider {
  constructor(readonly searchEnabled = false) {}

  async search(query: string): Promise<MusicCandidate[]> {
    if (!this.searchEnabled) {
      throw new MusicError("search_disabled", "Search isn't configured.");
    }
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return FIXTURES.filter((item) =>
      item.title.toLowerCase().includes(needle),
    );
  }

  async resolveFromUrl(url: string): Promise<MusicCandidate> {
    const parsed = parseYouTubeUrl(url);
    if (!parsed || !VIDEO_ID_PATTERN.test(parsed.videoId)) {
      throw new MusicError("invalid_url", "That link isn't a YouTube video.");
    }

    const known = FIXTURES.find((item) => item.videoId === parsed.videoId);
    if (known) return known;

    return {
      provider: "youtube",
      videoId: parsed.videoId,
      title: `Mock video ${parsed.videoId}`,
      channel: "Mock Records",
      thumbnailUrl: `https://i.ytimg.com/vi/${parsed.videoId}/mqdefault.jpg`,
      sourceUrl: canonicalWatchUrl(parsed.videoId),
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
