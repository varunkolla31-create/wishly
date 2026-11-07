import type { MediaItem } from "@/lib/media/types";
import { validateUpload, type MediaKind } from "@/lib/media/validate";

interface PresignPayload {
  key: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  readUrl: string;
}

function assertVideoDuration(file: File, maxSeconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      if (Number.isFinite(duration) && duration > maxSeconds) {
        reject(new Error(`Keep videos under ${maxSeconds} seconds.`));
        return;
      }
      resolve();
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That video couldn't be read."));
    };

    video.src = url;
  });
}

export async function uploadMedia(
  wishId: string,
  kind: MediaKind,
  file: File,
): Promise<MediaItem> {
  const validation = validateUpload(kind, file.type, file.size);
  if (!validation.ok) {
    throw new Error(validation.reason);
  }

  if (kind === "video") {
    await assertVideoDuration(file, 60);
  }

  const response = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wishId,
      kind,
      contentType: file.type,
      size: file.size,
    }),
  });

  const payload = (await response.json()) as {
    ok: boolean;
    data?: PresignPayload;
    error?: { message?: string };
  };

  if (!response.ok || !payload.data) {
    throw new Error(
      payload.error?.message ?? "Couldn't prepare that upload.",
    );
  }

  const target = payload.data;
  const upload = await fetch(target.uploadUrl, {
    method: target.method,
    headers: target.headers,
    body: file,
  });

  if (!upload.ok) {
    throw new Error("That upload didn't finish. Try again.");
  }

  // The object exists in the store now; the server confirms its type and size
  // before the draft is allowed to reference it.
  const confirm = await fetch("/api/upload/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: target.key }),
  });

  if (!confirm.ok) {
    const failure = (await confirm.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(
      failure?.error?.message ?? "That upload couldn't be verified.",
    );
  }

  return { key: target.key, url: target.readUrl, kind };
}
