import { validateUpload, type MediaKind } from "@/lib/media/validate";

interface PresignPayload {
  key: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
}

/**
 * Uploads for a creator with no account. The manage token is the capability:
 * it authorises an upload into that one wish's prefix and nothing else.
 */
export async function uploadAnonymousMedia(
  token: string,
  kind: MediaKind,
  file: File,
): Promise<string> {
  const validation = validateUpload(kind, file.type, file.size);
  if (!validation.ok) throw new Error(validation.reason);

  const response = await fetch(`/api/wishes/anonymous/${token}/upload/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, contentType: file.type, size: file.size }),
  });

  const payload = (await response.json()) as {
    ok: boolean;
    data?: PresignPayload;
    error?: { message?: string };
  };

  if (!response.ok || !payload.data) {
    throw new Error(payload.error?.message ?? "Couldn't prepare that upload.");
  }

  const target = payload.data;
  const upload = await fetch(target.uploadUrl, {
    method: target.method,
    headers: target.headers,
    body: file,
  });

  if (!upload.ok) throw new Error("That upload didn't finish. Try again.");

  return target.key;
}
