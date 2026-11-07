"use client";

import { AudioLines, Mic, Square, Video, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadMedia } from "@/lib/media/client";
import type { MediaItem } from "@/lib/media/types";
import {
  acceptAttribute,
  type MediaKind,
} from "@/lib/media/validate";
import { cn } from "@/lib/utils/cn";

const buttonLike =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-hairline bg-canvas px-5 text-sm font-medium text-ink transition-colors hover:bg-hover";
const quietButton =
  "inline-flex min-h-10 items-center justify-center rounded-full border border-hairline bg-canvas px-4 text-xs font-medium text-ink transition-colors hover:bg-hover";
const solidButton =
  "inline-flex min-h-10 items-center justify-center rounded-full bg-ink px-4 text-xs font-medium text-canvas transition-opacity hover:opacity-90";

const IDLE_LEVELS = Array.from({ length: 20 }, () => 6);

function MediaTile({
  item,
  onRemove,
}: {
  item: MediaItem;
  onRemove: (key: string) => void;
}) {
  return (
    <li
      className={cn(
        "relative overflow-hidden rounded-media border border-hairline bg-sand",
        item.kind === "voice" && "col-span-2",
      )}
    >
      {item.kind === "photo" ? (
        <Image
          src={item.url}
          alt=""
          width={400}
          height={400}
          unoptimized
          className="aspect-square w-full object-cover"
        />
      ) : null}

      {item.kind === "video" ? (
        <video
          src={item.url}
          muted
          playsInline
          preload="metadata"
          className="aspect-square w-full object-cover"
        />
      ) : null}

      {item.kind === "voice" ? (
        <div className="flex items-center gap-3 p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-canvas">
            <AudioLines aria-hidden="true" className="size-4" />
          </span>
          <audio
            src={item.url}
            controls
            preload="metadata"
            className="min-w-0 flex-1"
          />
        </div>
      ) : null}

      <span className="absolute bottom-2 left-2 rounded-full bg-canvas/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {item.kind}
      </span>

      <button
        type="button"
        onClick={() => onRemove(item.key)}
        aria-label={`Remove ${item.kind}`}
        className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-canvas/90 text-ink shadow-soft transition-colors hover:bg-canvas"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </li>
  );
}

export function MediaUploader({
  wishId,
  media,
  onAdd,
  onRemove,
}: {
  wishId: string;
  media: MediaItem[];
  onAdd: (item: MediaItem) => void;
  onRemove: (key: string) => void;
}) {
  const [uploading, setUploading] = useState<MediaKind | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(IDLE_LEVELS);
  const [pendingVoice, setPendingVoice] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const secondsRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      void audioContextRef.current?.close().catch(() => undefined);
      if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    };
  }, []);

  async function handleFiles(
    kind: MediaKind,
    files: FileList | File[] | null,
  ) {
    if (!files) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(kind);
    try {
      for (const file of list) {
        const item = await uploadMedia(wishId, kind, file);
        onAdd(item);
      }
      toast.success("Added");
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "That upload didn't finish.",
      );
    } finally {
      setUploading(null);
    }
  }

  function stopVisualiser() {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    analyserRef.current = null;
    setLevels(IDLE_LEVELS);
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    recorderRef.current = null;
    setRecording(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopVisualiser();
  }

  async function startRecording() {
    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = null;
      setPendingUrl(null);
      setPendingVoice(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, {
          type: blob.type || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        pendingUrlRef.current = url;
        setPendingVoice(file);
        setPendingUrl(url);
      };

      const AudioContextCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextCtor) {
        const context = new AudioContextCtor();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;
        audioContextRef.current = context;

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          setLevels(
            Array.from({ length: 20 }, (_, index) => {
              const value = data[index * 2] ?? 0;
              return 6 + (value / 255) * 30;
            }),
          );
          frameRef.current = window.requestAnimationFrame(tick);
        };
        frameRef.current = window.requestAnimationFrame(tick);
      }

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      secondsRef.current = 0;
      timerRef.current = window.setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= 60) stopRecording();
      }, 1000);
    } catch {
      toast.error(
        "The microphone isn't available. You can upload a recording instead.",
      );
    }
  }

  async function usePendingVoice() {
    if (!pendingVoice) return;
    const file = pendingVoice;
    setPendingVoice(null);
    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
    setPendingUrl(null);
    await handleFiles("voice", [file]);
  }

  const busy = uploading !== null;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-ink">Photos</h3>
          <span className="text-xs text-ink-muted">Up to 10MB each</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <label
            className={cn(buttonLike, busy && "pointer-events-none opacity-50")}
          >
            Add photos
            <input
              type="file"
              accept={acceptAttribute("photo")}
              multiple
              disabled={busy}
              onChange={(event) => {
                void handleFiles("photo", event.target.files);
                event.target.value = "";
              }}
              className="sr-only"
            />
          </label>
          {uploading === "photo" ? (
            <span className="self-center text-xs text-ink-muted">
              Uploading…
            </span>
          ) : null}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-ink">Short video</h3>
          <span className="text-xs text-ink-muted">60 seconds, 100MB</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <label
            className={cn(buttonLike, busy && "pointer-events-none opacity-50")}
          >
            <Video aria-hidden="true" className="size-4" />
            Add a video
            <input
              type="file"
              accept={acceptAttribute("video")}
              disabled={busy}
              onChange={(event) => {
                void handleFiles("video", event.target.files);
                event.target.value = "";
              }}
              className="sr-only"
            />
          </label>
          {uploading === "video" ? (
            <span className="self-center text-xs text-ink-muted">
              Uploading…
            </span>
          ) : null}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-ink">
            Record a personal voice note
          </h3>
          <span className="text-xs text-ink-muted">Up to 60 seconds</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {recording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-canvas"
            >
              <Square aria-hidden="true" className="size-3.5" />
              Stop · {seconds}s / 60s
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              disabled={busy}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-hairline bg-canvas px-5 text-sm font-medium text-ink transition-colors hover:bg-hover disabled:opacity-50"
            >
              <Mic aria-hidden="true" className="size-4" />
              Record
            </button>
          )}
          <label
            className={cn(buttonLike, busy && "pointer-events-none opacity-50")}
          >
            Upload audio
            <input
              type="file"
              accept={acceptAttribute("voice")}
              disabled={busy}
              onChange={(event) => {
                void handleFiles("voice", event.target.files);
                event.target.value = "";
              }}
              className="sr-only"
            />
          </label>
          {uploading === "voice" ? (
            <span className="self-center text-xs text-ink-muted">
              Uploading…
            </span>
          ) : null}
        </div>

        {recording ? (
          <div
            className="mt-3 flex h-10 items-end gap-1 rounded-media border border-hairline bg-canvas px-3 py-2"
            aria-hidden="true"
          >
            {levels.map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-full bg-coral-strong transition-[height] duration-75"
                style={{ height }}
              />
            ))}
          </div>
        ) : null}

        {pendingUrl ? (
          <div className="mt-3 rounded-media border border-hairline bg-canvas p-3">
            <audio src={pendingUrl} controls className="w-full" />
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={usePendingVoice} className={solidButton}>
                Use this voice note
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pendingUrlRef.current) {
                    URL.revokeObjectURL(pendingUrlRef.current);
                    pendingUrlRef.current = null;
                  }
                  setPendingUrl(null);
                  setPendingVoice(null);
                  void startRecording();
                }}
                className={quietButton}
              >
                Re-record
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {media.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((item) => (
            <MediaTile key={item.key} item={item} onRemove={onRemove} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
