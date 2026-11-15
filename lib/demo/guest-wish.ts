import type { MusicBinding } from "@/lib/music/types";

export interface GuestWishPayload {
  version: 1;
  id: string;
  receiverName: string;
  title: string;
  message: string;
  milestoneDate: string | null;
  milestoneLabel: string | null;
  secretScratchMessage: string | null;
  giftVoucherCode: string | null;
  templateId: string;
  category: string;
  reelTemplateId: string;
  music: MusicBinding | null;
  musicId: string | null;
  password: string | null;
  hint: string | null;
  createdAt: string;
}

const STORAGE_KEY = "wishly_guest_wishes";
const HASH_PREFIX = "#w=";

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function makeGuestWishId(): string {
  return `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function encodeGuestWish(payload: GuestWishPayload): string {
  return toBase64Url(JSON.stringify(payload));
}

export function guestWishUrl(payload: GuestWishPayload, origin: string): string {
  return `${origin}/w/${payload.id}${HASH_PREFIX}${encodeGuestWish(payload)}`;
}

export function decodeGuestWish(value: string): GuestWishPayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(value)) as Partial<GuestWishPayload>;
    if (
      parsed.version !== 1 ||
      typeof parsed.id !== "string" ||
      typeof parsed.title !== "string" ||
      typeof parsed.message !== "string" ||
      typeof parsed.templateId !== "string" ||
      typeof parsed.category !== "string"
    ) {
      return null;
    }
    return parsed as GuestWishPayload;
  } catch {
    return null;
  }
}

export function saveGuestWish(payload: GuestWishPayload): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const list = Array.isArray(parsed)
      ? parsed.filter((item): item is GuestWishPayload => Boolean(item))
      : [];
    const next = [payload, ...list.filter((item) => item.id !== payload.id)].slice(
      0,
      8,
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The shareable URL still carries the payload.
  }
}

export function loadGuestWish(id: string): GuestWishPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return (
      (parsed as GuestWishPayload[]).find((item) => item.id === id) ?? null
    );
  } catch {
    return null;
  }
}

export function guestPayloadFromHash(hash: string): GuestWishPayload | null {
  if (!hash.startsWith(HASH_PREFIX)) return null;
  return decodeGuestWish(hash.slice(HASH_PREFIX.length));
}
