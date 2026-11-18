"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { DownloadReelButton } from "@/src/components/three-memory/download-reel-button";
import { MemoryPreview } from "@/src/components/three-memory/memory-preview";
import {
  MEMORY_ATMOSPHERES_PUBLIC,
  MEMORY_RIGS_PUBLIC,
  getMemoryTemplate,
} from "@/src/components/three-memory/catalog";
import { cn } from "@/lib/utils/cn";

const inputClass =
  "mt-1 min-h-11 w-full rounded-xl border border-hairline bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral";

function templateFor(rig: string, preset: string) {
  const template = getMemoryTemplate(`${rig}--${preset}`);
  if (!template) throw new Error(`Unknown memory template: ${rig}--${preset}`);
  return template;
}

export function MemoryWorkbench() {
  const [rig, setRig] = useState(MEMORY_RIGS_PUBLIC[0]?.id ?? "3d-polaroid-clothesline");
  const [preset, setPreset] = useState(MEMORY_ATMOSPHERES_PUBLIC[0]?.id ?? "classic");
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState("A memory for you");
  const [receiverName, setReceiverName] = useState("");
  const owned = useRef<string[]>([]);

  const template = templateFor(rig, preset);
  const initialPhotos = template.samplePhotos.slice(0, 5);
  const activePhotos = photos.length > 0 ? photos : initialPhotos;

  useEffect(
    () => () => {
      owned.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...activePhotos];
    for (const file of Array.from(list).slice(0, 10 - next.length)) {
      const url = URL.createObjectURL(file);
      owned.current.push(url);
      next.push(url);
    }
    setPhotos(next.slice(0, 10));
  }

  function resetPhotos() {
    owned.current.forEach((url) => URL.revokeObjectURL(url));
    owned.current = [];
    setPhotos([]);
  }

  const input = {
    templateId: template.id,
    photos: activePhotos,
    title,
    receiverName,
    senderName: "",
    message: "",
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
      <div className="self-start lg:sticky lg:top-24">
        <MemoryPreview input={input} />
        <p className="mt-3 text-center text-xs text-ink-muted">
          Drag the preview to orbit the scene. {activePhotos.length}/10 photos.
        </p>
        <div className="mt-4 rounded-card bg-[#121212] p-4">
          <DownloadReelButton input={input} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-card border border-hairline bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-ink">Photos</h2>
            <span className="text-xs text-ink-muted">
              {activePhotos.length}/10 · at least 3
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-hairline bg-canvas px-4 text-sm font-medium text-ink transition-colors hover:bg-hover">
              <ImagePlus aria-hidden="true" className="size-4" />
              Upload photos
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
            {photos.length > 0 ? (
              <button
                type="button"
                onClick={resetPhotos}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-canvas px-4 text-sm font-medium text-ink transition-colors hover:bg-hover"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Back to samples
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            This workbench keeps your photos in this browser tab. Nothing is
            uploaded and nothing is saved — close or refresh and they are gone.
            To send a reel to someone,{" "}
            <a
              href="/create"
              className="font-medium text-coral-strong underline underline-offset-4 hover:text-coral-hover"
            >
              create a wish
            </a>
            , where photos upload to our servers when you publish.
          </p>
        </div>

        <fieldset className="rounded-card border border-hairline bg-surface p-5">
          <legend className="px-1 text-sm font-medium text-ink">Rig</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {MEMORY_RIGS_PUBLIC.map((item) => {
              const active = item.id === rig;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRig(item.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors",
                    active
                      ? "border-ink bg-canvas text-ink"
                      : "border-hairline bg-canvas/40 text-ink-muted hover:bg-hover hover:text-ink",
                  )}
                >
                  {item.name.replace(/^3D\s+/, "")}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="rounded-card border border-hairline bg-surface p-5">
          <legend className="px-1 text-sm font-medium text-ink">Atmosphere</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {MEMORY_ATMOSPHERES_PUBLIC.map((item) => {
              const active = item.id === preset;
              const accent = getMemoryTemplate(`${rig}--${item.id}`)?.accent;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPreset(item.id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors",
                    active
                      ? "border-ink bg-canvas text-ink"
                      : "border-hairline bg-canvas/40 text-ink-muted hover:bg-hover hover:text-ink",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-3 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: accent }}
                  />
                  {item.name}
                </button>
              );
            })}
          </div>
        </fieldset>

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
              onChange={(event) => setReceiverName(event.target.value.slice(0, 60))}
              placeholder="Amma"
              className={inputClass}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
