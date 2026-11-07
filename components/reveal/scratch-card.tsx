"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { TemplatePalette } from "@/lib/catalog/types";

const REVEAL_THRESHOLD = 0.42;

export function ScratchCard({
  message,
  palette,
}: {
  message: string;
  palette: TemplatePalette;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) return undefined;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const paint = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const width = rect.width;
      const height = rect.height;
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#eddbb0");
      gradient.addColorStop(0.32, "#d6c283");
      gradient.addColorStop(0.55, "#f4e6c2");
      gradient.addColorStop(0.78, "#cbb27a");
      gradient.addColorStop(1, "#e2cc98");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      for (let index = 0; index < 160; index += 1) {
        context.fillStyle =
          index % 2 === 0
            ? "rgba(255,255,255,0.22)"
            : "rgba(110,88,38,0.10)";
        context.beginPath();
        context.arc(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 1.5 + 0.4,
          0,
          Math.PI * 2,
        );
        context.fill();
      }

      context.strokeStyle = "rgba(255,255,255,0.20)";
      context.lineWidth = 1;
      for (let x = -height; x < width; x += 16) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x + height, height);
        context.stroke();
      }

      context.fillStyle = "rgba(72,54,20,0.72)";
      context.textAlign = "center";
      context.font = "600 13px system-ui, sans-serif";
      context.fillText("SCRATCH TO REVEAL", width / 2, height / 2 + 4);
      context.font = "400 11px system-ui, sans-serif";
      context.fillText("or use the button below", width / 2, height / 2 + 24);
    };

    const frame = window.requestAnimationFrame(paint);
    const observer = new ResizeObserver(paint);
    observer.observe(container);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [revealed]);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function scratch(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const next = point(event);
    const last = lastRef.current ?? next;

    context.globalCompositeOperation = "destination-out";
    context.lineWidth = 36;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(last.x, last.y);
    context.lineTo(next.x, next.y);
    context.stroke();
    context.beginPath();
    context.arc(next.x, next.y, 18, 0, Math.PI * 2);
    context.fill();
    context.globalCompositeOperation = "source-over";
    lastRef.current = next;
  }

  function clearedFraction() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return 0;
    const { width, height } = canvas;
    if (width === 0 || height === 0) return 0;
    const { data } = context.getImageData(0, 0, width, height);
    let total = 0;
    let cleared = 0;
    const step = 14;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        total += 1;
        if ((data[(y * width + x) * 4 + 3] ?? 255) < 40) cleared += 1;
      }
    }
    return total === 0 ? 0 : cleared / total;
  }

  function finishScratching() {
    if (revealed) return;
    if (clearedFraction() >= REVEAL_THRESHOLD) setRevealed(true);
  }

  return (
    <section className="mt-10">
      <p
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]"
        style={{ color: palette.muted }}
      >
        <Sparkles aria-hidden="true" className="size-3.5 text-gold" />
        A little extra
      </p>

      <div
        className="mt-3 rounded-card border p-4"
        style={{
          borderColor: `${palette.muted}33`,
          backgroundColor: "rgba(0,0,0,0.16)",
        }}
      >
        <div
          ref={containerRef}
          className="relative flex min-h-[150px] select-none items-center justify-center overflow-hidden rounded-media px-5 py-8 text-center"
        >
          <p
            className="max-w-md font-serif text-xl italic leading-relaxed sm:text-2xl"
            style={{ color: palette.text }}
            aria-hidden={!revealed}
          >
            {message}
          </p>

          <canvas
            ref={canvasRef}
            aria-hidden="true"
            onPointerDown={(event) => {
              if (revealed) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              drawingRef.current = true;
              lastRef.current = point(event);
              scratch(event);
            }}
            onPointerMove={(event) => {
              if (!drawingRef.current || revealed) return;
              scratch(event);
            }}
            onPointerUp={() => {
              drawingRef.current = false;
              lastRef.current = null;
              finishScratching();
            }}
            onPointerCancel={() => {
              drawingRef.current = false;
              lastRef.current = null;
            }}
            className={`absolute inset-0 size-full cursor-grab touch-none rounded-media transition-opacity duration-500 ${
              revealed ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs" style={{ color: palette.muted }}>
            Use a finger or mouse to scratch the gold foil.
          </p>
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="min-h-9 shrink-0 rounded-full border px-3 text-xs font-medium"
              style={{
                borderColor: `${palette.muted}55`,
                color: palette.text,
              }}
            >
              Reveal the note
            </button>
          ) : null}
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {revealed ? `Bonus note revealed: ${message}` : ""}
        </p>
      </div>
    </section>
  );
}
