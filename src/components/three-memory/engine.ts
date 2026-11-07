"use client";

import { defaultMemoryTemplateId, getMemoryTemplate } from "@/src/components/three-memory/catalog";

export const REEL_WIDTH = 1080;
export const REEL_HEIGHT = 1920;
export const REEL_DURATION_MS = 9000;

export interface MemoryReelInput {
  templateId?: string | null;
  photos: string[];
  title: string;
  receiverName?: string;
  senderName?: string;
  message?: string;
}

export interface MemoryView {
  orbit?: number;
  zoom?: number;
  reduced?: boolean;
}

export interface ReelFonts {
  serif: string;
  sans: string;
}

const GOLD = "#D6C283";
const CORAL = "#FF385C";
const INK = "#1C1B1A";
const SAND = "#F7F1E8";
const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

export function reelFonts(): ReelFonts {
  if (typeof document === "undefined") {
    return { serif: "Georgia, serif", sans: "system-ui, sans-serif" };
  }
  const probe = (className: string) => {
    const span = document.createElement("span");
    if (className) span.className = className;
    span.style.position = "absolute";
    span.style.visibility = "hidden";
    document.body.appendChild(span);
    const family = getComputedStyle(span).fontFamily;
    span.remove();
    return family;
  };
  return {
    serif: probe("font-serif") || "Georgia, serif",
    sans: probe("") || "system-ui, sans-serif",
  };
}

export async function loadMemoryImages(urls: string[]): Promise<HTMLImageElement[]> {
  const unique = [...new Set(urls.filter(Boolean))].slice(0, 10);
  const loaded = await Promise.all(
    unique.map(
      (src) =>
        new Promise<HTMLImageElement | null>((resolve) => {
          const image = new Image();
          if (/^https?:/.test(src)) image.crossOrigin = "anonymous";
          image.onload = () => resolve(image);
          image.onerror = () => resolve(null);
          image.src = src;
        }),
    ),
  );
  return loaded.filter((image): image is HTMLImageElement => image !== null);
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawPhoto(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fallback: string,
) {
  context.save();
  roundedRect(context, x, y, width, height, radius);
  context.clip();
  if (image) {
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
  } else {
    const gradient = context.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, fallback);
    gradient.addColorStop(1, `${fallback}55`);
    context.fillStyle = gradient;
    context.fillRect(x, y, width, height);
  }
  context.restore();
}

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && context.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = candidate;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  return lines;
}

function drawTitle(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  fonts: ReelFonts,
  color: string,
  muted: string,
  accent: string,
  alpha: number,
  y = 1420,
) {
  if (alpha <= 0.01) return;
  context.save();
  context.globalAlpha = alpha;
  context.textAlign = "center";
  context.fillStyle = color;
  context.font = `italic 400 86px ${fonts.serif}`;
  const lines = wrapText(context, input.title || "A memory for you", 900, 3);
  let cursor = y;
  for (const line of lines) {
    context.fillText(line, REEL_WIDTH / 2, cursor);
    cursor += 92;
  }
  context.fillStyle = accent;
  context.fillRect(REEL_WIDTH / 2 - 60, cursor - 34, 120, 5);
  cursor += 42;
  context.font = `500 34px ${fonts.sans}`;
  context.fillStyle = color;
  if (input.receiverName) {
    context.fillText(input.receiverName, REEL_WIDTH / 2, cursor);
    cursor += 44;
  }
  context.font = `400 26px ${fonts.sans}`;
  context.fillStyle = muted;
  context.fillText(input.senderName ? `from ${input.senderName}` : "made with Wishly", REEL_WIDTH / 2, cursor + 8);
  context.restore();
}

