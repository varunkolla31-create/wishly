"use client";

import { getMemoryTemplate } from "@/src/components/three-memory/catalog";

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

function archPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.beginPath();
  context.moveTo(x, y + height);
  context.lineTo(x, y + height * 0.38);
  context.arc(x + width / 2, y + height * 0.38, width / 2, Math.PI, 0);
  context.lineTo(x + width, y + height);
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
  if (image && image.width > 0 && image.height > 0) {
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

/**
 * Fairy-light Polaroid clothesline: two sagging strings, wooden pegs, warm
 * bokeh bulbs and prints that swing from their top edge.
 */
function drawClothesline(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  const background = context.createLinearGradient(0, 0, 0, REEL_HEIGHT);
  background.addColorStop(0, "#0D0B12");
  background.addColorStop(0.62, "#1A1220");
  background.addColorStop(1, "#070508");
  context.fillStyle = background;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const wallGlow = context.createRadialGradient(
    REEL_WIDTH / 2,
    720,
    40,
    REEL_WIDTH / 2,
    720,
    780,
  );
  wallGlow.addColorStop(0, "rgba(255,178,92,0.16)");
  wallGlow.addColorStop(1, "rgba(255,178,92,0)");
  context.fillStyle = wallGlow;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const strings = [540, 890];
  for (let s = 0; s < strings.length; s += 1) {
    const baseY = strings[s] ?? 540;
    context.save();
    context.strokeStyle = "rgba(214,194,131,0.26)";
    context.lineWidth = 2;
    context.beginPath();
    for (let x = 0; x <= REEL_WIDTH; x += 24) {
      const t = x / REEL_WIDTH;
      const y = baseY + Math.sin(t * Math.PI) * 46;
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    context.restore();

    for (let i = 0; i < 13; i += 1) {
      const t = (i + 0.5) / 13;
      const x = t * REEL_WIDTH;
      const y = baseY + Math.sin(t * Math.PI) * 46 + 12;
      const flicker = 0.85 + Math.sin(progress * 7 + i * 1.7) * 0.15;
      const halo = context.createRadialGradient(x, y, 0, x, y, 30);
      halo.addColorStop(0, `rgba(255,232,180,${0.95 * flicker})`);
      halo.addColorStop(0.35, `rgba(255,176,80,${0.4 * flicker})`);
      halo.addColorStop(1, "rgba(255,176,80,0)");
      context.fillStyle = halo;
      context.beginPath();
      context.arc(x, y, 30, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "rgba(255,248,225,0.95)";
      context.beginPath();
      context.arc(x, y, 3, 0, Math.PI * 2);
      context.fill();
    }
  }

  const count = Math.max(1, images.length);
  const cols = Math.ceil(count / 2);
  const spacing = REEL_WIDTH / (cols + 1);
  const swing = Math.sin(progress * Math.PI * 2 * 1.8 + (view.orbit ?? 0)) * 0.05;
  const captions = ["remember this", "us, then", "that afternoon", "the good year"];

  for (let index = 0; index < images.length; index += 1) {
    const row = index % 2;
    const col = Math.floor(index / 2);
    const x = spacing * (col + 1);
    const baseY = (strings[row] ?? 540) + Math.sin((x / REEL_WIDTH) * Math.PI) * 46;
    const width = clamp(spacing * 0.82, 150, 300);
    const height = width * 1.27;
    const tilt = swing + Math.sin(progress * 2.4 + index * 0.9) * 0.045;

    context.save();
    context.fillStyle = "#8A6A45";
    roundedRect(context, x - 10, baseY - 6, 20, 28, 4);
    context.fill();
    context.restore();

    context.save();
    context.translate(x, baseY);
    context.rotate(tilt);
    context.globalAlpha = 0.98;
    context.shadowColor = "rgba(0,0,0,0.55)";
    context.shadowBlur = 40;
    context.shadowOffsetY = 18;
    context.fillStyle = "#FBF7EF";
    roundedRect(context, -width / 2, 0, width, height, 10);
    context.fill();
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    drawPhoto(
      context,
      images[index],
      -width / 2 + 14,
      14,
      width - 28,
      height - 78,
      4,
      "#C96F86",
    );
    context.fillStyle = "#5C4438";
    context.textAlign = "center";
    context.font = `italic 400 ${Math.max(18, width * 0.09)}px ${fonts.serif}`;
    context.fillText(captions[index % captions.length] ?? "remember this", 0, height - 26);
    context.restore();
  }

  drawTitle(
    context,
    input,
    fonts,
    "#FFF8EC",
    "rgba(255,248,236,0.66)",
    GOLD,
    ease((progress - 0.55) / 0.3),
  );
}

/**
 * Spinning vinyl turntable with the photos orbiting as album sleeves.
 */
function drawVinyl(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  context.fillStyle = "#121212";
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const glow = context.createRadialGradient(REEL_WIDTH / 2, 880, 40, REEL_WIDTH / 2, 880, 760);
  glow.addColorStop(0, "rgba(214,194,131,0.2)");
  glow.addColorStop(1, "rgba(214,194,131,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const floor = context.createLinearGradient(0, 1000, 0, REEL_HEIGHT);
  floor.addColorStop(0, "#090909");
  floor.addColorStop(1, "#15120C");
  context.fillStyle = floor;
  context.fillRect(0, 1000, REEL_WIDTH, REEL_HEIGHT - 1000);

  const fov = 820;
  const radius = 520;
  const orbit = progress * Math.PI * 2 + (view.orbit ?? 0);
  const count = Math.max(1, images.length);
  const cards = images.map((_, index) => {
    const angle = orbit + (index / count) * Math.PI * 2;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    return { index, angle, x, z, scale: fov / (fov + z) };
  });

  const drawCard = (card: { index: number; angle: number; x: number; z: number; scale: number }) => {
    const width = 300 * card.scale;
    const height = 300 * card.scale;
    const alpha = clamp(0.3 + 0.7 * ((card.z + radius) / (radius * 2)));

    context.save();
    context.globalAlpha = alpha;
    context.translate(REEL_WIDTH / 2 + card.x, 880);
    context.rotate(Math.sin(card.angle) * 0.05);
    context.shadowColor = "rgba(214,194,131,0.45)";
    context.shadowBlur = 36 * card.scale;
    context.fillStyle = "#15130F";
    roundedRect(context, -width / 2, -height / 2, width, height, 14);
    context.fill();
    context.shadowBlur = 0;
    drawPhoto(
      context,
      images[card.index],
      -width / 2 + 8,
      -height / 2 + 8,
      width - 16,
      height - 16,
      8,
      GOLD,
    );
    context.fillStyle = "rgba(214,194,131,0.9)";
    context.fillRect(-width / 2, height / 2 - 10 * card.scale, width, 10 * card.scale);
    context.restore();

    context.save();
    context.globalAlpha = alpha * 0.16;
    context.translate(REEL_WIDTH / 2 + card.x, 1130);
    context.scale(1, -0.42);
    context.fillStyle = "#15130F";
    roundedRect(context, -width / 2, -height / 2, width, height, 14);
    context.fill();
    drawPhoto(
      context,
      images[card.index],
      -width / 2 + 8,
      -height / 2 + 8,
      width - 16,
      height - 16,
      8,
      GOLD,
    );
    context.restore();
  };

  cards.filter((card) => card.z < 0).sort((a, b) => a.z - b.z).forEach(drawCard);

  context.save();
  context.translate(REEL_WIDTH / 2, 900);
  context.scale(1, 0.55);
  context.beginPath();
  context.arc(0, 0, 380, 0, Math.PI * 2);
  context.fillStyle = "#0A0A0B";
  context.fill();
  context.lineWidth = 3;
  context.strokeStyle = "rgba(214,194,131,0.28)";
  context.stroke();
  for (let groove = 120; groove < 360; groove += 16) {
    context.beginPath();
    context.arc(0, 0, groove, 0, Math.PI * 2);
    context.strokeStyle = "rgba(255,255,255,0.035)";
    context.lineWidth = 1.5;
    context.stroke();
  }
  context.beginPath();
  context.arc(0, 0, 112, 0, Math.PI * 2);
  context.fillStyle = GOLD;
  context.fill();
  context.restore();

  context.save();
  context.textAlign = "center";
  context.fillStyle = "#2A2114";
  context.font = `italic 400 30px ${fonts.serif}`;
  context.fillText((input.receiverName || "wishly").slice(0, 14), REEL_WIDTH / 2, 892);
  context.font = `600 15px ${fonts.sans}`;
  context.fillText("SIDE A · FOR YOU", REEL_WIDTH / 2, 924);
  context.restore();

  cards.filter((card) => card.z >= 0).sort((a, b) => a.z - b.z).forEach(drawCard);

  drawSparkles(context, progress, 41, 60, [GOLD, "#FFFFFF"], 0.55);

  drawTitle(
    context,
    input,
    fonts,
    "#FFFFFF",
    "rgba(255,255,255,0.62)",
    GOLD,
    ease((progress - 0.55) / 0.3),
  );
}

/**
 * Origami paper lanterns rising under a starry sky, each face carrying a photo.
 */
function drawSkyLanterns(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  const background = context.createLinearGradient(0, 0, 0, REEL_HEIGHT);
  background.addColorStop(0, "#070A14");
  background.addColorStop(0.45, "#101326");
  background.addColorStop(1, "#1A120B");
  context.fillStyle = background;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const random = seeded(53);
  for (let index = 0; index < 160; index += 1) {
    const x = random() * REEL_WIDTH;
    const y = random() * REEL_HEIGHT;
    const radius = random() * 2 + 0.6;
    const twinkle = 0.28 + 0.5 * Math.abs(Math.sin(progress * 4 + index));
    context.globalAlpha = twinkle;
    context.fillStyle = index % 5 === 0 ? GOLD : "#E8EEFF";
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  const moon = context.createRadialGradient(820, 340, 20, 820, 340, 240);
  moon.addColorStop(0, "rgba(255,222,160,0.22)");
  moon.addColorStop(1, "rgba(255,222,160,0)");
  context.fillStyle = moon;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  for (let index = 0; index < images.length; index += 1) {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x =
      190 +
      column * 350 +
      Math.sin(progress * 1.6 + index * 0.9 + (view.orbit ?? 0)) * 36;
    const y = 1400 + row * 230 - progress * 1080 - (index % 2) * 60;
    const scale = 0.86 + (index % 3) * 0.1;
    const width = 240 * scale;
    const height = 300 * scale;
    const fade = clamp(1 - Math.abs(y - 860) / 1700, 0.25, 1);

    context.save();
    context.globalAlpha = fade;
    context.shadowColor = "rgba(255,164,43,0.55)";
    context.shadowBlur = 70;
    const body = context.createLinearGradient(x, y, x, y + height);
    body.addColorStop(0, "rgba(255,206,130,0.96)");
    body.addColorStop(1, "rgba(190,92,30,0.92)");
    context.fillStyle = body;
    roundedRect(context, x - width / 2, y, width, height, 24 * scale);
    context.fill();
    context.shadowBlur = 0;
    drawPhoto(
      context,
      images[index],
      x - width / 2 + 20 * scale,
      y + 22 * scale,
      width - 40 * scale,
      height - 64 * scale,
      12 * scale,
      "#FFA42B",
    );
    context.strokeStyle = "rgba(120,60,20,0.28)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x, y + 8);
    context.lineTo(x, y + height - 8);
    context.moveTo(x - width / 2 + 8, y + height * 0.55);
    context.lineTo(x + width / 2 - 8, y + height * 0.55);
    context.stroke();
    const flame = context.createRadialGradient(x, y + height - 18, 0, x, y + height - 18, 30);
    flame.addColorStop(0, "rgba(255,240,190,0.95)");
    flame.addColorStop(1, "rgba(255,164,43,0)");
    context.fillStyle = flame;
    context.beginPath();
    context.arc(x, y + height - 18, 30, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  const bokeh = seeded(17);
  for (let index = 0; index < 26; index += 1) {
    const x = bokeh() * REEL_WIDTH;
    const y = (bokeh() * REEL_HEIGHT + progress * 620) % REEL_HEIGHT;
    const radius = bokeh() * 34 + 12;
    const dot = context.createRadialGradient(x, y, 0, x, y, radius);
    dot.addColorStop(0, "rgba(255,190,110,0.26)");
    dot.addColorStop(1, "rgba(255,190,110,0)");
    context.fillStyle = dot;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  drawTitle(
    context,
    input,
    fonts,
    "#FFF8EC",
    "rgba(255,248,236,0.68)",
    "#FFA42B",
    ease((progress - 0.5) / 0.3),
  );
}

/**
 * Walking down a sunlit gallery: arched frames alternate on both walls and
 * move toward the camera as the corridor scrolls.
 */
function drawMuseumCorridor(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  const background = context.createLinearGradient(0, 0, 0, REEL_HEIGHT);
  background.addColorStop(0, "#F7F1E8");
  background.addColorStop(1, "#E7DCC9");
  context.fillStyle = background;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const vpX = REEL_WIDTH / 2 + (view.orbit ?? 0) * 120;
  const vpY = 820;

  context.fillStyle = "#E2D6C2";
  context.beginPath();
  context.moveTo(0, REEL_HEIGHT);
  context.lineTo(REEL_WIDTH, REEL_HEIGHT);
  context.lineTo(vpX + 90, vpY);
  context.lineTo(vpX - 90, vpY);
  context.closePath();
  context.fill();

  context.fillStyle = "#F1E8D9";
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(REEL_WIDTH, 0);
  context.lineTo(vpX + 140, vpY - 170);
  context.lineTo(vpX - 140, vpY - 170);
  context.closePath();
  context.fill();

  context.strokeStyle = "rgba(90,75,55,0.12)";
  context.lineWidth = 3;
  for (let index = 0; index < 6; index += 1) {
    const y = 160 + index * 260;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(vpX, vpY);
    context.moveTo(REEL_WIDTH, y);
    context.lineTo(vpX, vpY);
    context.stroke();
  }

  const items = images
    .map((_, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const z = 120 + Math.floor(index / 2) * 420 - progress * 1900;
      return { index, side, z, scale: 900 / (900 + Math.max(-420, z)) };
    })
    .filter((item) => item.z > -520 && item.z < 1400)
    .sort((a, b) => b.z - a.z);

  for (const item of items) {
    const x = vpX + item.side * 360 * item.scale;
    const y = vpY - 150 * item.scale;
    const width = 260 * item.scale;
    const height = 340 * item.scale;
    const alpha = clamp((item.z + 520) / 500);

    const spot = context.createRadialGradient(x, y + height * 0.36, 8, x, y + height * 0.36, width * 1.7);
    spot.addColorStop(0, `rgba(255,214,140,${0.3 * alpha})`);
    spot.addColorStop(1, "rgba(255,214,140,0)");
    context.fillStyle = spot;
    context.fillRect(x - width * 1.7, y - height, width * 3.4, height * 3);

    context.save();
    context.globalAlpha = alpha;
    archPath(context, x - width / 2, y, width, height);
    context.fillStyle = "#FBF6EE";
    context.fill();

    context.save();
    archPath(context, x - width / 2 + 10 * item.scale, y + 10 * item.scale, width - 20 * item.scale, height - 20 * item.scale);
    context.clip();
    drawPhoto(
      context,
      images[item.index],
      x - width / 2,
      y,
      width,
      height,
      0,
      "#D8C7AE",
    );
    context.restore();

    archPath(context, x - width / 2, y, width, height);
    context.strokeStyle = "rgba(28,27,26,0.18)";
    context.lineWidth = Math.max(1, 4 * item.scale);
    context.stroke();
    context.restore();
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

/**
 * Ribboned gift cube that unfolds while tiered photo cards burst upward.
 */
function drawGiftBox(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  const background = context.createRadialGradient(
    REEL_WIDTH / 2,
    900,
    80,
    REEL_WIDTH / 2,
    900,
    980,
  );
  background.addColorStop(0, "#1A1310");
  background.addColorStop(1, "#0A0807");
  context.fillStyle = background;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const reveal = ease(clamp(progress / 0.6));
  const boxX = REEL_WIDTH / 2 + (view.orbit ?? 0) * 90;
  const boxY = 1330;
  const boxW = 540;
  const boxH = 380;

  const cakeY = boxY - 120 - reveal * 90;
  context.save();
  context.globalAlpha = 0.9;
  const cakeGlow = context.createRadialGradient(boxX, cakeY, 0, boxX, cakeY, 240);
  cakeGlow.addColorStop(0, "rgba(255,196,120,0.28)");
  cakeGlow.addColorStop(1, "rgba(255,196,120,0)");
  context.fillStyle = cakeGlow;
  context.beginPath();
  context.arc(boxX, cakeY, 240, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#F4D8C2";
  context.fillRect(boxX - 120, cakeY - 24, 240, 46);
  context.fillStyle = "#F9E6D6";
  context.fillRect(boxX - 88, cakeY - 66, 176, 44);
  context.fillStyle = "#FFF3E8";
  context.fillRect(boxX - 56, cakeY - 100, 112, 36);
  context.fillStyle = GOLD;
  context.fillRect(boxX - 4, cakeY - 138, 8, 32);
  const flameGlow = context.createRadialGradient(boxX, cakeY - 146, 0, boxX, cakeY - 146, 26);
  flameGlow.addColorStop(0, "rgba(255,246,196,0.95)");
  flameGlow.addColorStop(1, "rgba(255,164,43,0)");
  context.fillStyle = flameGlow;
  context.beginPath();
  context.arc(boxX, cakeY - 146, 26, 0, Math.PI * 2);
  context.fill();
  context.restore();

  for (let index = 0; index < images.length; index += 1) {
    const tier = Math.floor(index / 3);
    const column = index % 3;
    const appear = ease(clamp((progress - 0.12 - index * 0.045) / 0.5));
    const width = 170 - tier * 14;
    const height = width * 1.2;
    const x = boxX + (column - 1) * (150 + tier * 24);
    const y = boxY - 150 - tier * 150 - reveal * 280 - appear * 26;

    context.save();
    context.globalAlpha = appear;
    context.translate(x, y);
    context.rotate((column - 1) * 0.045 + Math.sin(progress * 2 + index) * 0.02);
    context.shadowColor = "rgba(0,0,0,0.45)";
    context.shadowBlur = 30;
    context.fillStyle = "#FFF9F2";
    roundedRect(context, -width / 2, -height / 2, width, height, 8);
    context.fill();
    context.shadowBlur = 0;
    drawPhoto(
      context,
      images[index],
      -width / 2 + 8,
      -height / 2 + 8,
      width - 16,
      height - 44,
      4,
      "#FFA42B",
    );
    context.restore();
  }

  context.save();
  context.globalAlpha = 0.95;

  context.fillStyle = "#7E1B2A";
  context.beginPath();
  context.moveTo(boxX - boxW / 2, boxY - boxH);
  context.lineTo(boxX - boxW / 2 - reveal * 190, boxY - boxH + 96 + reveal * 30);
  context.lineTo(boxX - boxW / 2 - reveal * 190, boxY + 60 + reveal * 30);
  context.lineTo(boxX - boxW / 2, boxY);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(boxX + boxW / 2, boxY - boxH);
  context.lineTo(boxX + boxW / 2 + reveal * 190, boxY - boxH + 96 + reveal * 30);
  context.lineTo(boxX + boxW / 2 + reveal * 190, boxY + 60 + reveal * 30);
  context.lineTo(boxX + boxW / 2, boxY);
  context.closePath();
  context.fill();

  context.fillStyle = "#120B0C";
  context.fillRect(boxX - boxW / 2, boxY - boxH, boxW, boxH);

  const faceHeight = boxH * (1 - reveal * 0.72);
  context.fillStyle = "#A32236";
  context.fillRect(boxX - boxW / 2, boxY - faceHeight, boxW, faceHeight);
  context.fillStyle = GOLD;
  context.fillRect(boxX - 30, boxY - faceHeight, 60, faceHeight);
  context.fillRect(boxX - boxW / 2, boxY - faceHeight * 0.58, boxW, 40);
  context.restore();

  context.save();
  context.translate(boxX, boxY - boxH - 30 - reveal * 230);
  context.rotate(-reveal * 0.32);
  context.shadowColor = "rgba(0,0,0,0.4)";
  context.shadowBlur = 40;
  context.fillStyle = "#B8283E";
  roundedRect(context, -boxW * 0.56, -62, boxW * 1.12, 86, 12);
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = GOLD;
  context.fillRect(-30, -62, 60, 86);
  context.fillRect(-boxW * 0.56, -30, boxW * 1.12, 22);
  context.beginPath();
  context.ellipse(-52, -52, 46, 28, -0.5, 0, Math.PI * 2);
  context.ellipse(52, -52, 46, 28, 0.5, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#8E1F2F";
  context.beginPath();
  context.arc(0, -52, 16, 0, Math.PI * 2);
  context.fill();
  context.restore();

  drawSparkles(context, progress, 67, 90, [CORAL, GOLD, "#FFFFFF"], 1.1);

  drawTitle(
    context,
    input,
    fonts,
    "#FFF8EC",
    "rgba(255,248,236,0.68)",
    CORAL,
    ease((progress - 0.55) / 0.3),
    1500,
  );
}

/**
 * Candlelit water sanctuary: slow breathing light, floating frames and soft
 * mirrored reflections. No confetti, no fast motion.
 */
function drawCandleSanctuary(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  const background = context.createLinearGradient(0, 0, 0, REEL_HEIGHT);
  background.addColorStop(0, "#0B1418");
  background.addColorStop(0.62, "#12232A");
  background.addColorStop(1, "#071013");
  context.fillStyle = background;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const breathe = 0.72 + Math.sin(progress * Math.PI * 2) * 0.28;
  const glow = context.createRadialGradient(REEL_WIDTH / 2, 1560, 30, REEL_WIDTH / 2, 1560, 860);
  glow.addColorStop(0, `rgba(255,190,110,${0.16 * breathe})`);
  glow.addColorStop(1, "rgba(255,190,110,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  context.fillStyle = "rgba(110,180,190,0.05)";
  context.fillRect(0, 1230, REEL_WIDTH, REEL_HEIGHT - 1230);
  context.strokeStyle = "rgba(190,235,240,0.07)";
  context.lineWidth = 2;
  for (let index = 0; index < 9; index += 1) {
    const y = 1250 + index * 74;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(REEL_WIDTH, y);
    context.stroke();
  }

  for (let index = 0; index < images.length; index += 1) {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x =
      250 +
      column * 400 +
      Math.sin(progress * 0.8 + index + (view.orbit ?? 0)) * 14;
    const y = 560 + row * 210 + Math.sin(progress * 1.1 + index) * 14 - progress * 40;
    const width = 260;
    const height = 320;

    context.save();
    context.globalAlpha = 0.92;
    context.shadowColor = "rgba(214,194,131,0.4)";
    context.shadowBlur = 34;
    drawPhoto(context, images[index], x, y, width, height, 26, "#25414A");
    context.restore();

    context.save();
    context.globalAlpha = 0.13;
    context.translate(x, 1160);
    context.scale(1, -0.35);
    drawPhoto(context, images[index], 0, 0, width, height, 26, "#25414A");
    context.restore();
  }

  const candleX = REEL_WIDTH / 2;
  const candleY = 1620;
  context.fillStyle = "#E9DCC4";
  roundedRect(context, candleX - 34, candleY, 68, 150, 10);
  context.fill();
  context.fillStyle = "rgba(255,255,255,0.18)";
  roundedRect(context, candleX - 24, candleY + 12, 16, 120, 8);
  context.fill();

  const flameHeight = 46 + Math.sin(progress * 6) * 8;
  const flame = context.createRadialGradient(candleX, candleY - 14, 0, candleX, candleY - 14, flameHeight);
  flame.addColorStop(0, "rgba(255,246,200,0.95)");
  flame.addColorStop(0.4, "rgba(255,180,80,0.6)");
  flame.addColorStop(1, "rgba(255,140,40,0)");
  context.fillStyle = flame;
  context.beginPath();
  context.ellipse(candleX, candleY - 14, flameHeight * 0.5, flameHeight, 0, 0, Math.PI * 2);
  context.fill();

  drawTitle(
    context,
    input,
    fonts,
    "#F1EADB",
    "rgba(241,234,219,0.62)",
    GOLD,
    ease((progress - 0.2) / 0.4),
    1400,
  );
}

/**
 * 35mm film strip running through a warm projector beam.
 */
function drawFilmReel(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  const background = context.createLinearGradient(0, 0, 0, REEL_HEIGHT);
  background.addColorStop(0, "#0B0B0B");
  background.addColorStop(1, "#17120E");
  context.fillStyle = background;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  context.save();
  context.globalCompositeOperation = "lighter";
  const beam = context.createLinearGradient(160, 260, 980, 1320);
  beam.addColorStop(0, "rgba(255,220,150,0.22)");
  beam.addColorStop(1, "rgba(255,220,150,0)");
  context.fillStyle = beam;
  context.beginPath();
  context.moveTo(150, 250);
  context.lineTo(330, 300);
  context.lineTo(1180, 1360);
  context.lineTo(520, 1540);
  context.closePath();
  context.fill();
  context.restore();

  context.save();
  context.fillStyle = "#1C1815";
  roundedRect(context, 70, 160, 210, 160, 18);
  context.fill();
  context.fillStyle = "#2B241E";
  context.beginPath();
  context.arc(280, 240, 36, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgba(214,194,131,0.65)";
  context.beginPath();
  context.arc(280, 240, 18, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(214,194,131,0.35)";
  context.lineWidth = 5;
  context.beginPath();
  context.arc(135, 150, 48, 0, Math.PI * 2);
  context.arc(215, 138, 34, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  const count = Math.max(1, images.length);
  context.save();
  context.translate(REEL_WIDTH / 2, 1010);
  context.rotate(-0.035 + (view.orbit ?? 0) * 0.02);
  const stripWidth = 1600;
  const stripHeight = 400;

  context.fillStyle = "#0D0B09";
  context.fillRect(-stripWidth / 2, -stripHeight / 2, stripWidth, stripHeight);

  const holeW = 16;
  const holeH = 22;
  const holeGap = 44;
  for (let x = -stripWidth / 2; x < stripWidth / 2; x += holeGap) {
    roundedRect(context, x, -stripHeight / 2 + 14, holeW, holeH, 4);
    context.fillStyle = "rgba(214,194,131,0.22)";
    context.fill();
    roundedRect(context, x, stripHeight / 2 - 36, holeW, holeH, 4);
    context.fill();
  }

  const frameW = 250;
  const frameH = 270;
  const gap = 26;
  const total = (frameW + gap) * count * 2;
  const offset = (progress * total) % total;

  for (let index = 0; index < count * 2; index += 1) {
    let x = index * (frameW + gap) - offset;
    if (x < -stripWidth / 2) x += total;
    if (x > stripWidth / 2 || x + frameW < -stripWidth / 2) continue;
    const photoIndex = index % count;
    context.fillStyle = "#1A1512";
    context.fillRect(x, -frameH / 2, frameW, frameH);
    drawPhoto(
      context,
      images[photoIndex],
      x + 10,
      -frameH / 2 + 10,
      frameW - 20,
      frameH - 52,
      4,
      GOLD,
    );
    context.fillStyle = "rgba(214,194,131,0.75)";
    context.font = `500 17px ${fonts.sans}`;
    context.textAlign = "left";
    context.fillText(`FRAME ${String(photoIndex + 1).padStart(2, "0")}`, x + 12, frameH / 2 - 16);
  }
  context.restore();

  drawSparkles(context, progress, 83, 28, [GOLD, "#FFFFFF"], 0.35);

  drawTitle(
    context,
    input,
    fonts,
    "#FFF8EC",
    "rgba(255,248,236,0.68)",
    GOLD,
    ease((progress - 0.52) / 0.3),
    1450,
  );
}

/**
 * Open scrapbook on a sunlit desk: taped photos, handwritten captions, page curl.
 */
function drawScrapbook(
  context: CanvasRenderingContext2D,
  input: MemoryReelInput,
  images: HTMLImageElement[],
  progress: number,
  view: MemoryView,
  fonts: ReelFonts,
) {
  const background = context.createLinearGradient(0, 0, 0, REEL_HEIGHT);
  background.addColorStop(0, "#E9DDCB");
  background.addColorStop(1, "#D6C3A7");
  context.fillStyle = background;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  context.save();
  context.shadowColor = "rgba(60,42,25,0.35)";
  context.shadowBlur = 60;
  context.shadowOffsetY = 26;
  context.fillStyle = "#FFFDF7";
  roundedRect(context, 70, 380, 940, 1160, 18);
  context.fill();
  context.restore();

  context.fillStyle = "#FFF9EE";
  context.fillRect(110, 420, 420, 1080);
  context.fillRect(550, 420, 420, 1080);

  const gutter = context.createLinearGradient(510, 0, 570, 0);
  gutter.addColorStop(0, "rgba(90,70,45,0)");
  gutter.addColorStop(0.5, "rgba(90,70,45,0.16)");
  gutter.addColorStop(1, "rgba(90,70,45,0)");
  context.fillStyle = gutter;
  context.fillRect(510, 420, 60, 1080);

  context.strokeStyle = "rgba(170,150,120,0.22)";
  context.lineWidth = 2;
  for (let index = 0; index < 12; index += 1) {
    const y = 520 + index * 80;
    context.beginPath();
    context.moveTo(140, y);
    context.lineTo(500, y);
    context.moveTo(580, y);
    context.lineTo(940, y);
    context.stroke();
  }

  const captions = ["that afternoon", "us, then", "the good year", "remember this"];
  for (let index = 0; index < images.length; index += 1) {
    const side = index % 2;
    const row = Math.floor(index / 2);
    const x =
      (side === 0 ? 320 : 760) +
      Math.sin(index * 2.1) * 22 +
      (view.orbit ?? 0) * 30;
    const y = 560 + row * 250 - progress * 36;
    const rotation = (side === 0 ? -1 : 1) * (0.04 + (index % 3) * 0.012);
    const width = 250;
    const height = 290;

    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.shadowColor = "rgba(70,50,30,0.28)";
    context.shadowBlur = 30;
    context.shadowOffsetY = 14;
    context.fillStyle = "#FFFFFF";
    roundedRect(context, -width / 2, -height / 2, width, height, 6);
    context.fill();
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    drawPhoto(
      context,
      images[index],
      -width / 2 + 10,
      -height / 2 + 10,
      width - 20,
      height - 74,
      2,
      "#C96F86",
    );
    context.fillStyle = "#5C4438";
    context.textAlign = "center";
    context.font = `italic 400 22px ${fonts.serif}`;
    context.fillText(captions[index % captions.length] ?? "remember this", 0, height / 2 - 20);

    context.fillStyle = "rgba(214,194,131,0.6)";
    context.save();
    context.rotate(-0.35);
    context.fillRect(-width / 2 - 6, -height / 2 - 22, 96, 22);
    context.restore();
    context.save();
    context.rotate(0.32);
    context.fillRect(width / 2 - 90, -height / 2 - 20, 90, 20);
    context.restore();
    context.restore();
  }

  context.save();
  context.fillStyle = "rgba(120,80,60,0.18)";
  context.beginPath();
  context.moveTo(970, 420);
  context.quadraticCurveTo(930, 960, 970, 1500);
  context.lineTo(1010, 1500);
  context.lineTo(1010, 420);
  context.closePath();
  context.fill();
  context.restore();

  drawTitle(
    context,
    input,
    fonts,
    INK,
    "rgba(28,27,26,0.6)",
    "#C96F86",
    ease((progress - 0.5) / 0.3),
    1660,
  );
}

function applyAtmosphere(
  context: CanvasRenderingContext2D,
  template: { accent: string; background: string },
) {
  context.save();
  context.globalCompositeOperation = "soft-light";
  const glow = context.createRadialGradient(
    REEL_WIDTH / 2,
    760,
    60,
    REEL_WIDTH / 2,
    760,
    1250,
  );
  glow.addColorStop(0, `${template.accent}33`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);

  const shade = context.createLinearGradient(0, 1100, 0, REEL_HEIGHT);
  shade.addColorStop(0, "rgba(255,255,255,0)");
  shade.addColorStop(1, `${template.background}88`);
  context.globalCompositeOperation = "multiply";
  context.fillStyle = shade;
  context.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);
  context.restore();
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

  const template = getMemoryTemplate(input.templateId ?? "");
  const rig = template?.rig ?? "3d-polaroid-clothesline";

  switch (rig) {
    case "3d-vinyl-turntable":
      drawVinyl(context, input, images, clamped, view, fonts);
      break;
    case "3d-sky-lanterns":
      drawSkyLanterns(context, input, images, clamped, view, fonts);
      break;
    case "3d-museum-corridor":
      drawMuseumCorridor(context, input, images, clamped, view, fonts);
      break;
    case "3d-gift-box-explosion":
      drawGiftBox(context, input, images, clamped, view, fonts);
      break;
    case "3d-film-reel-projector":
      drawFilmReel(context, input, images, clamped, view, fonts);
      break;
    case "3d-scrapbook-flipbook":
      drawScrapbook(context, input, images, clamped, view, fonts);
      break;
    case "3d-candle-sanctuary":
      drawCandleSanctuary(context, input, images, clamped, view, fonts);
      break;
    default:
      drawClothesline(context, input, images, clamped, view, fonts);
  }

  if (template) applyAtmosphere(context, template);
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
