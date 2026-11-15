"use client";

import { useEffect, useState } from "react";
import type { TemplatePalette } from "@/lib/catalog/types";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = 365.25 * DAY;

function splitSince(target: number, now: number) {
  const elapsed = Math.max(0, now - target);
  const years = Math.floor(elapsed / YEAR);
  let rest = elapsed - years * YEAR;
  const days = Math.floor(rest / DAY);
  rest -= days * DAY;
  const hours = Math.floor(rest / HOUR);
  rest -= hours * HOUR;
  const minutes = Math.floor(rest / MINUTE);
  rest -= minutes * MINUTE;
  const seconds = Math.floor(rest / SECOND);
  return { years, days, hours, minutes, seconds };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function MilestoneCounter({
  date,
  label,
  palette,
}: {
  date: string;
  label?: string | null;
  palette: TemplatePalette;
}) {
  const target = Date.parse(date);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return undefined;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), SECOND);
    return () => window.clearInterval(timer);
  }, [target]);

  if (!date.trim() || Number.isNaN(target)) return null;

  const value = now === null ? null : splitSince(target, now);
  if (!value) return null;

  const line = `${value.years} Years • ${value.days} Days • ${pad(value.hours)} Hrs • ${pad(value.minutes)} Min • ${pad(value.seconds)} Sec`;

  return (
    <div
      className="mt-8 inline-flex max-w-full flex-col rounded-card border px-4 py-3"
      style={{
        borderColor: `${palette.muted}33`,
        backgroundColor: palette.surface,
        color: palette.text,
      }}
      role="timer"
      aria-label={label?.trim() || "Time since a special date"}
    >
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: palette.muted }}
      >
        {label?.trim() || "Time since"}
      </span>
      <span
        className="mt-1.5 font-mono text-sm leading-relaxed sm:text-base"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {line}
      </span>
    </div>
  );
}
