"use client";

import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TemplatePalette } from "@/lib/catalog/types";

const HOLD_MS = 1500;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function HeartbeatGate({
  postscript,
  palette,
  onRevealed,
}: {
  postscript?: string | null;
  palette?: TemplatePalette;
  onRevealed?: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const releasedRef = useRef(false);

  useEffect(
    () => () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  function finish() {
    if (revealed) return;
    setRevealed(true);
    setHolding(false);
    setProgress(1);
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate([80, 60, 80]);
    }
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    onRevealed?.();
  }

  function tick(now: number) {
    if (releasedRef.current || startRef.current === null) return;
    const next = Math.min(1, (now - startRef.current) / HOLD_MS);
    setProgress(next);
    if (next >= 1) {
      finish();
      return;
    }
    frameRef.current = window.requestAnimationFrame(tick);
  }

  function start() {
    if (revealed || holding) return;
    setHolding(true);
    releasedRef.current = false;
    startRef.current = performance.now();
    frameRef.current = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (revealed) return;
    releasedRef.current = true;
    setHolding(false);
    setProgress(0);
    startRef.current = null;
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }

  if (!postscript?.trim()) return null;

  const muted = palette?.muted ?? "currentColor";
  const accent = palette?.accent ?? "#D6C283";
  const text = palette?.text ?? "currentColor";

  return (
    <section
      className="mt-8 rounded-card border px-5 py-6 text-center"
      style={{
        borderColor: `${accent}55`,
        backgroundColor: palette?.surface,
        color: text,
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: muted }}
      >
        Secret heartbeat
      </p>
      <h2 className="mt-2 font-serif text-2xl italic leading-tight">
        Hold the heart to hear what it says.
      </h2>

      <button
        type="button"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          start();
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onPointerLeave={stop}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            start();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " " || event.key === "Enter") stop();
        }}
        aria-label="Press and hold for 1.5 seconds to reveal the secret P.S."
        className="relative mx-auto mt-5 flex size-32 touch-none select-none items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6C283]"
      >
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 size-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={`${muted}33`}
            strokeWidth="4"
          />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={accent}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            style={{ filter: `drop-shadow(0 0 10px ${accent}88)` }}
          />
        </svg>
        <span
          className={`flex size-24 items-center justify-center rounded-full transition-transform ${
            holding ? "scale-105" : ""
          }`}
          style={{
            backgroundColor: `${accent}22`,
            boxShadow: `0 0 38px ${accent}33`,
            animation: holding ? "pulse 900ms ease-in-out infinite" : undefined,
          }}
        >
          <Heart
            aria-hidden="true"
            className="size-9"
            style={{
              color: accent,
              fill: revealed ? accent : "transparent",
              transform: holding ? "scale(1.12)" : "scale(1)",
              transition: "transform 180ms ease, fill 300ms ease",
            }}
          />
        </span>
      </button>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-xs leading-relaxed"
        style={{ color: muted }}
      >
        {revealed
          ? "There it is."
          : holding
            ? "Keep holding…"
            : "Press and hold for 1.5 seconds."}
      </p>

      <div
        className={`mt-4 rounded-media border px-4 py-3 text-left text-sm leading-relaxed transition-all duration-700 ${
          revealed ? "opacity-100 blur-0" : "select-none opacity-45 blur-sm"
        }`}
        style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0F` }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: muted }}
        >
          P.S.
        </p>
        <p className="mt-1">{postscript}</p>
      </div>
    </section>
  );
}
