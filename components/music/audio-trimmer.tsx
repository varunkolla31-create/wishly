"use client";

import { Pause, Play, Scissors } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from "@/components/music/youtube-player";
import { cleanSongTitle } from "@/lib/music/clean-title";
import type { MusicBinding } from "@/lib/music/types";

type Handle = "start" | "end";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export function AudioTrimmer({
  music,
  onChange,
}: {
  music: MusicBinding;
  onChange: (music: MusicBinding) => void;
}) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Handle | null>(null);
  const startRef = useRef(0);
  const endRef = useRef(0);
  const durationRef = useRef(0);
  const playingRef = useRef(false);
  const musicRef = useRef(music);
  const onChangeRef = useRef(onChange);
  const initializedRef = useRef(false);
  const lastSeekRef = useRef(0);

  const [duration, setDuration] = useState(
    Math.max(0, music.durationSeconds || 0),
  );
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [dragging, setDragging] = useState<Handle | null>(null);
  const [failed, setFailed] = useState(false);

  musicRef.current = music;
  onChangeRef.current = onChange;
  startRef.current = start;
  endRef.current = end;
  durationRef.current = duration;
  playingRef.current = playing;

  useEffect(() => {
    const knownDuration = Math.max(0, music.durationSeconds || 0);
    const nextStart =
      knownDuration > 0
        ? clamp(music.startAtSeconds ?? 0, 0, Math.max(0, knownDuration - 1))
        : 0;
    const nextEnd =
      knownDuration > 0
        ? music.endAtSeconds && music.endAtSeconds > nextStart
          ? clamp(music.endAtSeconds, nextStart + 1, knownDuration)
          : knownDuration
        : 0;

    setDuration(knownDuration);
    durationRef.current = knownDuration;
    setStart(nextStart);
    startRef.current = nextStart;
    setEnd(nextEnd);
    endRef.current = nextEnd;
    setCurrent(nextStart);
    setPlaying(false);
    playingRef.current = false;
    setFailed(false);
    initializedRef.current = knownDuration > 0;
    // Only re-initialise when the selected track changes; edits stay local.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [music.videoId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      let nextDuration = 0;
      let nextCurrent = 0;
      try {
        nextDuration = player.getDuration();
        nextCurrent = player.getCurrentTime();
      } catch {
        return;
      }

      if (Number.isFinite(nextDuration) && nextDuration > 0) {
        if (!initializedRef.current) {
          initializedRef.current = true;
          const maxEnd = nextDuration;
          const nextStart = clamp(
            startRef.current,
            0,
            Math.max(0, maxEnd - 1),
          );
          const nextEnd =
            endRef.current > nextStart
              ? clamp(endRef.current, nextStart + 1, maxEnd)
              : maxEnd;

          setDuration(maxEnd);
          durationRef.current = maxEnd;
          setStart(nextStart);
          startRef.current = nextStart;
          setEnd(nextEnd);
          endRef.current = nextEnd;
          onChangeRef.current({
            ...musicRef.current,
            startAtSeconds: Math.round(nextStart),
            endAtSeconds: Math.round(nextEnd),
          });
        } else if (Math.abs(nextDuration - durationRef.current) > 0.75) {
          const maxEnd = nextDuration;
          const nextEnd =
            endRef.current > 0 ? Math.min(endRef.current, maxEnd) : maxEnd;
          setDuration(maxEnd);
          durationRef.current = maxEnd;
          setEnd(nextEnd);
          endRef.current = nextEnd;
        }
      }

      if (Number.isFinite(nextCurrent) && nextCurrent >= 0) {
        setCurrent(nextCurrent);
        if (
          playingRef.current &&
          endRef.current > startRef.current &&
          nextCurrent >= endRef.current - 0.2
        ) {
          try {
            player.seekTo(startRef.current);
            player.play();
          } catch {
            // The player may still be initialising.
          }
          setCurrent(startRef.current);
        }
      }
    }, 400);

    return () => window.clearInterval(timer);
  }, []);

  function updateFromPointer(handle: Handle, clientX: number) {
    const track = trackRef.current;
    if (!track || durationRef.current <= 0) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;

    const raw =
      clamp((clientX - rect.left) / rect.width, 0, 1) * durationRef.current;

    if (handle === "start") {
      const next = clamp(raw, 0, Math.max(0, endRef.current - 1));
      setStart(next);
      startRef.current = next;
    } else {
      const next = clamp(raw, startRef.current + 1, durationRef.current);
      setEnd(next);
      endRef.current = next;
    }

    onChangeRef.current({
      ...musicRef.current,
      startAtSeconds: Math.round(startRef.current),
      endAtSeconds: Math.round(endRef.current),
    });
  }

  function beginDrag(
    handle: Handle,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (durationRef.current <= 0 || failed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = handle;
    setDragging(handle);
    updateFromPointer(handle, event.clientX);

    if (handle === "start") {
      lastSeekRef.current = performance.now();
      playerRef.current?.seekTo(startRef.current);
      playerRef.current?.play();
      setPlaying(true);
      playingRef.current = true;
      setCurrent(startRef.current);
    }
  }

  function moveDrag(
    handle: Handle,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (dragRef.current !== handle) return;
    updateFromPointer(handle, event.clientX);

    if (handle === "start") {
      const now = performance.now();
      if (now - lastSeekRef.current > 180) {
        lastSeekRef.current = now;
        playerRef.current?.seekTo(startRef.current);
        if (!playingRef.current) {
          playerRef.current?.play();
          setPlaying(true);
          playingRef.current = true;
        }
        setCurrent(startRef.current);
      }
    }
  }

  function endDrag(handle: Handle) {
    dragRef.current = null;
    setDragging(null);

    if (handle === "start") {
      playerRef.current?.seekTo(startRef.current);
      if (!playingRef.current) {
        playerRef.current?.play();
        setPlaying(true);
        playingRef.current = true;
      }
      setCurrent(startRef.current);
      return;
    }

    if (playingRef.current) {
      playerRef.current?.seekTo(startRef.current);
      playerRef.current?.play();
      setCurrent(startRef.current);
    }
  }

  function togglePreview() {
    if (duration <= 0 || failed) return;
    if (playing) {
      playerRef.current?.pause();
      setPlaying(false);
      playingRef.current = false;
    } else {
      playerRef.current?.seekTo(startRef.current);
      playerRef.current?.play();
      setPlaying(true);
      playingRef.current = true;
      setCurrent(startRef.current);
    }
  }

  const startPct = duration > 0 ? clamp((start / duration) * 100, 0, 100) : 0;
  const endPct = duration > 0 ? clamp((end / duration) * 100, 0, 100) : 100;
  const progressPct =
    duration > 0 ? clamp((current / duration) * 100, 0, 100) : 0;
  const labelPct = (value: number) => Math.min(94, Math.max(6, value));

  return (
    <div className="rounded-xl border border-hairline bg-canvas/80 p-4">
      <YouTubePlayer
        ref={playerRef}
        videoId={music.videoId}
        title={cleanSongTitle(music.title)}
        hidden
        startAtSeconds={0}
        loop={false}
        testId="audio-player-selected"
        onStateChange={(state) => {
          if (state === 1) {
            setPlaying(true);
            playingRef.current = true;
          }
          if (state === 2) {
            setPlaying(false);
            playingRef.current = false;
          }
          if (state === 0) {
            if (endRef.current > startRef.current) {
              try {
                playerRef.current?.seekTo(startRef.current);
                playerRef.current?.play();
              } catch {
                // The player may still be initialising.
              }
              setPlaying(true);
              playingRef.current = true;
              setCurrent(startRef.current);
            } else {
              setPlaying(false);
              playingRef.current = false;
            }
          }
        }}
        onError={() => setFailed(true)}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            <Scissors aria-hidden="true" className="size-3.5 text-coral-strong" />
            Pick the best part
          </p>
          <p className="mt-1 text-sm font-medium text-ink">
            Loop a segment of the song.
          </p>
        </div>
        <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] text-canvas">
          {formatTime(Math.max(0, end - start))}
        </span>
      </div>

      {duration <= 0 ? (
        <div className="mt-5 h-1.5 animate-pulse rounded-full bg-neutral-700/30" />
      ) : (
        <div className="mt-7">
          <div ref={trackRef} className="relative h-7">
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-neutral-700/40" />
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#1DB954]"
              style={{
                left: `${startPct}%`,
                width: `${Math.max(0, endPct - startPct)}%`,
              }}
            />

            {playing && current >= start && current <= end ? (
              <span
                className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                style={{
                  left: `${progressPct}%`,
                  transition: "left 0.4s linear",
                }}
              />
            ) : null}

            <span
              className="absolute -top-5 -translate-x-1/2 rounded-full bg-ink px-1.5 py-0.5 font-mono text-[9px] text-white"
              style={{ left: `${labelPct(startPct)}%` }}
            >
              {formatTime(start)}
            </span>
            <span
              className="absolute -top-5 -translate-x-1/2 rounded-full bg-ink px-1.5 py-0.5 font-mono text-[9px] text-white"
              style={{ left: `${labelPct(endPct)}%` }}
            >
              {formatTime(end)}
            </span>

            <button
              type="button"
              aria-label="Start time"
              title="Start time"
              onPointerDown={(event) => beginDrag("start", event)}
              onPointerMove={(event) => moveDrag("start", event)}
              onPointerUp={() => endDrag("start")}
              onPointerCancel={() => endDrag("start")}
              className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-white bg-white shadow-[0_1px_6px_rgba(0,0,0,0.35)] ring-1 ring-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral ${
                dragging === "start" ? "scale-125 cursor-grabbing" : ""
              }`}
              style={{ left: `${startPct}%` }}
            />
            <button
              type="button"
              aria-label="End time"
              title="End time"
              onPointerDown={(event) => beginDrag("end", event)}
              onPointerMove={(event) => moveDrag("end", event)}
              onPointerUp={() => endDrag("end")}
              onPointerCancel={() => endDrag("end")}
              className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-white bg-white shadow-[0_1px_6px_rgba(0,0,0,0.35)] ring-1 ring-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral ${
                dragging === "end" ? "scale-125 cursor-grabbing" : ""
              }`}
              style={{ left: `${endPct}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-ink-muted">
            <span>0:00</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] leading-relaxed text-ink-muted">
          Drag the handles. The preview loops this part.
        </p>
        <button
          type="button"
          onClick={togglePreview}
          disabled={duration <= 0 || failed}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-[11px] font-semibold text-canvas disabled:opacity-50"
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-3" />
          ) : (
            <Play aria-hidden="true" className="size-3" />
          )}
          {playing ? "Pause" : "Preview"}
        </button>
      </div>

      {failed ? (
        <p role="alert" className="mt-2 text-xs text-error">
          This song can&apos;t be previewed here. Pick another.
        </p>
      ) : null}
    </div>
  );
}
