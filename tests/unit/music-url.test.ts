import { describe, expect, it } from "vitest";
import {
  canonicalWatchUrl,
  normalizeQuery,
  parseStartSeconds,
  parseYouTubeUrl,
} from "@/lib/music/youtube-url";

const ID = "dQw4w9WgXcQ";

describe("parseYouTubeUrl", () => {
  const accepted: [string, string][] = [
    [`https://www.youtube.com/watch?v=${ID}`, "watch with www"],
    [`https://youtube.com/watch?v=${ID}`, "watch without www"],
    [`https://m.youtube.com/watch?v=${ID}`, "mobile watch"],
    [`https://music.youtube.com/watch?v=${ID}`, "music.youtube.com"],
    [`https://youtu.be/${ID}`, "youtu.be"],
    [`https://youtu.be/${ID}?si=tracking123`, "youtu.be with tracking"],
    [`https://www.youtube.com/shorts/${ID}`, "shorts"],
    [`https://www.youtube.com/embed/${ID}`, "embed"],
    [`https://www.youtube.com/watch?list=PL123&v=${ID}`, "watch with playlist context"],
    [`https://www.youtube.com/watch?v=${ID}&feature=share`, "extra params"],
    [`  https://youtu.be/${ID}  `, "surrounding whitespace"],
    [`//youtu.be/${ID}`, "protocol-relative"],
    [`http://youtube.com/watch?v=${ID}`, "http"],
  ];

  for (const [url, label] of accepted) {
    it(`accepts ${label}`, () => {
      expect(parseYouTubeUrl(url)?.videoId).toBe(ID);
    });
  }

  it("builds a canonical https watch url", () => {
    expect(parseYouTubeUrl(`https://youtu.be/${ID}`)?.canonicalUrl).toBe(
      `https://www.youtube.com/watch?v=${ID}`,
    );
  });

  it("reads start times from t and start", () => {
    expect(
      parseYouTubeUrl(`https://youtu.be/${ID}?t=90`)?.startAtSeconds,
    ).toBe(90);
    expect(
      parseYouTubeUrl(`https://www.youtube.com/watch?v=${ID}&start=1m30s`)
        ?.startAtSeconds,
    ).toBe(90);
  });

  const rejected: [string, string][] = [
    ["", "empty"],
    ["   ", "whitespace only"],
    ["not a url", "garbage"],
    ["https://www.youtube.com/playlist?list=PL123", "playlist"],
    ["https://www.youtube.com/channel/UC123", "channel"],
    ["https://www.youtube.com/@someone", "handle"],
    ["https://www.youtube.com/feed/trending", "feed"],
    ["https://www.youtube.com/results?search_query=music", "results"],
    ["https://vimeo.com/123456", "non-YouTube host"],
    ["https://youtube.com.evil.test/watch?v=" + ID, "lookalike host"],
    ["https://www.youtube.com/watch?v=short", "too short"],
    ["https://www.youtube.com/watch?v=123456789012", "too long"],
    ["https://www.youtube.com/watch?v=abc!defghij", "invalid characters"],
    ["https://www.youtube.com/watch", "watch without v"],
    ["https://www.youtube.com/watch?list=PL123", "playlist without v"],
    ["https://youtu.be/", "empty youtu.be path"],
    ["javascript:alert(1)", "javascript scheme"],
    ["data:text/html,<html>", "data scheme"],
    [`https://www.youtube.com/watch?v=${ID}&x=${"a".repeat(2100)}`, "over-long url"],
  ];

  for (const [url, label] of rejected) {
    it(`rejects ${label}`, () => {
      expect(parseYouTubeUrl(url)).toBeNull();
    });
  }
});

describe("parseStartSeconds", () => {
  it("parses plain seconds", () => {
    expect(parseStartSeconds("90")).toBe(90);
    expect(parseStartSeconds("0")).toBe(0);
  });

  it("parses h/m/s notation", () => {
    expect(parseStartSeconds("1m30s")).toBe(90);
    expect(parseStartSeconds("1h2m3s")).toBe(3723);
    expect(parseStartSeconds("45s")).toBe(45);
  });

  it("returns null for junk and missing values", () => {
    expect(parseStartSeconds(null)).toBeNull();
    expect(parseStartSeconds("")).toBeNull();
    expect(parseStartSeconds("abc")).toBeNull();
    expect(parseStartSeconds("s")).toBeNull();
  });

  it("caps at 24 hours", () => {
    expect(parseStartSeconds("999999")).toBe(86_400);
  });
});

describe("normalizeQuery", () => {
  it("trims, collapses whitespace and lowercases", () => {
    expect(normalizeQuery("  Golden   Hour  ")).toBe("golden hour");
  });
});

describe("canonicalWatchUrl", () => {
  it("returns an https watch url", () => {
    expect(canonicalWatchUrl(ID)).toBe(`https://www.youtube.com/watch?v=${ID}`);
  });
});
