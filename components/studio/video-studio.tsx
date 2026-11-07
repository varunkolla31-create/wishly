"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { StudioTemplate } from "@/lib/catalog/studio-templates";

const DURATION_MS = 6000;
const FPS = 30;

const DEFAULT_HEADLINES: Record<string, string> = {
  birthdays: "Happy Birthday",
  weddings: "Save the date",
  "indian-wedding": "Sangeet & Shaadi",
  "save-the-date": "Save the date",
  anniversaries: "Happy Anniversary",
  festivals: "Happy Diwali",
  christmas: "Merry Christmas",
  "new-year": "Happy New Year",
  milestones: "A milestone to remember",
  reels: "Best moments",
  youtube: "Welcome back",
  slideshows: "Our story",
  marketing: "Something new is here",
  tributes: "In loving memory",
};

interface Palette {
  from: string;
  to: string;
  accent: string;
}

const FALLBACK: Palette = { from: "#2a1f2d", to: "#8c2f4a", accent: "#d6c283" };

function dimsFor(aspect: string) {
  if (aspect === "9:16") return { width: 720, height: 1280 };
  if (aspect === "1:1") return { width: 900, height: 900 };
  return { width: 1280, height: 720 };
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

function rgbToHex([r, g, b]: number[]) {
  return `#${[r, g, b]
    .map((channel) =>
      Math.round(clamp(channel ?? 0, 0, 255))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function mix(a: number[], b: number[], amount: number) {
  return [0, 1, 2].map((index) =>
    Math.round((a[index] ?? 0) * (1 - amount) + (b[index] ?? 0) * amount),
  );
}

function luminance([r, g, b]: number[]) {
  return ((r ?? 0) * 0.299 + (g ?? 0) * 0.587 + (b ?? 0) * 0.114) / 255;
}

function extractPalette(image: HTMLImageElement): Palette {
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return FALLBACK;

  context.drawImage(image, 0, 0, size, size);
  let pixels: Uint8ClampedArray;
  try {
    pixels = context.getImageData(0, 0, size, size).data;
  } catch {
    return FALLBACK;
  }

  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;
  let best: number[] = [255, 56, 92];
  let bestScore = -1;

  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3] ?? 0;
    if (alpha < 128) continue;
    const r = pixels[index] ?? 0;
    const g = pixels[index + 1] ?? 0;
    const b = pixels[index + 2] ?? 0;
    red += r;
    green += g;
    blue += b;
    count += 1;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const score = saturation * (max / 255);
    if (score > bestScore) {
      bestScore = score;
      best = [r, g, b];
    }
  }

  if (count === 0) return FALLBACK;

  const average = [red / count, green / count, blue / count];
  const light = luminance(average) > 0.55;
  const from = mix(average, light ? [250, 245, 235] : [16, 14, 20], light ? 0.45 : 0.25);
  const to = mix(best, light ? [255, 255, 255] : [18, 14, 20], light ? 0.35 : 0.45);

  return { from: rgbToHex(from), to: rgbToHex(to), accent: rgbToHex(best) };
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0] ?? "";
  for (let index = 1; index < words.length; index += 1) {
    const candidate = `${current} ${words[index]}`;
    if (context.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = words[index] ?? "";
    } else {
      current = candidate;
    }
  }
  lines.push(current);
  return lines;
}

function cover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "video/mp4;codecs=avc1",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const type of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(type)) return type;
    } catch {
      // ignore unsupported probes
    }
  }
  return "";
}

export function VideoStudio({ template }: { template: StudioTemplate }) {
  const dims = dimsFor(template.aspect_ratio);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originRef = useRef<number>(0);
  const paletteRef = useRef<Palette>(template.palette ?? FALLBACK);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const videoUrlRef = useRef<string | null>(null);
  const usedRef = useRef(false);

  const [palette, setPalette] = useState<Palette>(template.palette ?? FALLBACK);
  const [headline, setHeadline] = useState(
    (template.category ? DEFAULT_HEADLINES[template.category] : undefined) ??
      "A wish for you",
  );
  const [names, setNames] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("Made with love, just for you.");
  const [photoName, setPhotoName] = useState("");
  const [status, setStatus] = useState<"idle" | "recording" | "ready">("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoExt, setVideoExt] = useState("webm");
  const [error, setError] = useState("");

  const dataRef = useRef({ headline, names, date, message });
  dataRef.current = { headline, names, date, message };

  useEffect(() => {
    paletteRef.current = palette;
  }, [palette]);

  useEffect(() => {
    if (template.palette) {
      setPalette(template.palette);
      return undefined;
    }
    if (!template.thumb) {
      setPalette(FALLBACK);
      return undefined;
    }
    const image = new Image();
    image.onload = () => setPalette(extractPalette(image));
    image.onerror = () => setPalette(FALLBACK);
    image.src = template.thumb;
    return undefined;
  }, [template.palette, template.thumb]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const serifFamily = (() => {
      const probe = document.createElement("span");
      probe.className = "font-serif";
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      document.body.appendChild(probe);
      const family = getComputedStyle(probe).fontFamily;
      probe.remove();
      return family || "Georgia, serif";
    })();
    const sansFamily = (() => {
      const probe = document.createElement("span");
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      document.body.appendChild(probe);
      const family = getComputedStyle(probe).fontFamily;
      probe.remove();
      return family || "system-ui, sans-serif";
    })();

    let frame = 0;
    let lastProgressUpdate = 0;

    const render = (now: number) => {
      const elapsed = ((now - originRef.current) / 1000) % (DURATION_MS / 1000);
      const time = now / 1000;
      const colors = paletteRef.current;
      const data = dataRef.current;
      const scale = Math.min(dims.width, dims.height) / 720;

      context.clearRect(0, 0, dims.width, dims.height);

      const gradient = context.createLinearGradient(
        0,
        0,
        dims.width,
        dims.height,
      );
      gradient.addColorStop(0, colors.from);
      gradient.addColorStop(1, colors.to);
      context.fillStyle = gradient;
      context.fillRect(0, 0, dims.width, dims.height);

      context.globalAlpha = 0.35;
      for (let index = 0; index < 4; index += 1) {
        const cx =
          dims.width * (0.2 + 0.22 * index) +
          Math.sin(time * 0.5 + index) * 40 * scale;
        const cy =
          dims.height * (0.25 + 0.14 * index) +
          Math.cos(time * 0.4 + index * 1.7) * 30 * scale;
        const radius = (90 + index * 40) * scale;
        const blob = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
        blob.addColorStop(0, `${colors.accent}55`);
        blob.addColorStop(1, `${colors.accent}00`);
        context.fillStyle = blob;
        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      const portrait = dims.height > dims.width;
      const photoX = portrait ? dims.width * 0.12 : dims.width * 0.07;
      const photoY = portrait ? dims.height * 0.08 : dims.height * 0.12;
      const photoW = portrait ? dims.width * 0.76 : dims.width * 0.4;
      const photoH = portrait ? dims.height * 0.44 : dims.height * 0.76;
      const panelX = portrait ? dims.width * 0.06 : dims.width * 0.52;
      const panelY = portrait ? dims.height * 0.56 : dims.height * 0.12;
      const panelW = portrait ? dims.width * 0.88 : dims.width * 0.42;
      const panelH = portrait ? dims.height * 0.38 : dims.height * 0.76;

      context.save();
      const intro = easeOut(elapsed / 1.1);
      const photoScale = 1 + 0.04 * (1 - intro) + Math.sin(time * 0.6) * 0.004;
      context.translate(photoX + photoW / 2, photoY + photoH / 2);
      context.scale(photoScale, photoScale);
      context.translate(-(photoX + photoW / 2), -(photoY + photoH / 2));
      roundedRect(context, photoX, photoY, photoW, photoH, 32 * scale);
      context.save();
      context.clip();
      if (photoRef.current) {
        cover(context, photoRef.current, photoX, photoY, photoW, photoH);
      } else {
        const fill = context.createLinearGradient(
          photoX,
          photoY,
          photoX + photoW,
          photoY + photoH,
        );
        fill.addColorStop(0, `${colors.accent}dd`);
        fill.addColorStop(1, `${colors.accent}33`);
        context.fillStyle = fill;
        context.fillRect(photoX, photoY, photoW, photoH);
        context.fillStyle = "rgba(255,255,255,0.22)";
        context.beginPath();
        context.arc(
          photoX + photoW * 0.68,
          photoY + photoH * 0.32,
          photoW * 0.18,
          0,
          Math.PI * 2,
        );
        context.fill();
        context.beginPath();
        context.arc(
          photoX + photoW * 0.34,
          photoY + photoH * 0.62,
          photoW * 0.26,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
      context.restore();
      context.restore();

      context.strokeStyle = "rgba(255,255,255,0.45)";
      context.lineWidth = 2 * scale;
      roundedRect(context, photoX, photoY, photoW, photoH, 32 * scale);
      context.stroke();

      context.fillStyle = "rgba(14,12,18,0.55)";
      roundedRect(context, panelX, panelY, panelW, panelH, 28 * scale);
      context.fill();

      const padding = 30 * scale;
      const contentX = panelX + padding;
      const maxWidth = panelW - padding * 2;
      let cursorY = panelY + padding + 22 * scale;

      const reveal = (delay: number) => easeOut((elapsed - delay) / 0.9);

      context.globalAlpha = reveal(0.1);
      context.fillStyle = colors.accent;
      context.font = `600 ${13 * scale}px ${sansFamily}`;
      context.letterSpacing = `${3 * scale}px`;
      context.fillText(template.categoryName.toUpperCase(), contentX, cursorY);
      cursorY += 42 * scale;

      context.globalAlpha = reveal(0.25);
      context.fillStyle = "#ffffff";
      context.font = `italic 400 ${58 * scale}px ${serifFamily}`;
      const headlineLines = wrapText(context, data.headline || "A wish for you", maxWidth);
      for (const line of headlineLines.slice(0, 3)) {
        cursorY += 60 * scale;
        context.fillText(line, contentX, cursorY);
      }
      cursorY += 18 * scale;

      context.globalAlpha = reveal(0.45);
      context.fillStyle = colors.accent;
      context.fillRect(contentX, cursorY, 64 * scale, 4 * scale);
      cursorY += 34 * scale;

      if (data.names.trim()) {
        context.globalAlpha = reveal(0.55);
        context.fillStyle = "#ffffff";
        context.font = `500 ${26 * scale}px ${sansFamily}`;
        context.fillText(data.names.slice(0, 64), contentX, cursorY);
        cursorY += 34 * scale;
      }

      if (data.date.trim()) {
        context.globalAlpha = reveal(0.68);
        context.fillStyle = "rgba(255,255,255,0.78)";
        context.font = `500 ${15 * scale}px ${sansFamily}`;
        context.letterSpacing = `${2 * scale}px`;
        context.fillText(data.date.slice(0, 48).toUpperCase(), contentX, cursorY);
        cursorY += 30 * scale;
      }

      context.letterSpacing = "0px";
      if (data.message.trim()) {
        context.globalAlpha = reveal(0.78);
        context.fillStyle = "rgba(255,255,255,0.85)";
        context.font = `400 ${17 * scale}px ${sansFamily}`;
        const messageLines = wrapText(context, data.message, maxWidth);
        for (const line of messageLines.slice(0, 3)) {
          context.fillText(line, contentX, cursorY);
          cursorY += 24 * scale;
        }
      }

      context.globalAlpha = 0.7 * reveal(1.1);
      context.fillStyle = "rgba(255,255,255,0.7)";
      context.font = `500 ${13 * scale}px ${sansFamily}`;
      context.letterSpacing = `${1.5 * scale}px`;
      context.fillText("MADE WITH WISHLY", contentX, panelY + panelH - padding);
      context.letterSpacing = "0px";
      context.globalAlpha = 1;

      const barWidth = dims.width * 0.3;
      const barX = (dims.width - barWidth) / 2;
      const barY = dims.height - 28 * scale;
      context.fillStyle = "rgba(255,255,255,0.22)";
      roundedRect(context, barX, barY, barWidth, 5 * scale, 3 * scale);
      context.fill();
      context.fillStyle = colors.accent;
      const played = clamp(elapsed / (DURATION_MS / 1000));
      roundedRect(context, barX, barY, barWidth * played, 5 * scale, 3 * scale);
      context.fill();

      if (statusRef.current === "recording" && now - lastProgressUpdate > 120) {
        lastProgressUpdate = now;
        setProgress(played);
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [dims.height, dims.width, template.categoryName]);

  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(
    () => () => {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas || status === "recording") return;
    if (typeof MediaRecorder === "undefined") {
      setError("This browser can't record video. Try Chrome or Edge.");
      return;
    }
    const mimeType = pickMimeType();
    if (!mimeType) {
      setError("This browser can't record video. Try Chrome or Edge.");
      return;
    }

    setError("");
    setStatus("recording");
    setProgress(0);

    if (!usedRef.current) {
      usedRef.current = true;
      void fetch(`/api/video-templates/${template.id}/use`, {
        method: "POST",
      }).catch(() => undefined);
    }

    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
    }
    setVideoUrl(null);

    const stream = canvas.captureStream(FPS);
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 8_000_000,
    });
    recorderRef.current = recorder;
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType.split(";")[0] });
      const url = URL.createObjectURL(blob);
      videoUrlRef.current = url;
      setVideoUrl(url);
      setVideoExt(mimeType.includes("mp4") ? "mp4" : "webm");
      setStatus("ready");
      setProgress(1);
      stream.getTracks().forEach((track) => track.stop());
    };

    originRef.current = performance.now();
    recorder.start();
    window.setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, DURATION_MS + 200);
  };

  const onPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      photoRef.current = image;
      setPhotoName(file.name);
    };
    image.onerror = () => setError("That image could not be read.");
    image.src = url;
  };

  const disabled = status === "recording";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:pt-14">
      <Link
        href="/templates#video-templates"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        ← All templates
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Video studio
          </p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
            Make it here, keep it here.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">
            Inspired by “{template.title}”. Change the words, add a photo, then
            create the video. Everything renders in your browser — nothing is
            uploaded and you never leave Wishly.
          </p>
        </div>
        <span className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs text-ink-muted">
          {template.categoryName} · {template.aspect_ratio} ·{" "}
          {template.plan_tier === "FREE" ? "Free" : "Pro"}
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="self-start rounded-card border border-hairline bg-sand p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={dims.width}
              height={dims.height}
              aria-label="Live video preview"
              className="mx-auto block h-auto max-h-[70vh] w-auto max-w-full rounded-card shadow-soft ring-1 ring-black/5"
            />
          </div>
          <p className="mt-4 text-center text-xs text-ink-muted" aria-live="polite">
            {status === "recording"
              ? `Recording… ${Math.round(progress * 100)}%`
              : status === "ready"
                ? "Your video is ready below."
                : "Live preview — six seconds, looping."}
          </p>
        </div>

        <div className="space-y-5">
          <fieldset disabled={disabled} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-ink">Headline</span>
              <input
                value={headline}
                onChange={(event) => setHeadline(event.target.value.slice(0, 60))}
                className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink">Names</span>
              <input
                value={names}
                onChange={(event) => setNames(event.target.value.slice(0, 64))}
                placeholder="Alex & Sam"
                className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink">Date or place</span>
              <input
                value={date}
                onChange={(event) => setDate(event.target.value.slice(0, 48))}
                placeholder="December 18, 2026"
                className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink">Message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 140))}
                rows={3}
                className="mt-1 w-full rounded-xl border border-hairline bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink">Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={onPhoto}
                className="mt-1 block w-full text-sm text-ink-muted file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-medium file:text-canvas"
              />
              {photoName ? (
                <span className="mt-1 block truncate text-xs text-ink-muted">
                  {photoName}
                </span>
              ) : null}
            </label>
          </fieldset>

          {error ? (
            <p className="rounded-xl border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-coral-strong px-6 text-sm font-medium text-white transition-colors hover:bg-coral-strong-hover disabled:opacity-60"
          >
            {status === "recording" ? "Recording…" : "Create video"}
          </button>

          <p className="text-xs leading-relaxed text-ink-muted">
            Six-second loop, recorded at 30fps in your browser. Nothing leaves
            your device.
          </p>

          {videoUrl ? (
            <div className="space-y-3 rounded-card border border-hairline bg-surface p-4">
              <video
                src={videoUrl}
                controls
                loop
                playsInline
                className="w-full rounded-card bg-black"
              />
              <a
                href={videoUrl}
                download={`wishly-${template.id}.${videoExt}`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
              >
                Download video
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
