"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  drawMemoryFrame,
  loadMemoryImages,
  reelFonts,
  REEL_DURATION_MS,
  type MemoryReelInput,
  type ReelFonts,
} from "@/src/components/three-memory/engine";
import { SAMPLE_PHOTOS } from "@/src/components/three-memory/catalog";

const DEFAULT_FONTS: ReelFonts = {
  serif: "Georgia, serif",
  sans: "system-ui, sans-serif",
};

export function MemoryPreview({
  input,
  className,
  interactive = true,
}: {
  input: MemoryReelInput;
  className?: string;
  interactive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef(input);
  inputRef.current = input;
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const fontsRef = useRef<ReelFonts>(DEFAULT_FONTS);
  const viewRef = useRef({ orbit: 0, zoom: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [playing, setPlaying] = useState(true);
  const reduce = useReducedMotion() ?? false;
  const photoKey = input.photos.join("|");

  useEffect(() => {
    fontsRef.current = reelFonts();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const sources =
      input.photos.length > 0 ? input.photos : SAMPLE_PHOTOS.slice(0, 5);
    void loadMemoryImages(sources).then((images) => {
      if (!cancelled) imagesRef.current = images;
    });
    return () => {
      cancelled = true;
    };
  }, [photoKey, input.photos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    canvas.width = 540;
    canvas.height = 960;

    let frame = 0;
    let startedAt = performance.now();
    let pausedAt = 0;
    let wasPlaying = playing;

    const loop = (now: number) => {
      if (playing) {
        if (!wasPlaying) {
          startedAt = now - pausedAt;
          wasPlaying = true;
        }
        pausedAt = now - startedAt;
      } else {
        wasPlaying = false;
      }
      const seconds = Math.max(0, playing ? now - startedAt : pausedAt) / 1000;
      const duration = REEL_DURATION_MS / 1000;
      const progress = (seconds % duration) / duration;
      context.setTransform(0.5, 0, 0, 0.5, 0, 0);
      context.clearRect(0, 0, 1080, 1920);
      drawMemoryFrame(
        context,
        inputRef.current,
        imagesRef.current,
        progress,
        { ...viewRef.current, reduced: reduce },
        fontsRef.current,
      );
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing, reduce]);

  return (
    <div className={`relative overflow-hidden rounded-card bg-[#0B1418] ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        aria-label="Interactive 3D memory preview"
        className="block aspect-[9/16] w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(event) => {
          if (!interactive) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          if (!interactive || !dragRef.current) return;
          const deltaX = event.clientX - dragRef.current.x;
          const deltaY = event.clientY - dragRef.current.y;
          dragRef.current = { x: event.clientX, y: event.clientY };
          viewRef.current.orbit += deltaX * 0.006;
          viewRef.current.zoom = Math.max(
            -0.6,
            Math.min(0.9, viewRef.current.zoom + deltaY * 0.0018),
          );
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-3">
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          className="pointer-events-auto flex min-h-10 items-center gap-2 rounded-full bg-black/55 px-3 text-xs font-medium text-white backdrop-blur"
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-3.5" />
          ) : (
            <Play aria-hidden="true" className="size-3.5" />
          )}
          {playing ? "Pause" : "Play"}
        </button>
        <span className="rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur">
          {reduce ? "Reduced motion" : "Drag to explore"}
        </span>
      </div>
    </div>
  );
}
