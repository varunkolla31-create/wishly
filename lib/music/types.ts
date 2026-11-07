/**
 * Shared music types. Deliberately free of `server-only` so client components
 * can hold a `MusicBinding` without pulling in the API key module.
 */

export type MusicProviderId = "youtube";

/** What a provider returns for a video: display data only, never media. */
export interface MusicCandidate {
  provider: MusicProviderId;
  videoId: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  sourceUrl: string;
  madeForKids?: boolean;
}

/** A candidate plus the sender's chosen offset, as stored on the wish. */
export interface MusicBinding extends MusicCandidate {
  startAtSeconds: number | null;
}

export interface MusicEmbed {
  host: string;
  videoId: string;
  startAtSeconds: number;
}

export interface MusicProvider {
  /** False when no Data API key is configured; the UI hides search. */
  readonly searchEnabled: boolean;
  search(query: string): Promise<MusicCandidate[]>;
  resolveFromUrl(url: string): Promise<MusicCandidate>;
  getEmbed(binding: {
    videoId: string;
    startAtSeconds: number | null;
  }): MusicEmbed;
}

export type MusicErrorCode =
  | "invalid_url"
  | "not_found"
  | "unavailable"
  | "search_disabled"
  | "quota"
  | "upstream";

export class MusicError extends Error {
  constructor(
    readonly code: MusicErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "MusicError";
  }
}

export const MUSIC_HOST = "https://www.youtube-nocookie.com";
export const YOUTUBE_EMBED_API = "https://www.youtube.com/iframe_api";
