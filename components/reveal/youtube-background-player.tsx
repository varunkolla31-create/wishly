"use client";

import { Music2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from "@/components/music/youtube-player";
import type { TemplatePalette } from "@/lib/catalog/types";
import type { MusicBinding } from "@/lib/music/types";

export function YouTubeBackgroundPlayer({
  music,
  palette,
  autoPlay = false,
}: {
  music: MusicBinding;
  palette: TemplatePalette;
  autoPlay?: boolean;
}) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playToken, setPlayToken] = useState(autoPlay ? 1 : 0);

  useEffect(() => {
    if (!autoPlay) return;
    setPlayToken((token) => token + 1);
  }, [autoPlay]);

  function toggle() {
    if (failed) return;
    if (playing) {
      playerRef.current?.pause();
      setPlaying(false);
    } else {
      setPlayToken((token) => token + 1);
      setPlaying(true);
    }
  }

  return (
    <div
      className="sticky bottom-0 z-30 border-t backdrop-blur"
      style={{
        backgroundColor: palette.surface,
        borderColor: `${palette.muted}33`,
        color: palette.text,
      }}
    >
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5 sm:px-8">
        <div className="relative hidden w-24 shrink-0 overflow-hidden rounded-md bg-black sm:block">
          <YouTubePlayer
            ref={playerRef}
            videoId={music.videoId}
            title={music.title}
            startAtSeconds={music.startAtSeconds ?? 0}
            playToken={playToken}
            autoplay={autoPlay}
            loop
            controls={false}
            onStateChange={(state) => {
              if (state === 1) setPlaying(true);
              if (state === 2 || state === 0) setPlaying(false);
            }}
            onError={() => setFailed(true)}
            className="rounded-md"
          />
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause background music" : "Play background music"}
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
          <p className="flex items-center gap-1.5 truncate text-sm font-medium">
            <Music2 aria-hidden="true" className="size-3.5 shrink-0 opacity-60" />
            {music.title}
          </p>
          <p className="truncate text-xs opacity-60">
            {failed
              ? "This track can't play here — open it on YouTube."
              : music.channel || "YouTube"}
          </p>
        </div>

        <a
          href={music.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[11px] font-medium underline underline-offset-4 opacity-70 hover:opacity-100"
        >
          YouTube
        </a>
      </div>
    </div>
  );
}
