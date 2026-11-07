export interface YTPlayerLike {
  loadVideoById(options: { videoId: string; startSeconds?: number }): void;
  cueVideoById(options: { videoId: string; startSeconds?: number }): void;
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
}

interface YTEvent {
  target: YTPlayerLike;
  data?: number;
}

interface YTPlayerOptions {
  videoId?: string;
  host?: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: YTEvent) => void;
    onStateChange?: (event: YTEvent) => void;
    onError?: (event: YTEvent) => void;
  };
}

export interface YTNamespace {
  Player: new (element: HTMLElement, options: YTPlayerOptions) => YTPlayerLike;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let loadPromise: Promise<void> | null = null;

/** Loads the official IFrame API once. Never renders a raw iframe ourselves. */
export function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("The YouTube player needs a browser."));
  }
  if (window.YT?.Player) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve();
      else reject(new Error("The YouTube player didn't load."));
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => reject(new Error("The YouTube player didn't load."));
      document.head.appendChild(script);
    }
  });

  return loadPromise;
}
