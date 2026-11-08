"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { MUSIC_DUCK_EVENT } from "@/lib/media/duck";
import {
  loadYouTubeIframeApi,
  type YTPlayerLike,
} from "@/lib/music/youtube-iframe";
import { cn } from "@/lib/utils/cn";

export interface YouTubePlayerHandle {
  play(): void;
  pause(): void;
  mute(): void;
  unmute(): void;
  isMuted(): boolean;
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(seconds: number): void;
}

export const YouTubePlayer = forwardRef<
  YouTubePlayerHandle,
  {
    videoId: string;
    title?: string;
    startAtSeconds?: number;
    playToken?: number;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    hidden?: boolean;
    className?: string;
    onError?: (code: number) => void;
    onStateChange?: (state: number) => void;
  }
>(function YouTubePlayer(
  {
    videoId,
    title,
    startAtSeconds = 0,
    playToken = 0,
    autoplay = false,
    loop = false,
    controls = true,
    hidden = false,
    className,
    onError,
    onStateChange,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerLike | null>(null);
  const stateRef = useRef(onStateChange);
  const errorRef = useRef(onError);
  const [ready, setReady] = useState(false);
  stateRef.current = onStateChange;
  errorRef.current = onError;

  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        try {
          playerRef.current?.playVideo();
        } catch {
          // The player may not be ready yet.
        }
      },
      pause: () => {
        try {
          playerRef.current?.pauseVideo();
        } catch {
          // The player may not be ready yet.
        }
      },
      mute: () => {
        try {
          playerRef.current?.mute();
        } catch {
          // The player may not be ready yet.
        }
      },
      unmute: () => {
        try {
          playerRef.current?.unMute();
        } catch {
          // The player may not be ready yet.
        }
      },
      isMuted: () => {
        try {
          return playerRef.current?.isMuted() ?? false;
        } catch {
          return false;
        }
      },
      getCurrentTime: () => {
        try {
          return playerRef.current?.getCurrentTime() ?? 0;
        } catch {
          return 0;
        }
      },
      getDuration: () => {
        try {
          return playerRef.current?.getDuration() ?? 0;
        } catch {
          return 0;
        }
      },
      seekTo: (seconds: number) => {
        try {
          playerRef.current?.seekTo(Math.max(0, seconds), true);
        } catch {
          // The player may not be ready yet.
        }
      },
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || !containerRef.current || playerRef.current) return;
        if (!window.YT?.Player) return;
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          playerVars: {
            playsinline: 1,
            controls: controls && !hidden ? 1 : 0,
            rel: 0,
            modestbranding: 1,
            autoplay: autoplay ? 1 : 0,
            loop: loop ? 1 : 0,
            ...(loop ? { playlist: videoId } : {}),
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              setReady(true);
              if (autoplay) event.target.playVideo();
            },
            onStateChange: (event) => {
              if (typeof event.data === "number") {
                stateRef.current?.(event.data);
              }
            },
            onError: (event) => {
              if (typeof event.data === "number") errorRef.current?.(event.data);
            },
          },
        });
      })
      .catch(() => errorRef.current?.(-1));

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // The player is created once; video changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !videoId) return;
    const player = playerRef.current;
    if (!player) return;
    const shouldPlay = autoplay || playToken > 0;
    if (shouldPlay) {
      player.loadVideoById({ videoId, startSeconds: startAtSeconds });
    } else {
      player.cueVideoById({ videoId, startSeconds: startAtSeconds });
    }
  }, [videoId, ready, playToken, autoplay, startAtSeconds]);

  useEffect(() => {
    const pauseForVoice = () => playerRef.current?.pauseVideo();
    window.addEventListener(MUSIC_DUCK_EVENT, pauseForVoice);
    return () => window.removeEventListener(MUSIC_DUCK_EVENT, pauseForVoice);
  }, []);

  if (hidden) {
    return (
      <div
        aria-label={title ? `Audio player: ${title}` : "Audio player"}
        aria-hidden="true"
        data-testid="audio-player"
        inert
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div ref={containerRef} style={{ width: 1, height: 1 }} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-media bg-black",
        className,
      )}
      aria-label={title ? `Audio player: ${title}` : "Audio player"}
    >
      <div ref={containerRef} className="size-full" />
    </div>
  );
});
