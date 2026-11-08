"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { MAX_PHOTOS, usePhotoPreview } from "@/src/context/PhotoPreviewContext";

export function PhotoPreviewBar() {
  const { photos, addFiles, clear } = usePhotoPreview();

  return (
    <div className="sticky top-16 z-30 border-b border-hairline bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-90">
          <ImagePlus aria-hidden="true" className="size-4" />
          Upload Your Photos (3–10) to Preview All 120 3D Reels Live
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) void addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {photos.slice(0, MAX_PHOTOS).map((photo, index) => (
            <Image
              key={`${photo.slice(-24)}-${index}`}
              src={photo}
              alt=""
              width={44}
              height={56}
              unoptimized
              className="h-14 w-11 shrink-0 rounded-md border border-hairline object-cover"
            />
          ))}
          {photos.length === 0 ? (
            <span className="text-xs text-ink-muted">
              Add photos once and every reel below updates instantly.
            </span>
          ) : null}
        </div>

        <span className="text-xs text-ink-muted">
          {photos.length}/{MAX_PHOTOS} · live in every reel
        </span>

        {photos.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex min-h-9 items-center gap-1 rounded-full border border-hairline px-3 text-xs font-medium text-ink transition-colors hover:bg-hover"
          >
            <X aria-hidden="true" className="size-3.5" />
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
