export const MEDIA_KINDS = ["photo", "video", "voice"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export function isMediaKind(value: string): value is MediaKind {
  return (MEDIA_KINDS as readonly string[]).includes(value);
}

const MEDIA_KEY_PATTERN =
  /^wishes\/[A-Za-z0-9_-]{1,64}\/(photo|video|voice)\/[A-Za-z0-9_-]{1,64}\.[a-z0-9]{1,5}$/;

export function isValidMediaKey(key: string): boolean {
  return MEDIA_KEY_PATTERN.test(key);
}

export function mediaKeyPrefix(wishId: string): string {
  return `wishes/${wishId}/`;
}

export function mediaKindFromKey(key: string): MediaKind | null {
  if (!isValidMediaKey(key)) return null;
  const segment = key.split("/")[2];
  if (!segment || !isMediaKind(segment)) return null;
  return segment;
}

const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const VOICE_TYPES: Record<string, string> = {
  "audio/webm": "weba",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
};

const MB = 1024 * 1024;

export const MEDIA_LIMITS: Record<
  MediaKind,
  { maxBytes: number; maxMb: number; types: Record<string, string> }
> = {
  photo: { maxBytes: 10 * MB, maxMb: 10, types: PHOTO_TYPES },
  video: { maxBytes: 100 * MB, maxMb: 100, types: VIDEO_TYPES },
  voice: { maxBytes: 5 * MB, maxMb: 5, types: VOICE_TYPES },
};

export type UploadValidation =
  | { ok: true; extension: string }
  | { ok: false; reason: string };

export function validateUpload(
  kind: MediaKind,
  contentType: string,
  size: number,
): UploadValidation {
  const limit = MEDIA_LIMITS[kind];
  const extension = limit.types[contentType.toLowerCase()];

  if (!extension) {
    return { ok: false, reason: `That file type is not supported for ${kind}.` };
  }
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, reason: "That file looks empty." };
  }
  if (size > limit.maxBytes) {
    return {
      ok: false,
      reason: `Keep ${kind} files under ${limit.maxMb}MB.`,
    };
  }

  return { ok: true, extension };
}

export function acceptAttribute(kind: MediaKind): string {
  return Object.keys(MEDIA_LIMITS[kind].types).join(",");
}

const EXTENSION_TO_TYPE: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(PHOTO_TYPES).map(([type, ext]) => [ext, type]),
  ),
  ...Object.fromEntries(
    Object.entries(VIDEO_TYPES).map(([type, ext]) => [ext, type]),
  ),
  ...Object.fromEntries(
    Object.entries(VOICE_TYPES).map(([type, ext]) => [ext, type]),
  ),
};

export function contentTypeForKey(key: string): string {
  const extension = key.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_TYPE[extension] ?? "application/octet-stream";
}
