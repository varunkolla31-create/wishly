import { canonicalWatchUrl } from "@/lib/music/youtube-url";
import type { MusicCandidate } from "@/lib/music/types";

/**
 * Last-resort Top 10 when YouTube and the cache are both unavailable.
 * Replace these ids/titles with your own picks; keep them embeddable.
 * They are labelled as Wishly picks, never as the YouTube chart.
 */
export const CURATED_TOP_FALLBACK: MusicCandidate[] = [
  {
    provider: "youtube",
    videoId: "dQw4w9WgXcQ",
    title: "Wishly pick 01",
    channel: "Wishly picks",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("dQw4w9WgXcQ"),
    durationSeconds: 213,
  },
  {
    provider: "youtube",
    videoId: "9bZkp7q19f0",
    title: "Wishly pick 02",
    channel: "Wishly picks",
    thumbnailUrl: "https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("9bZkp7q19f0"),
    durationSeconds: 253,
  },
  {
    provider: "youtube",
    videoId: "kJQP7kiw5Fk",
    title: "Wishly pick 03",
    channel: "Wishly picks",
    thumbnailUrl: "https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("kJQP7kiw5Fk"),
    durationSeconds: 282,
  },
  {
    provider: "youtube",
    videoId: "JGwWNGJdvx8",
    title: "Wishly pick 04",
    channel: "Wishly picks",
    thumbnailUrl: "https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("JGwWNGJdvx8"),
    durationSeconds: 237,
  },
  {
    provider: "youtube",
    videoId: "RgKAFK5djSk",
    title: "Wishly pick 05",
    channel: "Wishly picks",
    thumbnailUrl: "https://i.ytimg.com/vi/RgKAFK5djSk/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("RgKAFK5djSk"),
    durationSeconds: 236,
  },
  {
    provider: "youtube",
    videoId: "OPf0YbXqDm0",
    title: "Wishly pick 06",
    channel: "Wishly picks",
    thumbnailUrl: "https://i.ytimg.com/vi/OPf0YbXqDm0/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("OPf0YbXqDm0"),
    durationSeconds: 297,
  },
  {
    provider: "youtube",
    videoId: "CevxZvSJLk8",
    title: "Wishly pick 07",
    channel: "Wishly picks",
    thumbnailUrl: "https://i.ytimg.com/vi/CevxZvSJLk8/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("CevxZvSJLk8"),
    durationSeconds: 241,
  },
  {
    provider: "youtube",
    videoId: "hT_nvWreIhg",
    title: "Wishly pick 08",
    channel: "Wishly picks",
    thumbnailUrl: "https://i.ytimg.com/vi/hT_nvWreIhg/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("hT_nvWreIhg"),
    durationSeconds: 258,
  },
  {
    provider: "youtube",
    videoId: "YQHsXMglC9A",
    title: "Wishly pick 09",
    channel: "Wishly picks",
    thumbnailUrl: "https://i.ytimg.com/vi/YQHsXMglC9A/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("YQHsXMglC9A"),
    durationSeconds: 296,
  },
  {
    provider: "youtube",
    videoId: "fJ9rUzIMcZQ",
    title: "Wishly pick 10",
    channel: "Wishly picks",
    thumbnailUrl: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg",
    sourceUrl: canonicalWatchUrl("fJ9rUzIMcZQ"),
    durationSeconds: 354,
  },
];
