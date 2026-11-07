"use client";

import { ArrowRight, Pause, Play, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TemplatePreview } from "@/components/marketing/template-preview";
import { MUSIC_TRACKS } from "@/lib/catalog/music";
import type { TemplateDefinition } from "@/lib/catalog/types";

export function InteractiveTemplateCard({
  template,
}: {
  template: TemplateDefinition;
}) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track =
    MUSIC_TRACKS.find((item) => item.mood === template.musicMood) ?? null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!open) {
      audio?.pause();
      setPlaying(false);
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      audio?.pause();
    };
  }, [open]);

  function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  const detailRows = [
    ["Type", template.titleStyle === "serif" ? "Instrument Serif italic" : "Inter semibold"],
    ["Photos", template.photoLayout],
    ["Confetti", template.confetti],
    ["Music", template.musicMood],
  ] as const;

  return (
    <article className="group">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Preview the ${template.name} template`}
        className="block w-full rounded-card text-left transition duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
      >
        <TemplatePreview template={template} />
      </button>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium text-ink">{template.name}</h3>
        <span className="text-xs text-ink-muted">
          {template.tone === "calm" ? "Calm" : "Celebratory"}
        </span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        {template.tagline}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-9 items-center rounded-full border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-hover"
        >
          Preview template
        </button>
        <Link
          href={`/create?template=${template.id}`}
          className="inline-flex min-h-9 items-center gap-1 rounded-full bg-ink px-3 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
        >
          Use this style
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/70 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${template.name} template preview`}
            className="relative my-auto w-full max-w-4xl rounded-card bg-canvas p-4 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              autoFocus
              aria-label="Close preview"
              className="absolute right-3 top-3 z-10 flex size-11 items-center justify-center rounded-full bg-ink text-canvas hover:opacity-90"
            >
              <X aria-hidden="true" className="size-4" />
            </button>

            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
              <div className="mx-auto w-full max-w-sm md:max-w-none">
                <TemplatePreview
                  template={template}
                  title="For you, always"
                  className="shadow-glow"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Wish page template
                </p>
                <h2 className="mt-2 font-serif text-3xl italic leading-tight text-ink">
                  {template.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {template.tagline}
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  {detailRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-media border border-hairline bg-surface px-3 py-2"
                    >
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        {label}
                      </dt>
                      <dd className="mt-0.5 capitalize text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>

                <button
                  type="button"
                  onClick={toggleAudio}
                  className="mt-5 flex w-full items-center gap-3 rounded-full border border-hairline bg-surface p-2 pr-4 text-left transition-colors hover:bg-hover"
                  aria-label={playing ? "Pause music preview" : "Play music preview"}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-canvas">
                    {playing ? (
                      <Pause aria-hidden="true" className="size-4" />
                    ) : (
                      <Play aria-hidden="true" className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {track?.title ?? template.musicMood}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      Music mood · {track ? "tap to listen" : "no sample"}
                    </span>
                  </span>
                  <span aria-hidden="true" className="ml-auto flex items-end gap-0.5">
                    {[10, 16, 8, 20, 12, 6].map((height, index) => (
                      <span
                        key={index}
                        className="w-0.5 rounded-full bg-coral-strong"
                        style={{ height, opacity: playing ? 1 : 0.35 }}
                      />
                    ))}
                  </span>
                </button>
                {track ? (
                  <audio
                    ref={audioRef}
                    src={track.file}
                    loop
                    preload="none"
                    onEnded={() => setPlaying(false)}
                  />
                ) : null}

                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    href={`/create?template=${template.id}`}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-coral-strong px-5 text-sm font-medium text-white transition-colors hover:bg-coral-strong-hover"
                  >
                    Use this style
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-12 items-center rounded-full border border-hairline bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-hover"
                  >
                    Keep browsing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
