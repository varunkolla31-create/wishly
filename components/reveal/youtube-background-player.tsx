"use client";

import { useEffect, useRef, useState } from "react";
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from "@/components/music/youtube-player";
import { cleanSongTitle } from "@/lib/music/clean-title";
import type { MusicBinding } from "@/lib/music/types";

export function YouTubeBackgroundPlayer({
  music,
  autoPlay = false,
}: {
  music: MusicBinding;
  autoPlay?: boolean;
}) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const autoStarted = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playToken, setPlayToken] = useState(0);

  const title = cleanSongTitle(music.title);
  const startAt = Math.max(0, music.startAtSeconds ?? 0);
  const configuredEnd =
    music.endAtSeconds && music.endAtSeconds > startAt
      ? music.endAtSeconds
      : 0;

  useEffect(() => {
    let unlocked = false;
    try {
      unlocked =
        window.sessionStorage.getItem("wishly_unlock_autoplay") === "1";
      if (unlocked) window.sessionStorage.removeItem("wishly_unlock_autoplay");
    } catch {
      // Session storage is a convenience.
    }
    if (autoPlay || unlocked) setPlayToken((token) => token + 1);
  }, [autoPlay]);

  useEffect(() => {
    if (playing || failed || autoStarted.current) {
      return undefined;
    }
    const start = () => {
      if (autoStarted.current) return;
      autoStarted.current = true;
      setPlayToken((token) => token + 1);
      playerRef.current?.play();
      setPlaying(true);
    };
    document.addEventListener("pointerdown", start, { once: true });
    document.addEventListener("keydown", start, { once: true });
    return () => {
      document.removeEventListener("pointerdown", start);
      document.removeEventListener("keydown", start);
    };
  }, [playing, failed]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      try {
        const nextDuration = player.getDuration();
        const nextCurrent = player.getCurrentTime();
        const effectiveEnd = configuredEnd > 0 ? configuredEnd : nextDuration;
        if (
          playing &&
          effectiveEnd > startAt &&
          nextCurrent >= effectiveEnd - 0.25
        ) {
          player.seekTo(startAt);
          player.play();
        }
      } catch {
        // The player may still be initialising.
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [configuredEnd, playing, startAt]);

  useEffect(() => {
    const pause = () => {
      playerRef.current?.pause();
      setPlaying(false);
    };
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", pause);
    window.addEventListener("beforeunload", pause);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", pause);
      window.removeEventListener("beforeunload", pause);
    };
  }, []);

  return (
    <YouTubePlayer
      ref={playerRef}
      videoId={music.videoId}
      title={title}
      startAtSeconds={startAt}
      playToken={playToken}
      autoplay={autoPlay}
      loop={false}
      hidden
      testId="audio-player-recipient"
      onStateChange={(state) => {
        if (state === 1) setPlaying(true);
        if (state === 2) setPlaying(false);
        if (state === 0) {
          const player = playerRef.current;
          const effectiveEnd =
            configuredEnd > 0 ? configuredEnd : player?.getDuration() ?? 0;
          if (effectiveEnd > startAt) {
            playerRef.current?.seekTo(startAt);
            playerRef.current?.play();
            setPlaying(true);
          } else {
            setPlaying(false);
          }
        }
      }}
      onError={() => setFailed(true)}
    />
  );
}
