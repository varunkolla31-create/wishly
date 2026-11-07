import "server-only";
import { YouTubeProvider } from "@/lib/music/youtube-provider";
import type { MusicProvider } from "@/lib/music/types";

let cached: MusicProvider | null = null;

/**
 * YouTube is the only music provider. Search depends on YOUTUBE_API_KEY;
 * resolving a pasted link uses oEmbed and needs no key.
 */
export function musicProvider(): MusicProvider {
  cached ??= new YouTubeProvider();
  return cached;
}
