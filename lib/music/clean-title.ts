const BRACKET_NOISE =
  /\((?:official\s*(?:music\s*)?video|official\s*audio|lyrics?|lyric\s*video|full\s*hd|hd|4k|8k|visuali[sz]er|audio)\)/gi;
const SQUARE_NOISE =
  /\[(?:official\s*(?:music\s*)?video|official\s*audio|lyrics?|lyric\s*video|full\s*hd|hd|4k|8k|visuali[sz]er|audio)\]/gi;
const PIPE_NOISE =
  /\s*[|•]\s*(?:full\s*hd|hd|4k|8k|official\s*(?:music\s*)?video|official\s*audio|lyrics?|lyric\s*video)\b/gi;
const TRAILING_NOISE =
  /\s*[-–—]\s*(?:official\s*(?:music\s*)?video|official\s*audio|lyrics?|lyric\s*video|full\s*hd|hd|4k|8k)\s*$/i;
const TRAILING_QUALITY = /\s+(?:4k|8k|full\s*hd|hd)\s*$/i;

/** Removes noisy YouTube tags so a track title reads like a song title. */
export function cleanSongTitle(title: string): string {
  const cleaned = title
    .replace(BRACKET_NOISE, " ")
    .replace(SQUARE_NOISE, " ")
    .replace(PIPE_NOISE, " ")
    .replace(TRAILING_NOISE, "")
    .replace(TRAILING_QUALITY, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned || title.trim();
}
