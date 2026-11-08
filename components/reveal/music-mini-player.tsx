"use client";

import { useEffect, useRef } from "react";
import type { MusicTrack } from "@/lib/catalog/types";
import { MUSIC_DUCK_EVENT } from "@/lib/media/duck";

export function MusicMiniPlayer({ track }: { track: MusicTrack }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      void audio.play().catch(() => {});
    };
    document.addEventListener("pointerdown", start, { once: true });
    document.addEventListener("keydown", start, { once: true });
    return () => {
      document.removeEventListener("pointerdown", start);
      document.removeEventListener("keydown", start);
    };
  }, []);

  useEffect(() => {
    const pauseForVoice = () => {
      audioRef.current?.pause();
    };
    const pauseWhenHidden = () => {
      if (document.hidden) audioRef.current?.pause();
    };
    const pauseOnLeave = () => {
      audioRef.current?.pause();
    };
    window.addEventListener(MUSIC_DUCK_EVENT, pauseForVoice);
    document.addEventListener("visibilitychange", pauseWhenHidden);
    window.addEventListener("pagehide", pauseOnLeave);
    window.addEventListener("beforeunload", pauseOnLeave);
    return () => {
      window.removeEventListener(MUSIC_DUCK_EVENT, pauseForVoice);
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      window.removeEventListener("pagehide", pauseOnLeave);
      window.removeEventListener("beforeunload", pauseOnLeave);
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src={track.file}
      loop
      preload="auto"
      aria-hidden="true"
    />
  );
}
