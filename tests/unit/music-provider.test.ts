import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MockMusicProvider } from "@/lib/music/mock-provider";
import { YouTubeProvider } from "@/lib/music/youtube-provider";
import { MUSIC_HOST, MusicError } from "@/lib/music/types";

const ID = "dQw4w9WgXcQ";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("MockMusicProvider", () => {
  it("resolves a known fixture and an unknown id deterministically", async () => {
    const provider = new MockMusicProvider();

    const known = await provider.resolveFromUrl(`https://youtu.be/${ID}`);
    expect(known.videoId).toBe(ID);
    expect(known.title).toBe("Mock Ballad");

    const other = await provider.resolveFromUrl("https://youtu.be/9bZkp7q19f0");
    expect(other.channel).toBe("Mock Records");
  });

  it("rejects non-video links", async () => {
    const provider = new MockMusicProvider();
    await expect(
      provider.resolveFromUrl("https://www.youtube.com/playlist?list=PL1"),
    ).rejects.toBeInstanceOf(MusicError);
  });

  it("models a keyless app: search disabled, resolve still works", async () => {
    const provider = new MockMusicProvider(false);
    expect(provider.searchEnabled).toBe(false);
    await expect(provider.search("golden")).rejects.toMatchObject({
      code: "search_disabled",
    });
    await expect(
      provider.resolveFromUrl(`https://youtu.be/${ID}`),
    ).resolves.toMatchObject({ videoId: ID });
  });

  it("searches fixtures when enabled", async () => {
    const provider = new MockMusicProvider(true);
    expect(provider.searchEnabled).toBe(true);
    const results = await provider.search("  BALLAD ");
    expect(results).toHaveLength(1);
    expect(results[0]?.title).toBe("Mock Ballad");
  });
});

describe("YouTubeProvider", () => {
  const originalKey = process.env.YOUTUBE_API_KEY;

  beforeEach(() => {
    delete process.env.YOUTUBE_API_KEY;
  });

  afterEach(() => {
    if (originalKey === undefined) delete process.env.YOUTUBE_API_KEY;
    else process.env.YOUTUBE_API_KEY = originalKey;
    vi.unstubAllGlobals();
  });

  it("reports search as disabled without a key", () => {
    expect(new YouTubeProvider().searchEnabled).toBe(false);
  });

  it("reports search as enabled with a key", () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    expect(new YouTubeProvider().searchEnabled).toBe(true);
  });

  it("resolves a link through oEmbed without needing a key", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL) =>
      jsonResponse({
        title: "Golden Hour",
        author_name: "Kacey Musgraves",
        thumbnail_url: "https://i.ytimg.com/vi/" + ID + "/hqdefault.jpg",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const candidate = await new YouTubeProvider().resolveFromUrl(
      `https://youtu.be/${ID}?t=90`,
    );

    expect(candidate).toMatchObject({
      provider: "youtube",
      videoId: ID,
      title: "Golden Hour",
      channel: "Kacey Musgraves",
      sourceUrl: `https://www.youtube.com/watch?v=${ID}`,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(calledUrl).toContain("youtube.com/oembed");
    expect(calledUrl).not.toContain("key=");
  });

  it("surfaces a missing video as not_found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ error: "not found" }, 404)),
    );

    await expect(
      new YouTubeProvider().resolveFromUrl(`https://youtu.be/${ID}`),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("rejects an invalid link before any network call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      new YouTubeProvider().resolveFromUrl("https://example.com/watch?v=abc"),
    ).rejects.toMatchObject({ code: "invalid_url" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats unreadable JSON as an upstream failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("not json", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    await expect(
      new YouTubeProvider().resolveFromUrl(`https://youtu.be/${ID}`),
    ).rejects.toMatchObject({ code: "upstream" });
  });

  it("refuses to search without a key", async () => {
    await expect(new YouTubeProvider().search("golden")).rejects.toMatchObject({
      code: "search_disabled",
    });
  });

  it("maps search results and drops malformed ids", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/search?")) {
        return jsonResponse({
          items: [
            {
              id: { videoId: ID },
              snippet: {
                title: "  Golden Hour  ",
                channelTitle: " Kacey Musgraves ",
                thumbnails: {
                  medium: { url: "https://i.ytimg.com/vi/x/mqdefault.jpg" },
                },
              },
            },
            { id: { videoId: "too-short" }, snippet: { title: "Broken" } },
            { id: { videoId: "9bZkp7q19f0" }, snippet: { title: "Second" } },
          ],
        });
      }
      return jsonResponse({
        items: [
          {
            id: ID,
            snippet: {
              title: "Golden Hour",
              channelTitle: "Kacey Musgraves",
              thumbnails: {
                medium: { url: "https://i.ytimg.com/vi/x/mqdefault.jpg" },
              },
            },
            contentDetails: { duration: "PT3M30S" },
            status: { embeddable: true },
          },
          {
            id: "9bZkp7q19f0",
            snippet: {
              title: "Second",
              channelTitle: "Artist",
              thumbnails: {
                medium: { url: "https://i.ytimg.com/vi/y/mqdefault.jpg" },
              },
            },
            contentDetails: { duration: "PT4M" },
            status: { embeddable: true },
          },
        ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const results = await new YouTubeProvider().search("  golden   hour ");

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      videoId: ID,
      title: "Golden Hour",
      channel: "Kacey Musgraves",
    });
    expect(results[1]?.videoId).toBe("9bZkp7q19f0");

    const calledUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(calledUrl.searchParams.get("type")).toBe("video");
    expect(calledUrl.searchParams.get("videoEmbeddable")).toBe("true");
    expect(calledUrl.searchParams.get("videoCategoryId")).toBe("10");
    expect(calledUrl.searchParams.get("maxResults")).toBe("10");
    expect(calledUrl.searchParams.get("key")).toBe("test-key");
  });

  it("looks up made-for-kids status when a key exists", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/oembed")) {
        return jsonResponse({ title: "Song", author_name: "Artist" });
      }
      return jsonResponse({ items: [{ id: ID, status: { madeForKids: true } }] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const candidate = await new YouTubeProvider().resolveFromUrl(
      `https://youtu.be/${ID}`,
    );

    expect(candidate.madeForKids).toBe(true);
  });

  it("ignores a failed made-for-kids lookup", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/oembed")) {
          return jsonResponse({ title: "Song", author_name: "Artist" });
        }
        return jsonResponse({ error: "quota" }, 403);
      }),
    );

    const candidate = await new YouTubeProvider().resolveFromUrl(
      `https://youtu.be/${ID}`,
    );
    expect(candidate.madeForKids).toBeUndefined();
    expect(candidate.title).toBe("Song");
  });

  it("builds an embed descriptor clamped at zero", () => {
    const provider = new YouTubeProvider();
    expect(provider.getEmbed({ videoId: ID, startAtSeconds: 90 })).toEqual({
      host: MUSIC_HOST,
      videoId: ID,
      startAtSeconds: 90,
    });
    expect(
      provider.getEmbed({ videoId: ID, startAtSeconds: null }).startAtSeconds,
    ).toBe(0);
    expect(
      provider.getEmbed({ videoId: ID, startAtSeconds: -5 }).startAtSeconds,
    ).toBe(0);
  });
});
