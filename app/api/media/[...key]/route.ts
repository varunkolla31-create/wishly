import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { fail } from "@/lib/api/respond";
import { mediaAdapter } from "@/lib/env";
import { mediaFilePath } from "@/lib/media/storage";
import { contentTypeForKey } from "@/lib/media/validate";
import { verifyMediaToken } from "@/lib/security/media-token";

export const runtime = "nodejs";

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
  if (mediaAdapter() !== "file") {
    return fail(404, "not_found", "Not found.");
  }

  const { key: segments } = await context.params;
  const key = segments.join("/");
  const token = new URL(request.url).searchParams.get("token") ?? "";

  if (!verifyMediaToken(key, "get", token)) {
    return fail(403, "forbidden", "This link is no longer valid.");
  }

  const filePath = mediaFilePath(key);
  const stats = await stat(filePath).catch(() => null);
  if (!stats?.isFile()) {
    return fail(404, "not_found", "Not found.");
  }

  const range = parseRange(request.headers.get("range"), stats.size);
  const headers = new Headers({
    "Content-Type": contentTypeForKey(key),
    "Cache-Control": "private, max-age=3600",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
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
