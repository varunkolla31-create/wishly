/**
 * Pure YouTube URL parsing. No network, no server-only APIs, so both the
 * server route and client-side hints can use it.
 *
 * Accepts: youtube.com/watch?v=, youtu.be/<id>, youtube.com/shorts/<id>,
 * youtube.com/embed/<id>, music.youtube.com/watch?v=, m.youtube.com/watch?v=
 * Rejects: playlists, channels, handles, feeds, non-YouTube hosts, bad ids.
 */

export const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const MAX_URL_LENGTH = 2048;
const MAX_START_SECONDS = 86_400;

const ALLOWED_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "www.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

/** Paths that are never a single video. */
const REJECTED_PREFIXES = ["/playlist", "/channel/", "/@", "/feed", "/results", "/hashtag/"];

export interface ParsedYouTubeUrl {
  videoId: string;
  startAtSeconds: number | null;
  canonicalUrl: string;
}

/**
 * Parses `t` / `start` values: "90", "90s", "1m30s", "1h2m3s".
 * Returns null when absent or unparseable, and caps at 24 hours.
 */
export function parseStartSeconds(value: string | null): number | null {
  if (!value) return null;

  const raw = value.trim().toLowerCase();
  if (!raw) return null;

  if (/^\d+$/.test(raw)) {
    const seconds = Number(raw);
    return seconds > MAX_START_SECONDS ? MAX_START_SECONDS : seconds;
  }

  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(raw);
  if (!match || (!match[1] && !match[2] && !match[3])) return null;

  const seconds =
    Number(match[1] ?? 0) * 3600 +
    Number(match[2] ?? 0) * 60 +
    Number(match[3] ?? 0);

  return seconds > MAX_START_SECONDS ? MAX_START_SECONDS : seconds;
}

function extractId(url: URL, host: string): string | null {
  const path = url.pathname.replace(/\/+$/, "");

  if (REJECTED_PREFIXES.some((prefix) => path.startsWith(prefix))) return null;

  if (host === "youtu.be" || host === "www.youtu.be") {
    return path.replace(/^\/+/, "").split("/")[0] || null;
  }

  if (path === "/watch") {
    // A watch link with a playlist but no video id is a playlist link.
    return url.searchParams.get("v");
  }

  if (path.startsWith("/shorts/")) {
    return path.split("/")[2] || null;
  }

  if (path.startsWith("/embed/") || path.startsWith("/v/")) {
    return path.split("/")[2] || null;
  }

  return null;
}

export function parseYouTubeUrl(input: string): ParsedYouTubeUrl | null {
  const raw = input.trim();
  if (!raw || raw.length > MAX_URL_LENGTH) return null;

  let url: URL;
  try {
    url = new URL(raw.startsWith("//") ? `https:${raw}` : raw);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) return null;

  // Playlist endpoints are rejected outright, even if a v param rides along.
  if (url.pathname.startsWith("/playlist")) return null;

  const id = extractId(url, host);
  if (!id || !VIDEO_ID_PATTERN.test(id)) return null;

  return {
    videoId: id,
    startAtSeconds: parseStartSeconds(
      url.searchParams.get("t") ?? url.searchParams.get("start"),
    ),
    canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

/** Cache key for search results: case-folded, whitespace-collapsed. */
export function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Canonical source URL for a stored binding. */
export function canonicalWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
