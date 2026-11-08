export interface GiftTagInput {
  title: string;
  hint?: string | null;
  url: string;
  qrDataUrl: string;
  filename?: string;
}

const WIDTH = 1200;
const HEIGHT = 1500;
const INK = "#1C1B1A";
const MUTED = "#6B6762";
const HAIRLINE = "#EBE5DA";
const SAND = "#F7F1E8";
const CORAL = "#FF385C";
const GOLD = "#D6C283";

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

function wrapCentered(
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

function fontFamily(selector: string, fallback: string) {
  const probe = document.createElement("span");
  if (selector) probe.className = selector;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();
  return family || fallback;
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the QR code."));
    image.src = source;
  });
}

export async function downloadGiftTag(input: GiftTagInput) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  await document.fonts?.ready.catch(() => undefined);
  const serif = fontFamily("font-serif", "Georgia, serif");
  const sans = fontFamily("", "system-ui, sans-serif");

  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const wash = context.createLinearGradient(0, 0, WIDTH, HEIGHT);
  wash.addColorStop(0, "#FFFDF8");
  wash.addColorStop(0.5, SAND);
  wash.addColorStop(1, "#F5E9D6");
  context.fillStyle = wash;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.strokeStyle = GOLD;
  context.lineWidth = 6;
  roundedRect(context, 42, 42, WIDTH - 84, HEIGHT - 84, 46);
  context.stroke();

  context.textAlign = "center";

  context.fillStyle = CORAL;
  context.beginPath();
  context.arc(WIDTH / 2 - 78, 158, 9, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = INK;
  context.font = `600 26px ${sans}`;
  context.letterSpacing = "9px";
  context.fillText("WISHLY", WIDTH / 2 + 16, 168);
  context.letterSpacing = "0px";

  context.fillStyle = MUTED;
  context.font = `500 20px ${sans}`;
  context.letterSpacing = "5px";
  context.fillText("A GIFT TO UNLOCK", WIDTH / 2, 238);
  context.letterSpacing = "0px";

  context.fillStyle = INK;
  context.font = `italic 400 82px ${serif}`;
  const titleLines = wrapCentered(context, input.title || "A wish for you", 900, 3);
  let cursorY = 350;
  for (const line of titleLines) {
    context.fillText(line, WIDTH / 2, cursorY);
    cursorY += 98;
  }

  context.fillStyle = GOLD;
  context.fillRect(WIDTH / 2 - 70, cursorY - 34, 140, 6);
  cursorY += 58;

  const qr = await loadImage(input.qrDataUrl);
  const qrSize = 470;
  const qrX = (WIDTH - qrSize) / 2;
  const qrY = 700;
  context.fillStyle = "#FFFFFF";
  roundedRect(context, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 30);
  context.fill();
  context.strokeStyle = HAIRLINE;
  context.lineWidth = 2;
  roundedRect(context, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 30);
  context.stroke();
  context.imageSmoothingEnabled = false;
  context.drawImage(qr, qrX, qrY, qrSize, qrSize);
  context.imageSmoothingEnabled = true;

  context.fillStyle = INK;
  context.font = `italic 400 46px ${serif}`;
  context.fillText("Scan to unlock your surprise", WIDTH / 2, qrY + qrSize + 86);

  context.fillStyle = MUTED;
  context.font = `400 22px ${sans}`;
  const urlLines = wrapCentered(context, input.url, 900, 2);
  let urlY = qrY + qrSize + 132;
  for (const line of urlLines) {
    context.fillText(line, WIDTH / 2, urlY);
    urlY += 32;
  }

  const hint = input.hint?.trim();
  if (hint) {
    const pillText = `Hint: ${hint}`;
    context.font = `400 24px ${sans}`;
    const pillWidth = Math.min(880, context.measureText(pillText).width + 96);
    const pillX = (WIDTH - pillWidth) / 2;
    const pillY = urlY + 26;
    context.fillStyle = SAND;
    roundedRect(context, pillX, pillY, pillWidth, 72, 36);
    context.fill();
    context.strokeStyle = HAIRLINE;
    context.lineWidth = 2;
    roundedRect(context, pillX, pillY, pillWidth, 72, 36);
    context.stroke();
    context.fillStyle = MUTED;
    context.fillText(pillText, WIDTH / 2, pillY + 46);
  }

  context.fillStyle = MUTED;
  context.font = `500 18px ${sans}`;
  context.letterSpacing = "4px";
  context.fillText("MADE WITH WISHLY", WIDTH / 2, HEIGHT - 84);
  context.letterSpacing = "0px";

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Could not export the gift tag.");

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = input.filename ?? "wishly-gift-tag.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}
