"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { duckMusic } from "@/lib/media/duck";

const BARS = [10, 18, 8, 22, 14, 26, 12, 20, 9, 16, 24, 11, 19, 7, 15];
const WIDTHS = [3, 3, 2, 3, 3, 2, 3, 3, 2, 3, 3, 2, 3, 2, 3];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function VoiceNote({
  src,
  accent,
  textColor,
  mutedColor,
  label = "A voice note, just for you",
}: {
  src: string;
  accent: string;
  textColor: string;
  mutedColor: string;
  label?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const onLoaded = () => setDuration(audio.duration);
    const onTime = () => setCurrent(audio.currentTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      duckMusic();
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }

  const progress = duration > 0 ? Math.min(current / duration, 1) : 0;

  return (
    <div
      className="flex items-center gap-4 rounded-card border p-4"
      style={{ borderColor: `${mutedColor}33`, backgroundColor: "rgba(0,0,0,0.18)" }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        className="flex size-12 shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-105"
        style={{ backgroundColor: accent }}
      >
        {playing ? (
          <Pause aria-hidden="true" className="size-5" />
        ) : (
          <Play aria-hidden="true" className="ml-0.5 size-5" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: mutedColor }}
        >
          {label}
        </p>
        <div
          className="mt-2 flex h-8 items-end gap-1"
          aria-hidden="true"
          style={{ color: accent }}
        >
          {BARS.map((height, index) => (
            <span
              key={index}
              className={playing ? "animate-pulse rounded-full" : "rounded-full"}
              style={{
                width: WIDTHS[index],
                height,
                backgroundColor: accent,
                opacity: playing ? 1 : 0.45,
                animationDelay: `${index * 55}ms`,
              }}
            />
          ))}
        </div>
        <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: `${mutedColor}33` }}>
          <span
            className="block h-full rounded-full transition-[width] duration-300"
            style={{ width: `${progress * 100}%`, backgroundColor: accent }}
          />
        </div>
      </div>

      <span className="text-xs tabular-nums" style={{ color: textColor }}>
        {formatTime(playing || current > 0 ? current : duration)}
      </span>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          duckMusic();
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
      />
    </div>
  );
}
