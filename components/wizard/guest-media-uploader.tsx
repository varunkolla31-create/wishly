"use client";

import { ImagePlus, Video, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { GuestMediaItem } from "@/components/wizard/use-guest-media";
import type { GuestMediaKind } from "@/lib/media/guest-store";
import { cn } from "@/lib/utils/cn";

const addButton =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-hairline bg-canvas px-4 text-sm font-medium text-ink transition-colors hover:bg-hover";

export function GuestMediaUploader({
  media,
  busy,
  ready,
  onAdd,
  onRemove,
  maxPhotos,
  maxVideos,
}: {
  media: GuestMediaItem[];
  busy: boolean;
  ready: boolean;
  onAdd: (kind: GuestMediaKind, files: FileList | File[]) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  maxPhotos: number;
  maxVideos: number;
}) {
  const photos = media.filter((item) => item.kind === "photo").length;
  const videos = media.filter((item) => item.kind === "video").length;
  const disabled = busy || !ready;

  function pick(kind: GuestMediaKind, files: FileList | null) {
    if (!files || files.length === 0) return;
    void onAdd(kind, files).catch((error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "That file couldn't be added.",
      );
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className={cn(addButton, disabled && "pointer-events-none opacity-50")}>
          <ImagePlus aria-hidden="true" className="size-4" />
          Add photos
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={disabled}
            onChange={(event) => {
              pick("photo", event.target.files);
              event.target.value = "";
            }}
            className="sr-only"
          />
        </label>

        <label className={cn(addButton, disabled && "pointer-events-none opacity-50")}>
          <Video aria-hidden="true" className="size-4" />
          Add videos
          <input
            type="file"
            accept="video/*"
            multiple
            disabled={disabled}
            onChange={(event) => {
              pick("video", event.target.files);
              event.target.value = "";
            }}
            className="sr-only"
          />
        </label>

        {!ready ? (
          <span className="text-xs text-ink-muted">Loading your media…</span>
        ) : busy ? (
          <span className="text-xs text-ink-muted">Adding…</span>
        ) : null}
      </div>

      <p className="text-xs leading-relaxed text-ink-muted">
        {photos}/{maxPhotos} photos · {videos}/{maxVideos} videos. They stay in
        this browser until you publish, then upload privately with your wish.
      </p>

      {media.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {media.map((item) => (
            <li
              key={item.id}
              className="relative overflow-hidden rounded-media border border-hairline bg-sand"
            >
              {item.kind === "photo" ? (
                <Image
                  src={item.url}
                  alt=""
                  width={240}
                  height={240}
                  unoptimized
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <video
                  src={item.url}
                  poster={item.poster ?? undefined}
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-square w-full object-cover"
                />
              )}

              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-canvas/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                {item.kind}
              </span>

              <button
                type="button"
                onClick={() => {
                  void onRemove(item.id);
                }}
                aria-label={`Remove ${item.kind}`}
                className="absolute right-1.5 top-1.5 flex size-8 items-center justify-center rounded-full bg-canvas/90 text-ink shadow-soft transition-colors hover:bg-canvas"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
