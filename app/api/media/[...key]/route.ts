import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { fail } from "@/lib/api/respond";
import { getSender } from "@/lib/auth/session";
import { mediaDriver } from "@/lib/env";
import { mediaFilePath } from "@/lib/media/storage";
import { contentTypeForKey, isValidMediaKey } from "@/lib/media/validate";
import { wishRepo } from "@/lib/repos/index";
import { mediaStore } from "@/lib/repos/index";
import { inspectMediaToken } from "@/lib/security/media-token";
import { isPublished, isUnlockTimeReached } from "@/lib/wishes/public";
import { hasUnlocked } from "@/lib/wishes/unlocked";

export const runtime = "nodejs";

/**
 * The only door to a wish's bytes.
 *
 * Two independent checks must pass: the signed token binds this exact key to
 * the wish's current passwordVersion, and the request must carry that wish's
 * unlock cookie. A URL copied out of the DOM therefore stops working as soon
 * as it expires, the password changes, or the visitor is not unlocked —
 * whatever the storage driver is.
 */

/** `wishes/<wishId>/<kind>/<name>.<ext>` */
function wishIdFromKey(key: string): string | null {
  const segments = key.split("/");
  if (segments[0] !== "wishes") return null;
  return segments[1] ?? null;
}

function parseRange(
  header: string | null,
  size: number,
): { start: number; end: number } | null {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  const [, startRaw, endRaw] = match;
  const start = startRaw ? Number(startRaw) : 0;
  const end = endRaw ? Number(endRaw) : size - 1;

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end >= size ||
    start > end
  ) {
    return null;
  }

  return { start, end };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  const { key: segments } = await context.params;
  const key = segments.join("/");

  if (!isValidMediaKey(key)) {
    return fail(404, "not_found", "Not found.");
  }

  const token = new URL(request.url).searchParams.get("token") ?? "";
  const check = inspectMediaToken(key, "get", token);
  if (!check.valid || check.version === null) {
    return fail(403, "forbidden", "This link is no longer valid.");
  }

  const wishId = wishIdFromKey(key);
  if (!wishId) return fail(404, "not_found", "Not found.");

  const wish = await wishRepo().getById(wishId);
  if (!wish) {
    return fail(404, "not_found", "Not found.");
  }

  // A password change bumps the version, which retires every outstanding link.
  if (check.version !== wish.passwordVersion) {
    return fail(403, "forbidden", "This link is no longer valid.");
  }

  // Two ways in: the signed-in owner (they are looking at their own draft in
  // the wizard) or a receiver who has already unlocked this wish.
  const sender = await getSender();
  const isOwner = sender !== null && sender.userId === wish.ownerId;

  if (!isOwner) {
    if (!isPublished(wish)) {
      return fail(404, "not_found", "Not found.");
    }
    if (!isUnlockTimeReached(wish)) {
      return fail(403, "forbidden", "This wish opens later.");
    }
    if (!(await hasUnlocked(wish, request))) {
      return fail(401, "locked", "Unlock this wish first.");
    }
  }

  const driver = mediaDriver();

  if (driver !== "file") {
    // Bytes live in R2/S3. Hand out a short-lived presigned URL now that the
    // unlock check has passed; the raw object is never publicly readable.
    const target = await mediaStore().createReadUrl(key);
    const redirect = new Response(null, {
      status: 302,
      headers: {
        Location: target,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
    return redirect;
  }

  const filePath = mediaFilePath(key);
  const stats = await stat(filePath).catch(() => null);
  if (!stats?.isFile()) {
    return fail(404, "not_found", "Not found.");
  }

  const range = parseRange(request.headers.get("range"), stats.size);
  const headers = new Headers({
    "Content-Type": contentTypeForKey(key),
    "Cache-Control": "private, max-age=900",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
    "X-Robots-Tag": "noindex, nofollow",
  });

  if (range) {
    headers.set("Content-Length", String(range.end - range.start + 1));
    headers.set(
      "Content-Range",
      `bytes ${range.start}-${range.end}/${stats.size}`,
    );
    const stream = Readable.toWeb(
      createReadStream(filePath, { start: range.start, end: range.end }),
    ) as unknown as ReadableStream;
    return new Response(stream, { status: 206, headers });
  }

  headers.set("Content-Length", String(stats.size));
  const stream = Readable.toWeb(
    createReadStream(filePath),
  ) as unknown as ReadableStream;
  return new Response(stream, { status: 200, headers });
}
