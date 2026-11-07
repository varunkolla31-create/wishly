export interface KeepsakeCardInput {
  title: string;
  occasionName?: string | null;
  url: string;
  qrDataUrl: string;
  hint?: string | null;
  filename?: string;
}

const WIDTH = 1080;
const HEIGHT = 1350;
const INK = "#1C1B1A";
const MUTED = "#6B6762";
const HAIRLINE = "#EBE5DA";
const SAND = "#F7F1E8";
const CORAL = "#FF385C";

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

export async function downloadKeepsakeCard(input: KeepsakeCardInput) {
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

  context.strokeStyle = HAIRLINE;
  context.lineWidth = 2;
  roundedRect(context, 44, 44, WIDTH - 88, HEIGHT - 88, 36);
  context.stroke();

  // Wishly wordmark
  context.textAlign = "center";
  context.fillStyle = CORAL;
  context.beginPath();
  context.arc(WIDTH / 2 - 62, 172, 7, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = INK;
  context.font = `600 22px ${sans}`;
  context.letterSpacing = "7px";
  context.fillText("WISHLY", WIDTH / 2 + 12, 180);
  context.letterSpacing = "0px";

  // Title
  context.fillStyle = INK;
  context.font = `italic 400 68px ${serif}`;
  const titleLines = wrapCentered(context, input.title || "A wish for you", 820, 3);
  let cursorY = 300;
  for (const line of titleLines) {
    context.fillText(line, WIDTH / 2, cursorY);
    cursorY += 82;
  }

  // Occasion
  context.fillStyle = MUTED;
  context.font = `400 24px ${sans}`;
  const occasion = input.occasionName ? `${input.occasionName} · ` : "";
  context.fillText(`${occasion}Scan to open your wish.`, WIDTH / 2, cursorY + 18);

  // QR
  const qr = await loadImage(input.qrDataUrl);
  const qrSize = 420;
  const qrX = (WIDTH - qrSize) / 2;
  const qrY = 596;
  context.fillStyle = "#FFFFFF";
  roundedRect(context, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 24);
  context.fill();
  context.strokeStyle = HAIRLINE;
  context.lineWidth = 2;
  roundedRect(context, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 24);
  context.stroke();
  context.imageSmoothingEnabled = false;
  context.drawImage(qr, qrX, qrY, qrSize, qrSize);
  context.imageSmoothingEnabled = true;

  // URL
  context.fillStyle = MUTED;
  context.font = `400 20px ${sans}`;
  const urlLines = wrapCentered(context, input.url, 800, 2);
  let urlY = qrY + qrSize + 58;
  for (const line of urlLines) {
    context.fillText(line, WIDTH / 2, urlY);
    urlY += 30;
  }

  // Password pill
  const pillText = "Password: the one you were given";
  context.font = `400 22px ${sans}`;
  const pillWidth = Math.min(760, context.measureText(pillText).width + 80);
  const pillX = (WIDTH - pillWidth) / 2;
  const pillY = urlY + 32;
  context.fillStyle = SAND;
  roundedRect(context, pillX, pillY, pillWidth, 66, 33);
  context.fill();
  context.fillStyle = MUTED;
  context.fillText(pillText, WIDTH / 2, pillY + 42);

  // Hint
  let hintY = pillY + 112;
  if (input.hint?.trim()) {
    context.fillStyle = MUTED;
    context.font = `400 20px ${sans}`;
    const hintLines = wrapCentered(context, `Hint: ${input.hint.trim()}`, 760, 2);
    for (const line of hintLines) {
      context.fillText(line, WIDTH / 2, hintY);
      hintY += 28;
    }
  }

  // Footer
  context.fillStyle = MUTED;
  context.font = `500 18px ${sans}`;
  context.letterSpacing = "4px";
  context.fillText("MADE WITH WISHLY", WIDTH / 2, HEIGHT - 96);
  context.letterSpacing = "0px";

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Could not export the card.");

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = input.filename ?? "wishly-keepsake.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}
