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

  if (Number.isNaN(target)) return null;

  const value =
    now === null
      ? { years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
      : splitSince(target, now);

  const cells = [
    ["Years", value.years],
    ["Days", value.days],
    ["Hours", value.hours],
    ["Minutes", value.minutes],
    ["Seconds", value.seconds],
  ] as const;

  return (
    <div
      className="mt-8 rounded-card border px-4 py-4"
      style={{
        borderColor: `${palette.muted}33`,
        backgroundColor: palette.surface,
        color: palette.text,
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: palette.muted }}
      >
        {label?.trim() || "Time since"}
      </p>
      <div
        className="mt-3 grid grid-cols-5 gap-1 text-center"
        style={{ fontVariantNumeric: "tabular-nums" }}
        aria-label="Live time since milestone"
      >
        {cells.map(([name, amount], index) => (
          <div key={name} className="min-w-0">
            <span className="block font-mono text-lg leading-none sm:text-2xl">
              {String(amount).padStart(2, "0")}
            </span>
            <span
              className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.1em] sm:text-[10px]"
              style={{ color: palette.muted }}
            >
              {name}
            </span>
            {index < cells.length - 1 ? (
              <span className="sr-only">, </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
