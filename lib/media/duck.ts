export const MUSIC_DUCK_EVENT = "wishly:duck-music";

/** Ask the background music player to pause while another voice/video plays. */
export function duckMusic() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MUSIC_DUCK_EVENT));
}
