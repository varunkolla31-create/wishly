import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMusicSearchCount,
  incrementMusicSearchCount,
  readMusicCache,
  resetMusicMemoryForTests,
  writeMusicCache,
} from "@/lib/music/cache";
import { YouTubeProvider } from "@/lib/music/youtube-provider";
import { musicBindingSchema } from "@/lib/validation/music";
import { consumeRateLimit } from "@/lib/security/rate-limit";

interface VideoFixture {
  id: string;
  embeddable?: boolean;
  duration?: string;
}

function video(id: string, embeddable = true, duration = "PT3M30S"): VideoFixture {
  return { id, embeddable, duration };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function videosBody(items: VideoFixture[]) {
  return {
    items: items.map((item) => ({
      id: item.id,
      snippet: {
        title: `Song ${item.id}`,
        channelTitle: "Artist",
        thumbnails: {
          medium: { url: `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg` },
        },
      },
      contentDetails: { duration: item.duration ?? "PT3M30S" },
      status: { embeddable: item.embeddable ?? true, madeForKids: false },
    })),
  };
}

const ID = (n: number) => `dQw4w9Wg${String(n).padStart(3, "0")}`.slice(0, 11);

describe("YouTubeProvider top 10", () => {
  beforeEach(() => {
    process.env.YOUTUBE_API_KEY = "test-key";
    delete process.env.DB_DRIVER;
  });
  afterEach(() => {
    delete process.env.YOUTUBE_API_KEY;
    vi.unstubAllGlobals();
  });

  it("filters non-embeddable videos and requests more when short", async () => {
    const first = Array.from({ length: 5 }, (_, i) => video(ID(i + 1)));
    const more = [
      ...Array.from({ length: 5 }, (_, i) => video(ID(i + 6))),
      video(ID(50), false),
      video(ID(51), false),
    ];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      const max = url.searchParams.get("maxResults");
      expect(url.searchParams.get("chart")).toBe("mostPopular");
      expect(url.searchParams.get("videoCategoryId")).toBe("10");
      expect(url.searchParams.get("regionCode")).toBe("IN");
      return jsonResponse(videosBody(max === "10" ? first : more));
    });
    vi.stubGlobal("fetch", fetchMock);

    const items = await new YouTubeProvider().top("IN");
    expect(items).toHaveLength(10);
    expect(items.every((item) => item.embeddable !== false)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("maps quota responses to the quota error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          { error: { errors: [{ reason: "quotaExceeded" }] } },
          403,
        ),
      ),
    );
    await expect(new YouTubeProvider().top("IN")).rejects.toMatchObject({
      code: "quota",
    });
  });
});

describe("YouTubeProvider search", () => {
  beforeEach(() => {
    process.env.YOUTUBE_API_KEY = "test-key";
  });
  afterEach(() => {
    delete process.env.YOUTUBE_API_KEY;
    vi.unstubAllGlobals();
  });

  it("enriches duration and drops non-embeddable results", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/search")) {
        return jsonResponse({
          items: [
            { id: { videoId: ID(1) }, snippet: { title: "One", channelTitle: "A" } },
            { id: { videoId: ID(2) }, snippet: { title: "Two", channelTitle: "B" } },
          ],
        });
      }
      expect(url.searchParams.get("id")).toContain(ID(1));
      return jsonResponse(
        videosBody([video(ID(1), true, "PT1M5S"), video(ID(2), false)]),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const items = await new YouTubeProvider().search("one");
    expect(items).toHaveLength(1);
    expect(items[0]?.videoId).toBe(ID(1));
    expect(items[0]?.durationSeconds).toBe(65);
  });
});

describe("music metadata cache and quota (memory)", () => {
  beforeEach(async () => {
    process.env.DB_DRIVER = "file";
    resetMusicMemoryForTests();
    await incrementMusicSearchCount();
    await incrementMusicSearchCount();
  });
  afterEach(() => {
    delete process.env.DB_DRIVER;
    resetMusicMemoryForTests();
  });

  it("caches and reads metadata with TTL", async () => {
    await writeMusicCache("search:golden", { items: [1, 2] }, 60);
    expect(await readMusicCache<{ items: number[] }>("search:golden")).toEqual({
      items: [1, 2],
    });
    expect(await readMusicCache("missing")).toBeNull();
    expect(
      await readMusicCache("search:golden", { allowExpired: true }),
    ).not.toBeNull();
  });

  it("tracks the daily search count", async () => {
    expect(await getMusicSearchCount()).toBe(2);
    await incrementMusicSearchCount();
    expect(await getMusicSearchCount()).toBe(3);
  });
});

describe("music validation and rate limiting", () => {
  it("accepts a valid binding and rejects bad ids, urls and offsets", () => {
    const valid = {
      provider: "youtube",
      videoId: "dQw4w9WgXcQ",
      title: "Song",
      channel: "Artist",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      durationSeconds: 200,
      startAtSeconds: 30,
    };
    expect(musicBindingSchema.safeParse(valid).success).toBe(true);
    expect(
      musicBindingSchema.safeParse({ ...valid, videoId: "short" }).success,
    ).toBe(false);
    expect(
      musicBindingSchema.safeParse({ ...valid, thumbnailUrl: "http://x" }).success,
    ).toBe(false);
    expect(
      musicBindingSchema.safeParse({ ...valid, startAtSeconds: -1 }).success,
    ).toBe(false);
  });

  it("limits bursty music requests per key", () => {
    const key = `music:test:${Date.now()}`;
    expect(consumeRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(consumeRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(consumeRateLimit(key, 2, 60_000).allowed).toBe(false);
  });
});
