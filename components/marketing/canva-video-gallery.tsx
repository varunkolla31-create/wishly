"use client";

import { useMemo, useState } from "react";
import { CanvaVideoCard } from "@/components/marketing/canva-video-card";
import type {
  CanvaVideoCategory,
  CanvaVideoTemplate,
} from "@/lib/catalog/canva-videos";
import { cn } from "@/lib/utils/cn";

const PAGE_SIZE = 24;
const ASPECTS = ["all", "16:9", "9:16", "1:1"] as const;

const chipClass = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
    active
      ? "border-ink bg-ink text-canvas"
      : "border-hairline bg-surface text-ink-muted hover:text-ink",
  );

export function CanvaVideoGallery({
  templates,
  categories,
}: {
  templates: CanvaVideoTemplate[];
  categories: CanvaVideoCategory[];
}) {
  const [category, setCategory] = useState("all");
  const [aspect, setAspect] = useState<(typeof ASPECTS)[number]>("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const ordered = useMemo(() => {
    const groups = new Map<string, CanvaVideoTemplate[]>();
    for (const template of templates) {
      const group = groups.get(template.category) ?? [];
      group.push(template);
      groups.set(template.category, group);
    }
    const buckets = [...groups.values()];
    const interleaved: CanvaVideoTemplate[] = [];
    for (let index = 0; interleaved.length < templates.length; index += 1) {
      for (const bucket of buckets) {
        const template = bucket[index];
        if (template) interleaved.push(template);
      }
    }
    return interleaved;
  }, [templates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ordered.filter((template) => {
      if (category !== "all" && template.category !== category) return false;
      if (aspect !== "all" && template.aspect_ratio !== aspect) return false;
      if (freeOnly && template.plan_tier !== "FREE") return false;
      if (q) {
        const haystack = `${template.title} ${template.categoryName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [ordered, category, aspect, freeOnly, query]);

  const shown = filtered.slice(0, visible);

  const reset = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Search video templates</span>
            <input
              type="search"
              value={query}
              onChange={(event) => reset(setQuery, event.target.value)}
              placeholder="Search templates"
              className="min-h-11 w-full rounded-full border border-hairline bg-surface px-4 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {ASPECTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => reset(setAspect, value)}
                aria-pressed={aspect === value}
                className={chipClass(aspect === value)}
              >
                {value === "all" ? "All ratios" : value}
              </button>
            ))}
            <button
              type="button"
              onClick={() => reset(setFreeOnly, !freeOnly)}
              aria-pressed={freeOnly}
              className={chipClass(freeOnly)}
            >
              Free only
            </button>
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap">
            <button
              type="button"
              onClick={() => reset(setCategory, "all")}
              aria-pressed={category === "all"}
              className={chipClass(category === "all")}
            >
              All
            </button>
            {categories.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => reset(setCategory, item.key)}
                aria-pressed={category === item.key}
                className={chipClass(category === item.key)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-muted">
          {filtered.length} template{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {shown.length === 0 ? (
        <div className="mt-10 rounded-card border border-hairline bg-surface p-8 text-center">
          <p className="font-serif text-2xl italic text-ink">
            No templates match that.
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Try another category, ratio, or search term.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((template) => (
            <CanvaVideoCard key={template.id} template={template} />
          ))}
        </div>
      )}

      {visible < filtered.length ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
            className="min-h-12 rounded-full border border-hairline bg-surface px-6 text-sm font-medium text-ink transition-colors hover:bg-hover"
          >
            Show more templates
          </button>
        </div>
      ) : null}
    </div>
  );
}
