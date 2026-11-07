"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CanvaVideoCard } from "@/components/marketing/canva-video-card";
import type {
  CanvaVideoCategory,
  CanvaVideoTemplate,
} from "@/lib/catalog/canva-videos";
import {
  emptyStats,
  trendingScore,
  type TemplateStatsMap,
} from "@/lib/catalog/ranking";
import { cn } from "@/lib/utils/cn";

const PAGE_SIZE = 24;
const ASPECTS = ["all", "16:9", "9:16", "1:1"] as const;
const LIKED_KEY = "wishly-liked-templates";

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
  const [sort, setSort] = useState<"curated" | "popular">("curated");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<CanvaVideoTemplate | null>(null);
  const [stats, setStats] = useState<TemplateStatsMap>({});
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [sharedId, setSharedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/video-templates/stats")
      .then((response) => response.json())
      .then((body: { ok?: boolean; data?: { stats?: TemplateStatsMap } }) => {
        if (cancelled || !body?.ok) return;
        setStats(body.data?.stats ?? {});
      })
      .catch(() => undefined);

    try {
      const raw = window.localStorage.getItem(LIKED_KEY);
      if (raw) setLiked(new Set(JSON.parse(raw) as string[]));
    } catch {
      // Local storage is optional; likes still work for the session.
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

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
    const matches = ordered.filter((template) => {
      if (category !== "all" && template.category !== category) return false;
      if (aspect !== "all" && template.aspect_ratio !== aspect) return false;
      if (freeOnly && template.plan_tier !== "FREE") return false;
      if (q) {
        const haystack = `${template.title} ${template.categoryName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sort === "popular") {
      return [...matches].sort(
        (left, right) =>
          (stats[right.id]?.trending ?? 0) - (stats[left.id]?.trending ?? 0),
      );
    }
    return matches;
  }, [ordered, category, aspect, freeOnly, query, sort, stats]);

  const shown = filtered.slice(0, visible);

  const reset = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setVisible(PAGE_SIZE);
  };

  const like = (id: string) => {
    if (liked.has(id)) return;
    setLiked((previous) => {
      const next = new Set(previous);
      next.add(id);
      try {
        window.localStorage.setItem(LIKED_KEY, JSON.stringify([...next]));
      } catch {
        // Ignore storage failures.
      }
      return next;
    });

    setStats((previous) => {
      const current = previous[id] ?? emptyStats();
      const counts = {
        likes: current.likes + 1,
        shares: current.shares,
        uses: current.uses,
      };
      return {
        ...previous,
        [id]: { ...counts, trending: trendingScore(counts) },
      };
    });

    void fetch(`/api/video-templates/${id}/like`, { method: "POST" })
      .then((response) => response.json())
      .then((body: { ok?: boolean; data?: { stats?: TemplateStatsMap[string] } }) => {
        if (!body?.ok || !body.data?.stats) return;
        const next = body.data.stats;
        setStats((previous) => ({ ...previous, [id]: next }));
      })
      .catch(() => undefined);
  };

  const share = (id: string) => {
    const url = `${window.location.origin}/studio/${id}`;
    void navigator.clipboard?.writeText(url).catch(() => undefined);
    setSharedId(id);
    window.setTimeout(() => {
      setSharedId((current) => (current === id ? null : current));
    }, 2000);

    setStats((previous) => {
      const current = previous[id] ?? emptyStats();
      const counts = {
        likes: current.likes,
        shares: current.shares + 1,
        uses: current.uses,
      };
      return {
        ...previous,
        [id]: { ...counts, trending: trendingScore(counts) },
      };
    });

    void fetch(`/api/video-templates/${id}/share`, { method: "POST" })
      .then((response) => response.json())
      .then((body: { ok?: boolean; data?: { stats?: TemplateStatsMap[string] } }) => {
        if (!body?.ok || !body.data?.stats) return;
        const next = body.data.stats;
        setStats((previous) => ({ ...previous, [id]: next }));
      })
      .catch(() => undefined);
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
            <button
              type="button"
              onClick={() => reset(setSort, sort === "popular" ? "curated" : "popular")}
              aria-pressed={sort === "popular"}
              className={chipClass(sort === "popular")}
            >
              Popular
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
            <CanvaVideoCard
              key={template.id}
              template={template}
              stats={stats[template.id] ?? emptyStats()}
              liked={liked.has(template.id)}
              shared={sharedId === template.id}
              onSelect={setSelected}
              onLike={like}
              onShare={share}
            />
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

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-card bg-canvas p-4 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              autoFocus
              className="absolute right-3 top-3 z-10 rounded-full bg-ink px-3 py-1 text-xs font-medium text-canvas hover:opacity-90"
            >
              Close
            </button>
            <div className="relative aspect-video w-full overflow-hidden rounded-card bg-sand">
              <Image
                src={selected.thumb}
                alt={selected.title}
                fill
                sizes="(min-width: 1024px) 900px, 100vw"
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl italic leading-tight text-ink">
                  {selected.title}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {selected.categoryName} · {selected.aspect_ratio} ·{" "}
                  {selected.plan_tier === "FREE" ? "Free" : "Pro"}
                </p>
              </div>
              <Link
                href={`/studio/${selected.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-coral-strong px-5 text-sm font-medium text-white transition-colors hover:bg-coral-strong-hover"
              >
                Create in app
              </Link>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              Preview hosted in Wishly. Create your own version in the studio —
              nothing opens Canva.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
