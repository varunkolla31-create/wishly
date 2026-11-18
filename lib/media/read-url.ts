import "server-only";
import { env } from "@/lib/env";
import { mediaDriver } from "@/lib/env";
import { isValidMediaKey } from "@/lib/media/validate";
import { signMediaToken } from "@/lib/security/media-token";

/**
 * The only way a wish's media should ever reach a browser.
 *
 * Every driver — local disk, R2, S3 — is served through `/api/media/:key`,
 * because that route is where the unlock cookie and the wish's lock state are
 * checked. Storage presigned URLs are still used, but only *inside* that route
 * after the check passes, so a copied URL is useless on its own.
 */
export function mediaProxyUrl(key: string, version: number): string {
  if (!isValidMediaKey(key)) {
    throw new Error("Invalid media key.");
  }
  const token = signMediaToken(key, "get", Date.now(), version);
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `${env().APP_URL.replace(/\/$/, "")}/api/media/${encoded}?token=${encodeURIComponent(token)}`;
}

/** True when the bytes live outside the local disk and need a redirect. */
export function mediaNeedsRedirect(): boolean {
  return mediaDriver() !== "file";
}
