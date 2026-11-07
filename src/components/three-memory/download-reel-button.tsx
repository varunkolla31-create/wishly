"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  renderMemoryReel,
  type MemoryReelInput,
} from "@/src/components/three-memory/engine";
import { SAMPLE_PHOTOS } from "@/src/components/three-memory/catalog";

export function DownloadReelButton({
  input,
  className,
  label = "Download 3D Memory Reel (9:16)",
  onProgress,
}: {
  input: MemoryReelInput;
  className?: string;
  label?: string;
  onProgress?: (progress: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  async function download() {
    if (busy) return;
    setBusy(true);
    setProgress(0);
    try {
      const photos =
        input.photos.length >= 3
          ? input.photos.slice(0, 10)
          : [...input.photos, ...SAMPLE_PHOTOS].slice(0, 6);
      const reel = await renderMemoryReel(
        { ...input, photos },
        {
          onProgress: (value) => {
            setProgress(value);
            onProgress?.(value);
          },
        },
      );
      const link = document.createElement("a");
      link.href = reel.url;
      link.download = `wishly-memory-reel-${Date.now()}.${reel.extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(reel.url), 4000);
      toast.success("Your 3D memory reel is ready");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't render the reel.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-coral-strong px-5 text-sm font-medium text-white transition-colors hover:bg-coral-strong-hover disabled:opacity-60"
      >
        <Download aria-hidden="true" className="size-4" />
        {busy ? `Rendering… ${Math.round(progress * 100)}%` : label}
      </button>
      {busy ? (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
          <span
            className="block h-full rounded-full bg-white transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      ) : null}
      <p className="mt-2 text-center text-[11px] leading-relaxed text-white/60">
        Silent 9:16 video, rendered in your browser. No Spotify or YouTube audio
        is included.
      </p>
    </div>
  );
}
