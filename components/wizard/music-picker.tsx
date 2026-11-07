"use client";

import { Pause, Play, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MUSIC_TRACKS } from "@/lib/catalog/music";
import { cn } from "@/lib/utils/cn";

function rowClass(selected: boolean): string {
  return cn(
    "flex items-center gap-3 rounded-media border px-3 py-2.5",
    selected
      ? "border-ink bg-canvas"
      : "border-hairline bg-surface hover:bg-hover",
  );
}

export function MusicPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function preview(id: string, file: string) {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    audio.src = file;
    void audio
      .play()
      .then(() => setPlayingId(id))
      .catch(() => setPlayingId(null));
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={value === null}
        className={rowClass(value === null)}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-sand text-ink-muted">
          <VolumeX aria-hidden="true" className="size-4" />
        </span>
        <span className="text-sm text-ink">No music</span>
      </button>

      {MUSIC_TRACKS.map((track) => {
        const selected = value === track.id;
        const playing = playingId === track.id;

        return (
          <div key={track.id} className={rowClass(selected)}>
            <button
              type="button"
              onClick={() => preview(track.id, track.file)}
              aria-label={
                playing ? `Pause ${track.title}` : `Preview ${track.title}`
              }
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-canvas"
            >
              {playing ? (
                <Pause aria-hidden="true" className="size-4" />
              ) : (
                <Play aria-hidden="true" className="ml-0.5 size-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onChange(track.id)}
              aria-pressed={selected}
              className="flex-1 text-left"
            >
              <span className="block text-sm font-medium text-ink">
                {track.title}
              </span>
              <span className="block text-xs text-ink-muted">
                {track.mood}
              </span>
            </button>
            {selected ? (
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-coral-strong">
                Chosen
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
