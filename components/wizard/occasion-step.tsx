"use client";

import { OccasionIcon } from "@/components/marketing/occasion-icon";
import { OCCASIONS } from "@/lib/catalog/occasions";
import type { Occasion } from "@/lib/catalog/types";
import { cn } from "@/lib/utils/cn";

export function OccasionStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (occasion: Occasion) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-3xl italic leading-tight text-ink">
        What are we celebrating?
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        This sets the tone, the default template and the music.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {OCCASIONS.map((occasion) => {
          const active = occasion.slug === selected;
          return (
            <li key={occasion.slug}>
              <button
                type="button"
                onClick={() => onSelect(occasion)}
                aria-pressed={active}
                className={cn(
                  "flex min-h-28 w-full flex-col items-start gap-2 rounded-card border px-4 py-4 text-left transition-colors",
                  active
                    ? "border-ink bg-canvas"
                    : "border-hairline bg-surface hover:bg-hover",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full",
                    active ? "bg-ink text-canvas" : "bg-sand text-ink",
                  )}
                >
                  <OccasionIcon icon={occasion.icon} className="size-4" />
                </span>
                <span className="text-sm font-medium leading-snug text-ink">
                  {occasion.name}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  {occasion.tone === "calm" ? "Calm" : "Celebratory"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
