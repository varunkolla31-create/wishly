"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MemoryPoster } from "@/src/components/three-memory/memory-poster";
import { MemoryPreview } from "@/src/components/three-memory/memory-preview";
import type { MemoryTemplate } from "@/src/components/three-memory/catalog";

export function MemoryTemplateCard({ template }: { template: MemoryTemplate }) {
  const [open, setOpen] = useState(false);
  const sampleInput = {
    templateId: template.id,
    photos: template.samplePhotos,
    title: template.name,
    receiverName: "you",
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <article className="group">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Live 3D preview of ${template.name}`}
        className="block w-full overflow-hidden rounded-card ring-1 ring-black/5 transition duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
      >
        <MemoryPoster input={sampleInput} />
      </button>
      <div className="mt-3">
        <h3 className="text-sm font-medium text-ink">{template.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          {template.tagline}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-9 items-center rounded-full border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-hover"
          >
            Live 3D preview
          </button>
          <Link
            href={`/create?reel=${template.id}`}
            className="inline-flex min-h-9 items-center gap-1 rounded-full bg-ink px-3 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Use this reel
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
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
            aria-label={`${template.name} 3D preview`}
            className="relative my-auto w-full max-w-3xl rounded-card bg-canvas p-4 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              autoFocus
              aria-label="Close 3D preview"
              className="absolute right-3 top-3 z-10 flex size-11 items-center justify-center rounded-full bg-ink text-canvas hover:opacity-90"
            >
              <X aria-hidden="true" className="size-4" />
            </button>

            <div className="grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:items-center">
              <MemoryPreview input={sampleInput} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  3D memory reel
                </p>
                <h2 className="mt-2 font-serif text-3xl italic leading-tight text-ink">
                  {template.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {template.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {template.categories.slice(0, 6).map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11px] capitalize text-ink-muted"
                    >
                      {category.replaceAll("-", " ")}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    href={`/create?reel=${template.id}`}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-coral-strong px-5 text-sm font-medium text-white transition-colors hover:bg-coral-strong-hover"
                  >
                    Use this reel
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                  <Link
                    href={`/studio/${template.id}`}
                    className="inline-flex min-h-12 items-center rounded-full border border-hairline bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-hover"
                  >
                    Open in studio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