function drawSparkles(
  context: CanvasRenderingContext2D,
  progress: number,
  seed: number,
  count: number,
  colors: string[],
  speed = 1,
) {
  const random = seeded(seed);
  for (let index = 0; index < count; index += 1) {
    const x = random() * REEL_WIDTH;
    const drift = random() * 400;
    const y = (random() * REEL_HEIGHT + progress * 1600 * speed + drift) % REEL_HEIGHT;
    const radius = random() * 3 + 1;
    context.globalAlpha = 0.25 + random() * 0.55;
    context.fillStyle = colors[index % colors.length] ?? GOLD;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
}

function drawReduced(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  fonts: ReelFonts,
) {
  const template = getMemoryTemplate(input.templateId ?? "") ?? null;
  context.fillStyle = template?.background ?? "#121212";
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);
  const list = images.length > 0 ? images : [];
  if (list.length > 0) {
    const raw = progress * list.length;
    const index = Math.floor(raw) % list.length;
    const next = (index + 1) % list.length;
    const blend = ease((raw % 1) * 2 - 0.5);
    const draw = (image: HTMLImageElement | undefined, alpha: number) => {
      if (!image) return;
      context.globalAlpha = alpha;
      const scale = Math.max(REEL_WIDTH / image.width, REEL_HEIGHT / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      context.drawImage(image, (REEL_WIDTH - width) / 2, (REEL_HEIGHT - height) / 2, width, height);
      context.globalAlpha = 1;
    };
    draw(list[index], 1);
    draw(list[next], blend);
  }
  const scrim = context.createLinearGradient(0, 900, 0, REEL_HEIGHT);
  scrim.addColorStop(0, "rgba(0,0,0,0)");
  scrim.addColorStop(1, "rgba(0,0,0,0.78)");
  context.fillStyle = scrim;
  context.fillRect(0, 900, REEL_WIDTH, REEL_HEIGHT - 900);
  drawTitle(context, input, fonts, "#FFFFFF", "rgba(255,255,255,0.72)", template?.accent ?? GOLD, 1, 1460);
}

function drawTunnel(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  const background = context.createLinearGradient(0, 0, 0, REEL_HEIGHT);
  background.addColorStop(0, "#0D0B12");
  background.addColorStop(1, "#1D1426");
  context.fillStyle = background;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const random = seeded(77);
  for (let index = 0; index < 180; index += 1) {
    const baseZ = random() * 3200;
    const z = ((baseZ - progress * 3400 - (view.zoom ?? 0) * 900) % 3200 + 3200) % 3200;
    if (z < 60) continue;
    const scale = 900 / z;
    const x = REEL_WIDTH / 2 + (random() - 0.5) * 2400 * scale;
    const y = REEL_HEIGHT / 2 + (random() - 0.5) * 2400 * scale;
    const radius = 2 + 5 * scale;
    context.globalAlpha = clamp(1 - z / 3200);
    context.fillStyle = index % 3 === 0 ? CORAL : GOLD;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  const count = images.length;
  for (let index = 0; index < count; index += 1) {
    const z = 1150 + index * 330 - progress * (count * 330 + 900) - (view.zoom ?? 0) * 600;
    if (z < 70) continue;
    const scale = 880 / z;
    const x =
      REEL_WIDTH / 2 +
      Math.sin(index * 2.4 + (view.orbit ?? 0)) * 330 * scale;
    const y = REEL_HEIGHT / 2 + Math.cos(index * 1.85) * 200 * scale - 120;
    const width = 430 * scale;
    const height = 530 * scale;
    const alpha = clamp(1 - z / 3800) * clamp((z - 70) / 220);
    context.globalAlpha = alpha;
    context.save();
    context.shadowColor = index % 2 === 0 ? GOLD : CORAL;
    context.shadowBlur = 40 * scale;
    drawPhoto(context, images[index], x - width / 2, y - height / 2, width, height, 24 * scale, GOLD);
    context.restore();
    context.globalAlpha = 1;
  }

  drawTitle(
    context,
    input,
    fonts,
    "#FFFFFF",
    "rgba(255,255,255,0.65)",
    GOLD,
    ease((progress - 0.58) / 0.24),
  );
}

function drawCylinder(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  context.fillStyle = "#121212";
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);
  const glow = context.createRadialGradient(REEL_WIDTH / 2, 900, 30, REEL_WIDTH / 2, 900, 760);
  glow.addColorStop(0, "rgba(214,194,131,0.22)");
  glow.addColorStop(1, "rgba(214,194,131,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  context.save();
  context.translate(REEL_WIDTH / 2, 880);
  context.fillStyle = GOLD;
  context.shadowColor = GOLD;
  context.shadowBlur = 70;
  context.beginPath();
  context.moveTo(0, 60);
  context.bezierCurveTo(-150, -60, -180, 90, 0, 190);
  context.bezierCurveTo(180, 90, 150, -60, 0, 60);
  context.fill();
  context.restore();

  const count = images.length;
  const angleBase = progress * Math.PI * 2 + (view.orbit ?? 0);
  const radius = 540;
  for (let index = 0; index < count; index += 1) {
    const angle = angleBase + (index / Math.max(count, 1)) * Math.PI * 2;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    const scale = 780 / (780 + z);
    const width = 300 * scale;
    const height = 380 * scale;
    const alpha = 0.35 + 0.65 * ((z + radius) / (radius * 2));
    context.globalAlpha = alpha;
    context.save();
    context.shadowColor = GOLD;
    context.shadowBlur = 30 * scale;
    drawPhoto(
      context,
      images[index],
      REEL_WIDTH / 2 + x - width / 2,
      860 - height / 2,
      width,
      height,
      18 * scale,
      GOLD,
    );
    context.restore();

    context.globalAlpha = alpha * 0.16;
    context.save();
    context.translate(REEL_WIDTH / 2 + x, 1120);
    context.scale(1, -0.42);
    drawPhoto(context, images[index], -width / 2, 0, width, height, 18 * scale, GOLD);
    context.restore();
    context.globalAlpha = 1;
  }

  drawTitle(
    context,
    input,
    fonts,
    "#FFFFFF",
    "rgba(255,255,255,0.6)",
    GOLD,
    ease((progress - 0.55) / 0.3),
  );
}

function drawPolaroid(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  const background = context.createLinearGradient(0, 0, REEL_WIDTH, REEL_HEIGHT);
  background.addColorStop(0, "#FDF6F2");
  background.addColorStop(1, "#F3DCD6");
  context.fillStyle = background;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  drawSparkles(context, progress, 19, 90, [CORAL, GOLD, "#C96F86", "#FFFFFF"], 1.2);

  const count = images.length;
  for (let index = 0; index < count; index += 1) {
    const deal = ease(clamp((progress - index * 0.045) / 0.45));
    if (deal <= 0) continue;
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 220 + column * 420 + Math.sin(index * 1.7 + (view.orbit ?? 0)) * 30;
    const y = 420 + row * 250 - deal * 70;
    const rotation = (column === 0 ? -0.06 : 0.06) + (1 - deal) * (column === 0 ? -0.18 : 0.18);
    const width = 330;
    const height = 410;

    context.save();
    context.globalAlpha = deal;
    context.translate(x + width / 2, y + height / 2);
    context.rotate(rotation);
    context.shadowColor = "rgba(90,55,40,0.18)";
    context.shadowBlur = 40;
    context.fillStyle = "#FFFFFF";
    roundedRect(context, -width / 2, -height / 2, width, height, 10);
    context.fill();
    context.shadowBlur = 0;
    drawPhoto(context, images[index], -width / 2 + 16, -height / 2 + 16, width - 32, height - 110, 4, "#C96F86");
    context.fillStyle = "#6B4B42";
    context.textAlign = "center";
    context.font = `italic 400 25px ${fonts.serif}`;
    context.fillText(["remember this", "us, then", "that afternoon", "the good year"][index % 4] ?? "remember this", 0, height / 2 - 34);
    context.restore();
  }

  drawTitle(
    context,
    input,
    fonts,
    INK,
    "rgba(28,27,26,0.62)",
    CORAL,
    ease((progress - 0.62) / 0.3),
    1500,
  );
}

function drawLanterns(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  const background = context.createLinearGradient(0, 0, 0, REEL_HEIGHT);
  background.addColorStop(0, "#1A120B");
  background.addColorStop(0.6, "#2B1B10");
  background.addColorStop(1, "#120B07");
  context.fillStyle = background;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const random = seeded(31);
  for (let index = 0; index < 34; index += 1) {
    const x = random() * REEL_WIDTH;
    const y = (random() * REEL_HEIGHT + progress * 700) % REEL_HEIGHT;
    const radius = random() * 40 + 16;
    const bokeh = context.createRadialGradient(x, y, 0, x, y, radius);
    bokeh.addColorStop(0, "rgba(214,194,131,0.30)");
    bokeh.addColorStop(1, "rgba(214,194,131,0)");
    context.fillStyle = bokeh;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  const count = images.length;
  for (let index = 0; index < count; index += 1) {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = 180 + column * 320 + Math.sin(progress * 2 + index + (view.orbit ?? 0)) * 26;
    const baseY = 1120 + row * 210 - progress * 520;
    const width = 260;
    const height = 320;
    context.save();
    context.shadowColor = GOLD;
    context.shadowBlur = 60;
    context.fillStyle = "rgba(214,194,131,0.16)";
    roundedRect(context, x - 18, baseY - 18, width + 36, height + 36, 26);
    context.fill();
    drawPhoto(context, images[index], x, baseY, width, height, 20, GOLD);
    context.restore();
  }

  drawTitle(
    context,
    input,
    fonts,
    "#FFF8EC",
    "rgba(255,248,236,0.68)",
    GOLD,
    ease((progress - 0.5) / 0.3),
  );
}

function drawMuseum(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  context.fillStyle = SAND;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);
  context.fillStyle = "#EFE7DA";
  context.fillRect(0, 1180, REEL_WIDTH, 740);
  context.strokeStyle = "rgba(107,103,98,0.18)";
  context.lineWidth = 3;
  for (let index = 0; index < 6; index += 1) {
    context.beginPath();
    context.moveTo(0, 1180 + index * 110);
    context.lineTo(REEL_WIDTH, 1180 + index * 110);
    context.stroke();
  }

  const count = images.length;
  const pan = (progress - 0.5) * 520 + (view.orbit ?? 0) * 260;
  for (let index = 0; index < count; index += 1) {
    const offset = (index - (count - 1) / 2) * 280 - pan;
    const x = REEL_WIDTH / 2 + offset;
    if (x < -300 || x > REEL_WIDTH + 300) continue;
    const y = 520 + (index % 2) * 40;
    const width = 300;
    const height = 400;

    context.save();
    context.fillStyle = "#FBF6EE";
    roundedRect(context, x - width / 2 - 18, y - 18, width + 36, height + 36, 16);
    context.fill();
    context.strokeStyle = "rgba(28,27,26,0.12)";
    context.stroke();

    context.beginPath();
    context.moveTo(x - width / 2, y + 80);
    context.arc(x - width / 2 + width / 2, y + 80, width / 2, Math.PI, 0);
    context.lineTo(x + width / 2, y + height);
    context.lineTo(x - width / 2, y + height);
    context.closePath();
    context.clip();
    drawPhoto(context, images[index], x - width / 2, y, width, height, 0, "#D8C7AE");
    context.restore();

    const glare = context.createLinearGradient(x - width / 2, y, x + width / 2, y + height);
    glare.addColorStop(0, "rgba(255,255,255,0)");
    glare.addColorStop(0.48, "rgba(255,255,255,0.28)");
    glare.addColorStop(0.56, "rgba(255,255,255,0)");
    context.fillStyle = glare;
    context.fillRect(x - width / 2, y, width, height);
  }

  drawTitle(
    context,
    input,
    fonts,
    INK,
    "rgba(28,27,26,0.6)",
    "#B07C25",
    ease((progress - 0.55) / 0.3),
    1500,
  );
}

function drawCalm(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  const background = context.createLinearGradient(0, 0, 0, REEL_HEIGHT);
  background.addColorStop(0, "#0B1418");
  background.addColorStop(0.7, "#12232A");
  background.addColorStop(1, "#071013");
  context.fillStyle = background;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const breathe = 0.75 + Math.sin(progress * Math.PI * 2) * 0.25;
  const glow = context.createRadialGradient(REEL_WIDTH / 2, 760, 20, REEL_WIDTH / 2, 760, 620);
  glow.addColorStop(0, `rgba(214,194,131,${0.15 * breathe})`);
  glow.addColorStop(1, "rgba(214,194,131,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const count = images.length;
  for (let index = 0; index < count; index += 1) {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 250 + column * 400 + Math.sin(progress * 0.8 + index + (view.orbit ?? 0)) * 14;
    const y = 620 + row * 210 + Math.sin(progress * 1.1 + index) * 18 - progress * 60;
    const width = 280;
    const height = 340;
    context.save();
    context.globalAlpha = 0.9;
    context.shadowColor = GOLD;
    context.shadowBlur = 30;
    drawPhoto(context, images[index], x, y, width, height, 26, "#25414A");
    context.restore();
    context.globalAlpha = 0.12;
    context.save();
    context.translate(x, 1120);
    context.scale(1, -0.35);
    drawPhoto(context, images[index], 0, 0, width, height, 26, "#25414A");
    context.restore();
    context.globalAlpha = 1;
  }

  drawTitle(
    context,
    input,
    fonts,
    "#F1EADB",
    "rgba(241,234,219,0.62)",
    GOLD,
    ease((progress - 0.2) / 0.4),
    1420,
  );
}

export function drawMemoryFrame(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView = {},
  fonts: ReelFonts = { serif: "Georgia, serif", sans: "system-ui, sans-serif" },
) {
  const clamped = clamp(progress);
  context.save();
  context.textBaseline = "alphabetic";
  if (view.reduced) {
    drawReduced(context, input, images, clamped, fonts);
    context.restore();
    return;
  }

  const templateId = input.templateId || defaultMemoryTemplateId(input.templateId ?? "");
  switch (templateId) {
    case "3d-cylinder-ring":
      drawCylinder(context, input, images, clamped, view, fonts);
      break;
    case "3d-polaroid-deck":
      drawPolaroid(context, input, images, clamped, view, fonts);
      break;
    case "3d-lantern-float":
      drawLanterns(context, input, images, clamped, view, fonts);
      break;
    case "3d-editorial-museum":
      drawMuseum(context, input, images, clamped, view, fonts);
      break;
    case "3d-calm-reflection":
      drawCalm(context, input, images, clamped, view, fonts);
      break;
    default:
      drawTunnel(context, input, images, clamped, view, fonts);
  }
  context.restore();
}

function pickMime() {
  if (typeof MediaRecorder === "undefined") return "";
  for (const type of [
    "video/mp4;codecs=avc1",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ]) {
    try {
      if (MediaRecorder.isTypeSupported(type)) return type;
    } catch {
      // ignore
    }
  }
  return "";
}

export interface RenderedReel {
  blob: Blob;
  url: string;
  extension: "mp4" | "webm";
}

export async function renderMemoryReel(
  input: MemoryReelInput,
  options: { onProgress?: (progress: number) => void; durationMs?: number } = {},
): Promise<RenderedReel> {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("This browser can't record video. Try Chrome or Edge.");
  }
  const mime = pickMime();
  if (!mime) throw new Error("This browser can't record video. Try Chrome or Edge.");

  const images = await loadMemoryImages(input.photos);
  const fonts = reelFonts();
  await document.fonts?.ready.catch(() => undefined);

  const canvas = document.createElement("canvas");
  canvas.width = REEL_WIDTH;
  canvas.height = REEL_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: 8_000_000,
  });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  const finished = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mime.split(";")[0] }));
  });

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = options.durationMs ?? REEL_DURATION_MS;
  const start = performance.now();

  recorder.start();
  await new Promise<void>((resolve) => {
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, REEL_WIDTH, REEL_HEIGHT);
      drawMemoryFrame(context, input, images, progress, { reduced }, fonts);
      options.onProgress?.(progress);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });

  await new Promise((resolve) => window.setTimeout(resolve, 120));
  recorder.stop();
  const blob = await finished;
  stream.getTracks().forEach((track) => track.stop());
  return {
    blob,
    url: URL.createObjectURL(blob),
    extension: mime.includes("mp4") ? "mp4" : "webm",
  };
}
