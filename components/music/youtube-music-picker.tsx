"use client";

import {
  Check,
  Link2,
  Music2,
  Pause,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Equalizer } from "@/components/music/equalizer";
import { AudioTrimmer } from "@/components/music/audio-trimmer";
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from "@/components/music/youtube-player";
import type { MusicTrack } from "@/lib/catalog/types";
import { cleanSongTitle } from "@/lib/music/clean-title";
import type { MusicListItem } from "@/lib/music/dto";
import type { MusicBinding } from "@/lib/music/types";
import { canonicalWatchUrl } from "@/lib/music/youtube-url";
import { cn } from "@/lib/utils/cn";

type SearchState =
  | "idle"
  | "short"
  | "loading"
  | "ready"
  | "empty"
  | "error"
  | "quota";

interface ListResponse {
  ok: boolean;
  data?: { items: MusicListItem[] };
  error?: { code?: string; message?: string };
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
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
  const previewPlayerRef = useRef<YouTubePlayerHandle>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestRef = useRef(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicListItem[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchMessage, setSearchMessage] = useState("");

  const [preview, setPreview] = useState<{
    videoId: string;
    title: string;
  } | null>(null);
  const [previewToken, setPreviewToken] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [pasteUrl, setPasteUrl] = useState("");
  const [pasteState, setPasteState] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [pasteMessage, setPasteMessage] = useState("");

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
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          if (requestId !== requestRef.current) return;
          setSearchState("error");
          setSearchMessage(
            "Couldn't search right now. Try again or paste a link.",
          );
        });
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    setPreviewPlaying(false);
  }, [value?.videoId]);

  function selectItem(item: MusicListItem) {
    onChange({
      provider: "youtube",
      videoId: item.videoId,
      title: cleanSongTitle(item.title),
      channel: item.channel,
      thumbnailUrl: item.thumbnailUrl,
      sourceUrl: canonicalWatchUrl(item.videoId),
      durationSeconds: item.durationSeconds,
      startAtSeconds: 0,
      endAtSeconds: null,
    });
  }

  function previewItem(item: MusicListItem) {
    if (preview?.videoId === item.videoId) {
      if (previewPlaying) {
        previewPlayerRef.current?.pause();
        setPreviewPlaying(false);
      } else {
        previewPlayerRef.current?.play();
        setPreviewPlaying(true);
      }
      return;
    }

    setPreview({ videoId: item.videoId, title: item.title });
    setPreviewToken((token) => token + 1);
    setPreviewPlaying(true);
    setPreviewError("");
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

  const items = results;
  const searchEnabled = searchState !== "quota";
  const selectedTitle = value ? cleanSongTitle(value.title) : legacyTrack?.title;
  const hiddenVideoId =
    preview?.videoId ?? results[0]?.videoId ?? "";
  const hiddenTitle =
    preview?.title ?? results[0]?.title ?? "Audio";

  return (
    <div
      data-testid="music-section"
      className="relative overflow-hidden rounded-card border border-hairline bg-gradient-to-br from-[#FFF9F2] via-surface to-sand p-4 shadow-soft sm:p-5"
    >
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
              One song plays while they read. Search by name, or paste a link.
            </p>
          </div>
        </div>

        {value || legacyTrack ? (
          <div
            data-testid="now-selected"
            className="relative overflow-hidden rounded-xl border border-coral/25 bg-canvas/85 p-3.5 shadow-soft"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-coral via-gold to-coral"
            />
            <div className="flex items-center gap-3">
              {value ? (
                <Image
                  src={value.thumbnailUrl}
                  alt=""
                  width={112}
                  height={112}
                  unoptimized
                  className="size-14 shrink-0 rounded-md object-cover shadow-md ring-1 ring-black/5"
                />
              ) : (
                <span className="flex size-14 items-center justify-center rounded-md bg-sand text-ink-muted">
                  <Music2 aria-hidden="true" className="size-5" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-coral-strong">
                  Now playing
                </p>
                <p className="truncate text-sm font-semibold text-ink">
                  {selectedTitle}
                </p>
                <p className="truncate text-[11px] text-ink-muted">
                  {value ? value.channel || "Unknown artist" : "Included track"}
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
          </div>
        ) : null}

        {value ? <AudioTrimmer music={value} onChange={onChange} /> : null}

        {hiddenVideoId ? (
          <YouTubePlayer
            ref={previewPlayerRef}
            videoId={hiddenVideoId}
            title={cleanSongTitle(hiddenTitle)}
            playToken={previewToken}
            hidden
            testId="audio-player-preview"
            onStateChange={(state) => setPreviewPlaying(state === 1)}
            onError={(code) => {
              if (!preview) return;
              setPreviewError(
                code === 101 || code === 150
                  ? "That song can't be played here. Try another."
                  : "The preview couldn't play. Try another song.",
              );
            }}
          />
        ) : null}

        {previewError ? (
          <p role="alert" className="text-xs text-error">
            {previewError}
          </p>
        ) : null}

        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/50"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What do you want to play?"
            aria-label="Search songs"
            className="min-h-12 w-full rounded-full border border-white/10 bg-ink/90 pl-11 pr-11 text-sm text-white shadow-lg placeholder:text-white/50 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-1.5 top-1.5 flex size-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
            <Sparkles aria-hidden="true" className="size-3.5 text-gold" />
            {query.trim().length > 0 ? "Search results" : "Find a song"}
          </h3>
          <span className="rounded-full bg-canvas/70 px-2.5 py-1 text-[10px] font-medium text-ink-muted">
            {query.trim().length > 0
              ? `${items.length} result${items.length === 1 ? "" : "s"}`
              : "Search by name"}
          </span>
        </div>

        {query.trim().length === 0 ? (
          <p className="rounded-media border border-hairline bg-surface px-4 py-3 text-sm leading-relaxed text-ink-muted">
            Search for a song by name, or paste a link below. Just the one
            they&apos;ll hear.
          </p>
        ) : null}

        {searchState === "short" ? (
          <p className="rounded-media border border-hairline bg-surface px-4 py-3 text-sm text-ink-muted">
            Type at least 3 characters to search.
          </p>
        ) : null}

        {searchState === "loading" ? (
          <ul className="space-y-1" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <li
                key={index}
                className="h-14 animate-pulse rounded-xl bg-sand"
              />
            ))}
          </ul>
        ) : null}

        {searchState === "empty" ? (
          <p className="rounded-media border border-hairline bg-surface px-4 py-3 text-sm text-ink-muted">
            No songs found, try another name.
          </p>
        ) : null}

        {searchState === "error" ? (
          <p
            role="alert"
            className="rounded-media border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
          >
            {searchMessage}
          </p>
        ) : null}

        {searchState === "quota" ? (
          <p
            role="status"
            className="rounded-media border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-ink"
          >
            Search is busy right now. Try again or paste a link.
          </p>
        ) : null}

        {items.length > 0 && searchState === "ready" ? (
          <ul className="space-y-0.5">
            {items.map((item) => {
              const selected = value?.videoId === item.videoId;
              const previewing = preview?.videoId === item.videoId;
              const title = cleanSongTitle(item.title);
              return (
                <li
                  key={item.videoId}
                  data-testid="music-row"
                  className={cn(
                    "group flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors",
                    selected ? "bg-coral/10" : "hover:bg-canvas",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => previewItem(item)}
                    aria-label={`Preview ${title}`}
                    className="group/art relative size-12 shrink-0 overflow-hidden rounded-md bg-sand"
                  >
                    <Image
                      src={item.thumbnailUrl}
                      alt=""
                      width={96}
                      height={96}
                      unoptimized
                      className="size-12 object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/art:opacity-100 group-focus-visible/art:opacity-100">
                      {previewing && previewPlaying ? (
                        <Pause aria-hidden="true" className="size-4 text-white" />
                      ) : (
                        <Play
                          aria-hidden="true"
                          className="ml-0.5 size-4 text-white"
                        />
                      )}
                    </span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {title}
                    </p>
                    <p className="truncate text-[11px] text-ink-muted">
                      {item.channel || "Unknown artist"}
                    </p>
                  </div>
                  <div className="flex w-[72px] shrink-0 items-center justify-end gap-1.5">
                    {previewing && previewPlaying ? (
                      <Equalizer playing />
                    ) : null}
                    <span className="text-[11px] text-ink-muted">
                      {formatDuration(item.durationSeconds)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectItem(item)}
                    aria-pressed={selected}
                    className={cn(
                      "inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full px-3 text-[11px] font-semibold transition-colors",
                      selected
                        ? "bg-coral text-white"
                        : "border border-ink/15 bg-canvas text-ink hover:bg-ink hover:text-canvas",
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
              placeholder="Paste a song link"
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
          Audio-only playback. {searchEnabled ? "" : "Search is limited right now. "}
          One song per wish.
        </p>
      </div>
    </div>
  );
}
