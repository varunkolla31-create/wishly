import "server-only";
import { stat, unlink } from "node:fs/promises";
import { env } from "@/lib/env";
import { mediaFilePath } from "@/lib/media/storage";
import {
  checkStoredMedia,
  contentTypeForKey,
  validateUpload,
  type UploadVerification,
} from "@/lib/media/validate";
import type {
  MediaStore,
  PresignInput,
  UploadTarget,
} from "@/lib/repos/types";
import { signMediaToken } from "@/lib/security/media-token";
import { newId } from "@/lib/utils/ids";

function routeUrl(
  pathname: string,
  key: string,
  action: "put" | "get",
): string {
  const token = signMediaToken(key, action);
  return `${env().APP_URL}${pathname}/${key}?token=${encodeURIComponent(token)}`;
}

export class FileMediaStore implements MediaStore {
  async createUpload(input: PresignInput): Promise<UploadTarget> {
    const validation = validateUpload(
      input.kind,
      input.contentType,
      input.size,
    );
    if (!validation.ok) {
      throw new Error(validation.reason);
    }

    const key = `wishes/${input.wishId}/${input.kind}/${newId()}.${validation.extension}`;

    return {
      key,
      uploadUrl: routeUrl("/api/uploads", key, "put"),
      method: "PUT",
      headers: { "Content-Type": input.contentType },
    };
  }

  async createReadUrl(key: string): Promise<string> {
    mediaFilePath(key);
    return routeUrl("/api/media", key, "get");
  }

  async verifyUpload(key: string): Promise<UploadVerification> {
    let size: number;
    try {
      const stats = await stat(mediaFilePath(key));
      if (!stats.isFile()) return { ok: false, reason: "missing" };
      size = stats.size;
    } catch {
      return { ok: false, reason: "missing" };
    }

    return checkStoredMedia(key, size, contentTypeForKey(key));
  }

  async delete(key: string): Promise<void> {
    const filePath = mediaFilePath(key);
    await unlink(filePath).catch((error: unknown) => {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    });
  }
}
