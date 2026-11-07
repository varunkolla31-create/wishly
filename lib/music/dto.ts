import type { MusicCandidate } from "@/lib/music/types";

/** The only fields the picker needs. Nothing about the key or provider. */
export interface MusicListItem {
  videoId: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

export function toMusicListItem(candidate: MusicCandidate): MusicListItem {
  return {
    videoId: candidate.videoId,
    title: candidate.title,
    channel: candidate.channel,
    thumbnailUrl: candidate.thumbnailUrl,
    durationSeconds: candidate.durationSeconds,
  };
}
