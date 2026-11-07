import { createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fail } from "@/lib/api/respond";
import { mediaAdapter } from "@/lib/env";
import { mediaFilePath } from "@/lib/media/storage";
import { MEDIA_LIMITS, type MediaKind } from "@/lib/media/validate";
import { verifyMediaToken } from "@/lib/security/media-token";

export const runtime = "nodejs";

function sizeLimiter(maxBytes: number): Transform {
  let total = 0;
  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      total += chunk.length;
      if (total > maxBytes) {
        callback(new Error("upload_too_large"));
        return;
      }
      callback(null, chunk);
    },
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  if (mediaAdapter() !== "file") {
    return fail(404, "not_found", "Not found.");
  }

  const { key: segments } = await context.params;
  const key = segments.join("/");
  const token = new URL(request.url).searchParams.get("token") ?? "";

  if (!verifyMediaToken(key, "put", token)) {
    return fail(403, "forbidden", "This upload link is no longer valid.");
  }

  const kind = key.split("/")[2];
  if (!kind || !(kind in MEDIA_LIMITS)) {
    return fail(400, "invalid_key", "That upload target is not supported.");
  }

  const limit = MEDIA_LIMITS[kind as MediaKind].maxBytes;
  const declaredSize = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredSize) && declaredSize > limit) {
    return fail(413, "too_large", "That file is too large.");
  }

  if (!request.body) {
    return fail(400, "empty_body", "That upload was empty.");
  }

  const filePath = mediaFilePath(key);
  await mkdir(path.dirname(filePath), { recursive: true });

  try {
    await pipeline(
      Readable.fromWeb(
        request.body as unknown as import("node:stream/web").ReadableStream<Uint8Array>,
      ),
      sizeLimiter(limit),
      createWriteStream(filePath),
    );
  } catch {
    await unlink(filePath).catch(() => undefined);
    return fail(413, "too_large", "That file is too large.");
  }

  return new Response(null, { status: 204 });
}
