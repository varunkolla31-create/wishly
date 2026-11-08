"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from "@/components/music/youtube-player";
import type { TemplatePalette } from "@/lib/catalog/types";
import { cleanSongTitle } from "@/lib/music/clean-title";
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
  const autoStarted = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playToken, setPlayToken] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(
    Math.max(0, music.durationSeconds || 0),
  );
  const [muted, setMuted] = useState(false);

  const title = cleanSongTitle(music.title);
  const progress =
    duration > 0 ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0;

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
    if (!autoPlay || playing || failed || autoStarted.current) {
      setShowPrompt(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setShowPrompt(true), 1800);
    return () => window.clearTimeout(timer);
  }, [autoPlay, playing, failed]);

  useEffect(() => {
    if (!autoPlay || playing || failed || autoStarted.current) {
      return undefined;
    }
    const start = () => {
      autoStarted.current = true;
      setShowPrompt(false);
      playerRef.current?.play();
      setPlaying(true);
    };
    document.addEventListener("pointerdown", start, { once: true });
    document.addEventListener("keydown", start, { once: true });
    return () => {
      document.removeEventListener("pointerdown", start);
      document.removeEventListener("keydown", start);
    };
  }, [autoPlay, playing, failed]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      try {
        const nextDuration = player.getDuration();
        const nextCurrent = player.getCurrentTime();
        if (Number.isFinite(nextDuration) && nextDuration > 0) {
          setDuration(nextDuration);
        }
        if (Number.isFinite(nextCurrent) && nextCurrent >= 0) {
          setCurrent(nextCurrent);
        }
        setMuted(player.isMuted());
      } catch {
        // The player may still be initialising.
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, []);

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

  function toggle() {
    setShowPrompt(false);
    if (failed) return;
    if (playing) {
      playerRef.current?.pause();
      setPlaying(false);
    } else {
      autoStarted.current = true;
      playerRef.current?.play();
      setPlaying(true);
    }
  }

  function toggleMute() {
    const next = !muted;
    if (next) playerRef.current?.mute();
    else playerRef.current?.unmute();
    setMuted(next);
  }

  function seek(value: number) {
    setCurrent(value);
    playerRef.current?.seekTo(value);
  }

  return (
    <>
      <YouTubePlayer
        ref={playerRef}
        videoId={music.videoId}
        title={title}
        startAtSeconds={music.startAtSeconds ?? 0}
        playToken={playToken}
        autoplay={autoPlay}
        loop
        hidden
        onStateChange={(state) => {
          if (state === 1) setPlaying(true);
          if (state === 2 || state === 0) setPlaying(false);
        }}
        onError={() => setFailed(true)}
      />

      <div className="fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-2rem))]">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/80 p-3 text-white shadow-2xl backdrop-blur-md">
          <Image
            src={music.thumbnailUrl}
            alt=""
            width={88}
            height={88}
            unoptimized
            className="size-11 shrink-0 rounded-md object-cover ring-1 ring-white/10"
            style={{ boxShadow: `0 0 22px ${palette.accent}44` }}
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="truncate text-[11px] text-white/60">
              {failed ? "Can't play here" : music.channel || "Unknown artist"}
            </p>
            <input
              type="range"
              min={0}
              max={Math.max(1, duration)}
              step={1}
              value={Math.min(current, Math.max(1, duration))}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Seek"
              className="spotify-scrubber mt-1.5 w-full"
              style={{
                background: `linear-gradient(to right, #ffffff ${progress}%, rgba(255,255,255,0.22) ${progress}%)`,
              }}
            />
          </div>

          <button
            type="button"
            onClick={toggle}
            disabled={failed}
            aria-label={playing ? "Pause background music" : "Play background music"}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 disabled:opacity-50"
          >
            {playing ? (
              <Pause aria-hidden="true" className="size-4" />
            ) : (
              <Play aria-hidden="true" className="ml-0.5 size-4" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            disabled={failed}
            aria-label={muted ? "Unmute music" : "Mute music"}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white disabled:opacity-50"
          >
            {muted ? (
              <VolumeX aria-hidden="true" className="size-4" />
            ) : (
              <Volume2 aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>

      {showPrompt && !playing ? (
        <button
          type="button"
          onClick={toggle}
          className="fixed bottom-24 right-4 z-40 inline-flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold text-black shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
        >
          <Play aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">Tap to play music</span>
        </button>
      ) : null}
    </>
  );
}
