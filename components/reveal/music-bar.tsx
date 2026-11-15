"use client";

import { ExternalLink, Music2, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from "@/components/music/youtube-player";
import type { MusicTrack } from "@/lib/catalog/types";
import { cleanSongTitle } from "@/lib/music/clean-title";
import type { MusicBinding } from "@/lib/music/types";

const barShell =
  "fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl overflow-hidden rounded-2xl border border-[#D6C283]/35 bg-[#181818] text-white shadow-[0_0_50px_rgba(214,194,131,0.25)] backdrop-blur-md";

function BarHeader({
  title,
  subtitle,
  href,
  artwork,
  action,
}: {
  title: string;
  subtitle: string;
  href: string;
  artwork?: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-3">
      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/10">
        {artwork ? (
          <Image
            src={artwork}
            alt=""
            width={88}
            height={88}
            unoptimized
            className="size-11 object-cover"
          />
        ) : (
          <Music2 aria-hidden="true" className="size-5 text-[#D6C283]" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-[11px] text-white/60">{subtitle}</p>
      </div>
      {action}
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Open the song in a new tab"
        title="Open song"
      >
        <ExternalLink aria-hidden="true" className="size-4" />
      </a>
    </div>
  );
}

function YouTubeMusicBar({
  music,
  autoPlay,
}: {
  music: MusicBinding;
  autoPlay: boolean;
}) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const autoStarted = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playToken, setPlayToken] = useState(0);

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
    if (playing || failed || autoStarted.current) return undefined;
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

  function toggle() {
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

  return (
    <div className={barShell} aria-label="Background music">
      <YouTubePlayer
        ref={playerRef}
        videoId={music.videoId}
        title={cleanSongTitle(music.title)}
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
      <BarHeader
        title={cleanSongTitle(music.title)}
        subtitle={failed ? "Can't play here" : music.channel || "YouTube"}
        href={music.sourceUrl}
        artwork={music.thumbnailUrl}
        action={
          <button
            type="button"
            onClick={toggle}
            disabled={failed}
            aria-label={playing ? "Pause music" : "Play music"}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 disabled:opacity-50"
          >
            {playing ? (
              <Pause aria-hidden="true" className="size-4" />
            ) : (
              <Play aria-hidden="true" className="ml-0.5 size-4" />
            )}
          </button>
        }
      />
    </div>
  );
}

function SpotifyMusicBar({ music }: { music: MusicBinding }) {
  const embed = `https://open.spotify.com/embed/track/${music.videoId}?utm_source=generator&theme=0`;
  return (
    <div className={barShell} aria-label="Background music">
      <BarHeader
        title={cleanSongTitle(music.title)}
        subtitle={music.channel || "Spotify"}
        href={music.sourceUrl}
        artwork={music.thumbnailUrl}
        action={null}
      />
      <iframe
        src={embed}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={`Spotify player: ${cleanSongTitle(music.title)}`}
        className="block w-full border-0"
      />
    </div>
  );
}

function CatalogMusicBar({ track }: { track: MusicTrack }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

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
    const audio = audioRef.current;
    const pause = () => audio?.pause();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pause();
    });
    window.addEventListener("pagehide", pause);
    return () => window.removeEventListener("pagehide", pause);
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => {});
    else audio.pause();
  }

  return (
    <div className={barShell} aria-label="Background music">
      <audio
        ref={audioRef}
        src={track.file}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <BarHeader
        title={track.title}
        subtitle={track.mood || "Wishly soundtrack"}
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.title)}`}
        action={
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause music" : "Play music"}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
          >
            {playing ? (
              <Pause aria-hidden="true" className="size-4" />
            ) : (
              <Play aria-hidden="true" className="ml-0.5 size-4" />
            )}
          </button>
        }
      />
    </div>
  );
}

export function MusicBar({
  music,
  track,
  autoPlay = false,
}: {
  music?: MusicBinding | null;
  track?: MusicTrack | null;
  autoPlay?: boolean;
}) {
  if (music?.provider === "spotify") {
    return <SpotifyMusicBar music={music} />;
  }
  if (music) {
    return <YouTubeMusicBar music={music} autoPlay={autoPlay} />;
  }
  if (track) return <CatalogMusicBar track={track} />;
  return null;
}
