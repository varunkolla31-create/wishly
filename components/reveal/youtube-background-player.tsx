"use client";

import { motion } from "framer-motion";
import { Music2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from "@/components/music/youtube-player";
import type { TemplatePalette } from "@/lib/catalog/types";
import type { MusicBinding } from "@/lib/music/types";

function Equalizer({
  playing,
  color,
}: {
  playing: boolean;
  color: string;
}) {
  return (
    <span className="flex h-5 items-end gap-0.5" aria-hidden="true">
      {[8, 16, 10, 20].map((height, index) => (
        <motion.span
          key={index}
          className="w-1 rounded-full"
          style={{
            height,
            backgroundColor: color,
            transformOrigin: "bottom",
          }}
          animate={playing ? { scaleY: [0.35, 1, 0.55] } : { scaleY: 0.3 }}
          transition={
            playing
              ? {
                  duration: 0.85,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: index * 0.09,
                  ease: "easeInOut",
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
}

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
      setPlayToken((token) => token + 1);
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
      setPlayToken((token) => token + 1);
      setPlaying(true);
    }
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)]">
        <div
          className="flex items-center gap-2 rounded-full border p-1.5 pr-3 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur"
          style={{
            backgroundColor: palette.surface,
            borderColor: `${palette.muted}44`,
            color: palette.text,
          }}
        >
          <div className="w-16 shrink-0 overflow-hidden rounded-full bg-black sm:w-20">
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
              className="rounded-full"
            />
          </div>

          <button
            type="button"
            onClick={toggle}
            aria-label={
              playing ? "Pause background music" : "Play background music"
            }
            className="flex size-10 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105"
            style={{
              backgroundColor: palette.accent,
              color: palette.background,
            }}
          >
            {playing ? (
              <Pause aria-hidden="true" className="size-4" />
            ) : (
              <Play aria-hidden="true" className="ml-0.5 size-4" />
            )}
          </button>

          <div className="min-w-0 max-w-[100px] sm:max-w-[170px]">
            <p className="flex items-center gap-1 truncate text-xs font-medium">
              <Music2
                aria-hidden="true"
                className="size-3 shrink-0 opacity-60"
              />
              {music.title}
            </p>
            <p className="truncate text-[10px] opacity-60">
              {failed
                ? "Open on YouTube"
                : music.channel || "Background music"}
            </p>
          </div>

          <Equalizer playing={playing} color={palette.accent} />

          <a
            href={music.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-[10px] font-medium underline underline-offset-4 opacity-60 hover:opacity-100"
          >
            YT
          </a>
        </div>
      </div>

      {showPrompt && !playing ? (
        <button
          type="button"
          onClick={toggle}
          className="fixed bottom-24 left-1/2 z-40 inline-flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-3 text-xs font-medium text-canvas shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
        >
          <Play aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">Tap anywhere to play “{music.title}”</span>
        </button>
      ) : null}
    </>
  );
}
