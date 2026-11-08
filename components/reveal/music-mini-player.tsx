"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MusicTrack, TemplatePalette } from "@/lib/catalog/types";
import { MUSIC_DUCK_EVENT } from "@/lib/media/duck";

export function MusicMiniPlayer({
  track,
  palette,
}: {
  track: MusicTrack;
  palette: TemplatePalette;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

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

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }

  return (
    <div
      className="sticky bottom-0 z-30 border-t backdrop-blur"
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.muted,
        color: palette.text,
      }}
    >
      <audio
        ref={audioRef}
        src={track.file}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5 sm:px-8">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause music" : "Play music"}
          className="flex size-12 shrink-0 items-center justify-center rounded-full border border-current/20 transition-transform hover:scale-105"
          style={{ backgroundColor: palette.accent, color: palette.background }}
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-5" />
          ) : (
            <Play aria-hidden="true" className="ml-0.5 size-5" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{track.title}</p>
          <p className="text-xs opacity-60">{track.mood}</p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-50">
          Looping
        </span>
      </div>
    </div>
  );
}
