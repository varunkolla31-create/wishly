"use client";

import { Check, Link2, Music2, Play, Search, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { YouTubePlayer } from "@/components/music/youtube-player";
import type { MusicTrack } from "@/lib/catalog/types";
import type { MusicListItem } from "@/lib/music/dto";
import type { MusicBinding } from "@/lib/music/types";
import { canonicalWatchUrl } from "@/lib/music/youtube-url";
import { cn } from "@/lib/utils/cn";

type TopSource = "youtube" | "cache" | "fallback";
type TopState = "loading" | "ready" | "error";
type SearchState = "idle" | "short" | "loading" | "ready" | "empty" | "error" | "quota";

interface ListResponse {
  ok: boolean;
  data?: { source: TopSource; items: MusicListItem[] };
  error?: { code?: string; message?: string };
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function formatClock(seconds: number | null): string {
  const safe = Math.max(0, Math.trunc(seconds ?? 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function parseClock(value: string): number | null {
  const match = /^(\d{1,3}):([0-5]?\d)$/.exec(value.trim());
  if (!match) return null;
  const seconds = Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
  return seconds <= 86_400 ? seconds : null;
}

export function YouTubeMusicPicker({
  value,
  legacyTrack,
  onChange,
}: {
  value: MusicBinding | null;
  legacyTrack: MusicTrack | null;
  onChange: (music: MusicBinding | null) => void;
}) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestRef = useRef(0);

  const [top, setTop] = useState<MusicListItem[]>([]);
  const [topSource, setTopSource] = useState<TopSource>("youtube");
  const [topState, setTopState] = useState<TopState>("loading");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicListItem[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchMessage, setSearchMessage] = useState("");

  const [preview, setPreview] = useState<{ videoId: string; title: string } | null>(null);
  const [previewToken, setPreviewToken] = useState(0);
  const [previewError, setPreviewError] = useState("");

  const [startText, setStartText] = useState(formatClock(value?.startAtSeconds ?? 0));
  const [pasteUrl, setPasteUrl] = useState("");
  const [pasteState, setPasteState] = useState<"idle" | "loading" | "error">("idle");
  const [pasteMessage, setPasteMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setTopState("loading");
    void fetch("/api/music/top", { signal: controller.signal })
      .then((response) => response.json() as Promise<ListResponse>)
      .then((body) => {
        if (!body.ok || !body.data) throw new Error("top_failed");
        setTop(body.data.items);
        setTopSource(body.data.source);
        setTopState("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setTopState("error");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    abortRef.current?.abort();
    const requestId = ++requestRef.current;

    if (trimmed.length === 0) {
      setResults([]);
      setSearchState("idle");
      setSearchMessage("");
      return undefined;
    }
    if (trimmed.length < 3) {
      setResults([]);
      setSearchState("short");
      setSearchMessage("");
      return undefined;
    }

    setResults([]);
    setSearchState("loading");
    setSearchMessage("");
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = window.setTimeout(() => {
      void fetch(`/api/music/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          const body = (await response.json()) as ListResponse & {
            error?: { code?: string; message?: string };
          };
          if (requestId !== requestRef.current) return;
          if (!response.ok || !body.ok) {
            if (body.error?.code === "quota_busy") {
              setSearchState("quota");
              return;
            }
            if (response.status === 429) {
              setSearchState("error");
              setSearchMessage("A little slower — try again in a minute.");
              return;
            }
            setSearchState("error");
            setSearchMessage(
              body.error?.message ?? "Search is unavailable right now.",
            );
            return;
          }
          const items = body.data?.items ?? [];
          if (requestId !== requestRef.current) return;
          setResults(items);
          setSearchState(items.length > 0 ? "ready" : "empty");
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          if (requestId !== requestRef.current) return;
          setSearchState("error");
          setSearchMessage("Couldn't search right now. Try the Top 10 or paste a link.");
        });
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    setStartText(formatClock(value?.startAtSeconds ?? 0));
  }, [value?.videoId, value?.startAtSeconds]);

  function selectItem(item: MusicListItem) {
    onChange({
      provider: "youtube",
      videoId: item.videoId,
      title: item.title,
      channel: item.channel,
      thumbnailUrl: item.thumbnailUrl,
      sourceUrl: canonicalWatchUrl(item.videoId),
      durationSeconds: item.durationSeconds,
      startAtSeconds: 0,
    });
  }

  function previewItem(item: MusicListItem) {
    setPreview({ videoId: item.videoId, title: item.title });
    setPreviewToken((token) => token + 1);
    setPreviewError("");
  }

  function commitStart() {
    if (!value) return;
    const parsed = parseClock(startText);
    if (parsed === null) {
      setStartText(formatClock(value.startAtSeconds ?? 0));
      return;
    }
    onChange({ ...value, startAtSeconds: parsed });
  }

  async function resolvePaste() {
    if (!pasteUrl.trim() || pasteState === "loading") return;
    setPasteState("loading");
    setPasteMessage("");
    try {
      const response = await fetch("/api/music/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: pasteUrl }),
      });
      const body = (await response.json()) as {
        ok: boolean;
        data?: MusicListItem;
        error?: { message?: string };
      };
      if (!response.ok || !body.ok || !body.data) {
        setPasteState("error");
        setPasteMessage(body.error?.message ?? "Couldn't use that link.");
        return;
      }
      selectItem(body.data);
      setPasteUrl("");
      setPasteState("idle");
    } catch {
      setPasteState("error");
      setPasteMessage("Couldn't read that link just now.");
    }
  }

  const showTop = query.trim().length === 0;
  const items = showTop ? top : results;
  const searchEnabled = searchState !== "quota";

  return (
    <div className="relative overflow-hidden rounded-card border border-hairline bg-gradient-to-br from-[#FFF9F2] via-surface to-sand p-4 shadow-soft sm:p-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 size-52 rounded-full bg-coral/10 blur-3xl"
      />
      <div className="relative space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral to-[#A51444] text-white shadow-glow">
            <Music2 aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-xl italic leading-tight text-ink">
              The soundtrack
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
              One song plays while they read. Pick from the chart, search, or
              paste a link.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-hairline bg-canvas/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            YouTube
          </span>
        </div>

      {value || legacyTrack ? (
        <div
          data-testid="now-selected"
          className="relative overflow-hidden rounded-media border border-coral/25 bg-canvas/85 p-4 shadow-soft"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-coral via-gold to-coral"
          />
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-coral-strong">
            Now playing
          </p>
          <div className="mt-3 flex items-center gap-3">
            {value ? (
              <Image
                src={value.thumbnailUrl}
                alt=""
                width={112}
                height={63}
                unoptimized
                className="h-14 w-24 shrink-0 rounded-xl object-cover shadow-md ring-1 ring-black/5"
              />
            ) : (
              <span className="flex size-14 items-center justify-center rounded-xl bg-sand text-ink-muted">
                <Music2 aria-hidden="true" className="size-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {value?.title ?? legacyTrack?.title}
              </p>
              <p className="truncate text-xs text-ink-muted">
                {value ? value.channel || "YouTube" : "Included track"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchInputRef.current?.focus();
              }}
              className="min-h-8 rounded-full bg-ink px-3 text-[11px] font-semibold text-canvas transition-opacity hover:opacity-90"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="min-h-8 rounded-full border border-hairline bg-canvas px-3 text-[11px] font-medium text-ink transition-colors hover:bg-hover"
            >
              Remove
            </button>
          </div>
          {value ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-full bg-sand/70 px-3 py-2">
              <label
                htmlFor="music-start-at"
                className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted"
              >
                Start at
              </label>
              <input
                id="music-start-at"
                value={startText}
                onChange={(event) => setStartText(event.target.value)}
                onBlur={commitStart}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitStart();
                }}
                inputMode="numeric"
                placeholder="mm:ss"
                className="min-h-8 w-20 rounded-full border border-hairline bg-canvas px-3 text-xs text-ink"
              />
              <span className="text-[11px] text-ink-muted">mm:ss</span>
              <a
                href={`https://www.youtube.com/watch?v=${value.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-[11px] font-medium text-coral-strong hover:text-coral-hover"
              >
                Watch on YouTube
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      {preview ? (
        <div className="max-w-sm">
          <YouTubePlayer
            videoId={preview.videoId}
            title={preview.title}
            playToken={previewToken}
            onError={(code) =>
              setPreviewError(
                code === 101 || code === 150
                  ? "That video can't be played in an embedded player."
                  : "The preview couldn't play. Try another song.",
              )
            }
          />
          {previewError ? (
            <p role="alert" className="mt-2 text-xs text-error">
              {previewError}
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink-muted">{preview.title}</p>
          )}
        </div>
      ) : null}

      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        />
        <input
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search songs on YouTube"
          aria-label="Search songs on YouTube"
          className="min-h-12 w-full rounded-full border border-hairline bg-canvas pl-11 pr-11 text-sm text-ink shadow-sm placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              searchInputRef.current?.focus();
            }}
            aria-label="Clear search and return to the Top 10"
            className="absolute right-1.5 top-1.5 flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-hover hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
          <Sparkles aria-hidden="true" className="size-3.5 text-gold" />
          {showTop
            ? topSource === "fallback"
              ? "Wishly picks"
              : "Top 10 on YouTube"
            : "Search results"}
        </h3>
        <span className="rounded-full bg-canvas/70 px-2.5 py-1 text-[10px] font-medium text-ink-muted">
          {showTop
            ? topSource === "cache"
              ? "Cached chart"
              : "Updated live"
            : `${items.length} result${items.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {showTop && topSource === "fallback" ? (
        <p className="text-xs leading-relaxed text-ink-muted">
          YouTube isn&apos;t reachable right now, so these are Wishly picks.
          Search and paste a link are still available.
        </p>
      ) : null}

      {showTop && topState === "loading" ? (
        <ul className="space-y-2" aria-busy="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="h-16 animate-pulse rounded-media bg-sand" />
          ))}
        </ul>
      ) : null}

      {showTop && topState === "error" ? (
        <p className="rounded-media border border-hairline bg-surface px-4 py-3 text-sm text-ink-muted">
          The Top 10 is unavailable right now. Search or paste a link.
        </p>
      ) : null}

      {!showTop && searchState === "short" ? (
        <p className="rounded-media border border-hairline bg-surface px-4 py-3 text-sm text-ink-muted">
          Type at least 3 characters to search.
        </p>
      ) : null}

      {!showTop && searchState === "loading" ? (
        <ul className="space-y-2" aria-busy="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="h-16 animate-pulse rounded-media bg-sand" />
          ))}
        </ul>
      ) : null}

      {!showTop && searchState === "empty" ? (
        <p className="rounded-media border border-hairline bg-surface px-4 py-3 text-sm text-ink-muted">
          No songs found, try another name.
        </p>
      ) : null}

      {!showTop && searchState === "error" ? (
        <p role="alert" className="rounded-media border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {searchMessage}
        </p>
      ) : null}

      {!showTop && searchState === "quota" ? (
        <p role="status" className="rounded-media border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-ink">
          Search is busy right now. Pick from the Top 10 or paste a link.
        </p>
      ) : null}

      {items.length > 0 && (showTop || searchState === "ready") ? (
        <ul className="space-y-2">
          {items.map((item, index) => {
            const selected = value?.videoId === item.videoId;
            return (
              <li
                key={item.videoId}
                data-testid="music-row"
                className={cn(
                  "group flex items-center gap-3 rounded-media border px-3 py-2.5 transition-all duration-200",
                  selected
                    ? "border-coral/35 bg-gradient-to-r from-coral/10 via-canvas to-canvas shadow-[0_10px_30px_rgba(255,56,92,0.08)]"
                    : "border-hairline bg-canvas/80 hover:-translate-y-0.5 hover:border-ink/15 hover:bg-canvas hover:shadow-soft",
                )}
              >
                {showTop ? (
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                      index < 3
                        ? "bg-gradient-to-br from-gold to-[#B08A3E] text-[#2A2114] shadow-sm"
                        : "bg-sand text-ink-muted",
                    )}
                  >
                    {index + 1}
                  </span>
                ) : null}
                <Image
                  src={item.thumbnailUrl}
                  alt=""
                  width={96}
                  height={54}
                  unoptimized
                  className="h-12 w-20 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
                />
                <div className="min-w-0 flex-1">
                  <a
                    href={canonicalWatchUrl(item.videoId)}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm font-medium text-ink hover:underline"
                  >
                    {item.title}
                  </a>
                  <p className="truncate text-xs text-ink-muted">
                    {item.channel} · {formatDuration(item.durationSeconds)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => previewItem(item)}
                  aria-label={`Preview ${item.title}`}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas text-ink transition-colors hover:border-ink/20 hover:bg-hover"
                >
                  <Play aria-hidden="true" className="ml-0.5 size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => selectItem(item)}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[11px] font-semibold transition-colors",
                    selected
                      ? "bg-coral text-white shadow-[0_6px_18px_rgba(255,56,92,0.25)]"
                      : "border border-hairline bg-canvas text-ink hover:border-ink hover:bg-ink hover:text-canvas",
                  )}
                >
                  {selected ? (
                    <>
                      <Check aria-hidden="true" className="size-3" />
                      Selected
                    </>
                  ) : (
                    "Select"
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="rounded-media border border-dashed border-hairline bg-canvas/60 p-3.5">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
          <label
            htmlFor="music-paste-link"
            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted"
          >
            <Link2 aria-hidden="true" className="size-3.5" />
            Or paste a link
          </label>
          <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
        </div>
        <div className="mt-2 flex gap-2">
          <input
            id="music-paste-link"
            value={pasteUrl}
            onChange={(event) => setPasteUrl(event.target.value)}
            placeholder="https://youtu.be/…"
            className="min-h-10 min-w-0 flex-1 rounded-full border border-hairline bg-canvas px-3 text-xs text-ink shadow-sm"
          />
          <button
            type="button"
            onClick={resolvePaste}
            disabled={!pasteUrl.trim() || pasteState === "loading"}
            className="min-h-10 shrink-0 rounded-full bg-ink px-4 text-xs font-medium text-canvas disabled:opacity-50"
          >
            {pasteState === "loading" ? "Checking…" : "Use link"}
          </button>
        </div>
        {pasteState === "error" ? (
          <p role="alert" className="mt-2 text-xs text-error">
            {pasteMessage}
          </p>
        ) : null}
      </div>

      <p className="text-[11px] leading-relaxed text-ink-muted">
        Results and playback by{" "}
        <a
          href="https://www.youtube.com"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          YouTube
        </a>
        . {searchEnabled ? "" : "Search is limited right now. "}
        One song per wish.
      </p>
      </div>
    </div>
  );
}
