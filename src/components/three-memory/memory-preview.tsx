"use client";

import { Check, Move3d, Pause, Play } from "lucide-react";
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
import { cn } from "@/lib/utils/cn";

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
  const velocityRef = useRef({ orbit: 0, zoom: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [playing, setPlaying] = useState(true);
  const [isCoarse, setIsCoarse] = useState(false);
  const [exploring, setExploring] = useState(false);
  const reduce = useReducedMotion() ?? false;
  const photoKey = input.photos.join("|");
  const interactionsEnabled = interactive && (!isCoarse || exploring);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarse(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

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

      const velocity = velocityRef.current;
      if (!dragRef.current) {
        viewRef.current.orbit += velocity.orbit;
        viewRef.current.zoom = Math.max(
          -0.9,
          Math.min(1.2, viewRef.current.zoom + velocity.zoom),
        );
        velocity.orbit *= 0.93;
        velocity.zoom *= 0.9;
        if (Math.abs(velocity.orbit) < 0.0002) velocity.orbit = 0;
        if (Math.abs(velocity.zoom) < 0.0002) velocity.zoom = 0;
      }

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
    <div
      className={cn(
        "relative overflow-hidden rounded-card bg-[#0B1418]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        aria-label="Interactive 3D memory preview"
        className={cn(
          "mx-auto block h-[60vh] w-auto max-w-full cursor-grab active:cursor-grabbing sm:h-auto sm:w-full sm:aspect-[9/16]",
          exploring ? "touch-none" : "touch-pan-y sm:touch-none",
        )}
        onPointerDown={(event) => {
          if (!interactionsEnabled) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = { x: event.clientX, y: event.clientY };
          velocityRef.current.orbit = 0;
          velocityRef.current.zoom = 0;
        }}
        onPointerMove={(event) => {
          if (!interactionsEnabled || !dragRef.current) return;
          const deltaX = event.clientX - dragRef.current.x;
          const deltaY = event.clientY - dragRef.current.y;
          dragRef.current = { x: event.clientX, y: event.clientY };
          viewRef.current.orbit += deltaX * 0.012;
          viewRef.current.zoom = Math.max(
            -0.9,
            Math.min(1.2, viewRef.current.zoom + deltaY * 0.0032),
          );
          velocityRef.current.orbit = deltaX * 0.0032;
          velocityRef.current.zoom = deltaY * 0.0012;
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      />

      {isCoarse && interactive && !exploring ? (
        <button
          type="button"
          onClick={() => setExploring(true)}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2.5 bg-black/30 px-6 text-center backdrop-blur-[1px]"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-white/95 text-ink shadow-lg">
            <Move3d aria-hidden="true" className="size-5" />
          </span>
          <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-ink shadow-lg">
            Tap to explore 3D
          </span>
          <span className="max-w-[15rem] text-[11px] leading-relaxed text-white/85">
            Scrolling stays normal until you tap in.
          </span>
        </button>
      ) : null}

      {isCoarse && interactive && exploring ? (
        <button
          type="button"
          onClick={() => setExploring(false)}
          className="absolute right-3 top-3 z-30 flex min-h-10 items-center gap-1.5 rounded-full bg-black/65 px-3 text-xs font-medium text-white backdrop-blur"
        >
          <Check aria-hidden="true" className="size-3.5" />
          Done
        </button>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 p-3">
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
          {reduce ? "Reduced motion" : exploring ? "Drag to explore" : "Tap to explore"}
        </span>
      </div>
    </div>
  );
}
