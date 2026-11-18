"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  reelCapability,
  renderMemoryReel,
  type MemoryReelInput,
} from "@/src/components/three-memory/engine";
import { SAMPLE_PHOTOS } from "@/src/components/three-memory/catalog";
import { MUSIC_TRACKS } from "@/lib/catalog/music";
import { cn } from "@/lib/utils/cn";

const selectClass =
  "min-h-11 w-full appearance-none rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

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
  const [audioChoice, setAudioChoice] = useState<string>("");
  const [ownedAudio, setOwnedAudio] = useState<string | null>(null);
  const [capability, setCapability] = useState<
    ReturnType<typeof reelCapability> | undefined
  >(undefined);

  // Capability is a browser question, so it is answered after mount.
  useEffect(() => {
    setCapability(reelCapability());
    return () => {
      if (ownedAudio) URL.revokeObjectURL(ownedAudio);
    };
  }, [ownedAudio]);

  function pickOwnAudio(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("That isn't an audio file.");
      return;
    }
    if (ownedAudio) URL.revokeObjectURL(ownedAudio);
    const url = URL.createObjectURL(file);
    setOwnedAudio(url);
    setAudioChoice("own");
  }

  async function download() {
    if (busy) return;
    setBusy(true);
    setProgress(0);
    try {
      const photos =
        input.photos.length >= 3
          ? input.photos.slice(0, 10)
          : [...input.photos, ...SAMPLE_PHOTOS].slice(0, 6);

      const audioUrl =
        audioChoice === "own"
          ? (ownedAudio ?? undefined)
          : audioChoice
            ? MUSIC_TRACKS.find((track) => track.id === audioChoice)?.file
            : undefined;

      const reel = await renderMemoryReel(
        { ...input, photos },
        {
          onProgress: (value) => {
            setProgress(value);
            onProgress?.(value);
          },
          audioUrl,
        },
      );

      const link = document.createElement("a");
      link.href = reel.url;
      link.download = `wishly-memory-reel-${Date.now()}.${reel.extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(reel.url), 4000);

      toast.success(
        reel.degraded
          ? `Saved as ${reel.extension.toUpperCase()}. This browser can't record MP4 — convert it before posting to Instagram.`
          : "Your 3D memory reel is ready",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't render the reel.",
      );
    } finally {
      setBusy(false);
    }
  }

  const canRecord = capability !== null;
  const mp4 = capability?.container === "mp4";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={download}
        disabled={busy || !canRecord}
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

      {canRecord ? (
        <div className="mt-3 space-y-2">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">
              Music (optional)
            </span>
            <select
              value={audioChoice}
              onChange={(event) => setAudioChoice(event.target.value)}
              className={cn(selectClass, "mt-1")}
            >
              <option value="">Silent</option>
              {MUSIC_TRACKS.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.title} · {track.mood}
                </option>
              ))}
              <option value="own">Use my own audio file…</option>
            </select>
          </label>

          {audioChoice === "own" ? (
            <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-xs font-medium text-white">
              {ownedAudio ? "Replace audio file" : "Choose an audio file"}
              <input
                type="file"
                accept="audio/*"
                className="sr-only"
                onChange={(event) => {
                  pickOwnAudio(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          ) : null}

          <p className="text-[11px] leading-relaxed text-white/60">
            {mp4
              ? "Exports as MP4 (H.264), which plays in WhatsApp, Instagram and on iOS."
              : "Heads up: this browser can only record WebM. It plays in Chrome and Android, but Instagram and iOS may reject it — export from Chrome or Safari for MP4."}{" "}
            Bundled tracks are royalty-free; no Spotify or YouTube audio is ever
            embedded.
          </p>
        </div>
      ) : (
        <p className="mt-2 rounded-media bg-white/10 px-3 py-2 text-[11px] leading-relaxed text-white/75">
          This browser can&apos;t record video here. On iPhone or iPad, use
          Safari. On Android, use Chrome. You can still use the wish page exactly
          as it is.
        </p>
      )}
    </div>
  );
}
