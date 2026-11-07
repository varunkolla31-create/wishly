"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { DownloadReelButton } from "@/src/components/three-memory/download-reel-button";
import { MemoryPreview } from "@/src/components/three-memory/memory-preview";
import type { MemoryTemplate } from "@/src/components/three-memory/catalog";

const inputClass =
  "mt-1 min-h-11 w-full rounded-xl border border-hairline bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral";

export function MemoryStudio({ template }: { template: MemoryTemplate }) {
  const [photos, setPhotos] = useState<string[]>(template.samplePhotos.slice(0, 5));
  const [title, setTitle] = useState("A memory for you");
  const [receiverName, setReceiverName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const owned = useRef<string[]>([]);

  useEffect(
    () => () => {
      owned.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...photos];
    for (const file of Array.from(list).slice(0, 10 - next.length)) {
      const url = URL.createObjectURL(file);
      owned.current.push(url);
      next.push(url);
    }
    setPhotos(next.slice(0, 10));
  }

  const input = {
    templateId: template.id,
    photos,
    title,
    receiverName,
    senderName,
    message,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:pt-14">
      <Link
        href="/studio"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        ← All 3D reels
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            3D memory studio
          </p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
            {template.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">
            {template.description}
          </p>
        </div>
        <span className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs capitalize text-ink-muted">
          {template.tone === "calm" ? "Calm" : "Celebratory"} · 9:16
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
        <div className="self-start">
          <MemoryPreview input={input} />
          <p className="mt-3 text-center text-xs text-ink-muted">
            Drag the preview to orbit or fly through the photos.
          </p>
        </div>

        <div className="space-y-5">
          <div className="rounded-card border border-hairline bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-ink">Photos</h2>
              <span className="text-xs text-ink-muted">
                {photos.length}/10 · at least 3
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-hairline bg-canvas px-4 text-sm font-medium text-ink transition-colors hover:bg-hover">
                <ImagePlus aria-hidden="true" className="size-4" />
                Choose photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    addFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  owned.current.forEach((url) => URL.revokeObjectURL(url));
                  owned.current = [];
                  setPhotos(template.samplePhotos.slice(0, 5));
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-canvas px-4 text-sm font-medium text-ink transition-colors hover:bg-hover"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Reset samples
              </button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Photos stay in this browser until you export. Nothing is uploaded
              here.
            </p>
          </div>

          <div className="grid gap-4 rounded-card border border-hairline bg-surface p-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ink">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value.slice(0, 80))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">For</span>
              <input
                value={receiverName}
                onChange={(event) =>
                  setReceiverName(event.target.value.slice(0, 60))
                }
                placeholder="Amma"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">From</span>
              <input
                value={senderName}
                onChange={(event) =>
                  setSenderName(event.target.value.slice(0, 60))
                }
                placeholder="Your name"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Message</span>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 120))}
                placeholder="A line they'll read at the end"
                className={inputClass}
              />
            </label>
          </div>

          <div className="rounded-card bg-[#121212] p-5">
            <DownloadReelButton input={input} />
          </div>
        </div>
      </div>
    </main>
  );
}
