"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { MemoryTemplateCard } from "@/src/components/three-memory/memory-template-card";
import {
  MEMORY_ATMOSPHERES_PUBLIC,
  MEMORY_RIGS_PUBLIC,
  MEMORY_TEMPLATES,
} from "@/src/components/three-memory/catalog";
import { usePhotoPreview } from "@/src/context/PhotoPreviewContext";
import { OCCASIONS } from "@/lib/catalog/occasions";

const PAGE_SIZE = 12;
const ALL = "all";

const RIG_INDEX = new Map(
  MEMORY_RIGS_PUBLIC.map((item, index) => [item.id, index]),
);
const PRESET_INDEX = new Map(
  MEMORY_ATMOSPHERES_PUBLIC.map((item, index) => [item.id, index]),
);

/**
 * The raw catalog is rig-major (all 15 atmospheres for one rig, then the next).
 * Order by atmosphere first so the first fold shows one card from every rig
 * instead of a dozen near-identical Polaroid cards.
 */
const MIXED_TEMPLATES = [...MEMORY_TEMPLATES].sort((a, b) => {
  const presetDelta =
    (PRESET_INDEX.get(a.preset) ?? 0) - (PRESET_INDEX.get(b.preset) ?? 0);
  if (presetDelta !== 0) return presetDelta;
  return (RIG_INDEX.get(a.rig) ?? 0) - (RIG_INDEX.get(b.rig) ?? 0);
});

const selectClass =
  "min-h-11 w-full appearance-none rounded-full border border-hairline bg-surface px-4 pr-9 text-sm text-ink transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral";

export function MemoryReelCatalog() {
  const { photos } = usePhotoPreview();
  const [occasion, setOccasion] = useState(ALL);
  const [rig, setRig] = useState(ALL);
  const [atmosphere, setAtmosphere] = useState(ALL);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () =>
      MIXED_TEMPLATES.filter((template) => {
        if (occasion !== ALL && !template.categories.includes(occasion)) return false;
        if (rig !== ALL && template.rig !== rig) return false;
        if (atmosphere !== ALL && template.preset !== atmosphere) return false;
        return true;
      }),
    [occasion, rig, atmosphere],
  );

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;
  const filtersActive = occasion !== ALL || rig !== ALL || atmosphere !== ALL;

  function update(setter: (value: string) => void, value: string) {
    setter(value);
    setVisible(PAGE_SIZE);
  }

  function reset() {
    setOccasion(ALL);
    setRig(ALL);
    setAtmosphere(ALL);
    setVisible(PAGE_SIZE);
  }

  return (
    <div>
      <div className="rounded-card border border-hairline bg-surface/70 p-4 backdrop-blur-md sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            <SlidersHorizontal aria-hidden="true" className="size-3.5" />
            Filter the catalog
          </p>
          <div className="flex items-center gap-3 text-xs text-ink-muted">
            <span>
              {shown.length} of {filtered.length} reels
            </span>
            {filtersActive ? (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-hairline px-3 py-1.5 font-medium text-ink transition-colors hover:bg-hover"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>

        <div className="-mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
          <label className="block min-w-[15rem] snap-start sm:min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Occasion
            </span>
            <select
              value={occasion}
              onChange={(event) => update(setOccasion, event.target.value)}
              className={`mt-1.5 ${selectClass}`}
            >
              <option value={ALL}>All occasions</option>
              {OCCASIONS.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-[15rem] snap-start sm:min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Rig
            </span>
            <select
              value={rig}
              onChange={(event) => update(setRig, event.target.value)}
              className={`mt-1.5 ${selectClass}`}
            >
              <option value={ALL}>All 8 rigs</option>
              {MEMORY_RIGS_PUBLIC.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-[15rem] snap-start sm:min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Atmosphere
            </span>
            <select
              value={atmosphere}
              onChange={(event) => update(setAtmosphere, event.target.value)}
              className={`mt-1.5 ${selectClass}`}
            >
              <option value={ALL}>All 15 atmospheres</option>
              {MEMORY_ATMOSPHERES_PUBLIC.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-muted">
          No reels match those filters. Try a different occasion or atmosphere.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {shown.map((template) => (
            <MemoryTemplateCard
              key={template.id}
              template={template}
              photos={photos}
            />
          ))}
        </div>
      )}

      {remaining > 0 ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisible((value) => Math.min(value + PAGE_SIZE, filtered.length))
            }
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-hairline bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-hover"
          >
            Load 12 More Reels
            <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] text-ink-muted">
              {remaining} left
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
