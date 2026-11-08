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
      play: () => playerRef.current?.playVideo(),
      pause: () => playerRef.current?.pauseVideo(),
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
            controls: controls ? 1 : 0,
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

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-media bg-black",
        className,
      )}
      aria-label={title ? `YouTube player: ${title}` : "YouTube player"}
    >
      <div ref={containerRef} className="size-full" />
    </div>
  );
});
