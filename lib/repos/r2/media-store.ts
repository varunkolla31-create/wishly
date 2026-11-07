import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env, r2Endpoint } from "@/lib/env";
import {
  checkStoredMedia,
  isValidMediaKey,
  validateUpload,
  type UploadVerification,
} from "@/lib/media/validate";
import type {
  MediaStore,
  PresignInput,
  UploadTarget,
} from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

const PUT_TTL_SECONDS = 10 * 60;
const GET_TTL_SECONDS = 15 * 60;

let cached: S3Client | null = null;

function credentials() {
  const config = env();
  const accessKeyId = config.R2_ACCESS_KEY_ID;
  const secretAccessKey = config.R2_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are required.");
  }
  return { accessKeyId, secretAccessKey };
}

/**
 * Cloudflare R2 over the S3 API. Three things differ from S3 and all three are
 * required here: the region is literally "auto", path-style addressing is
 * forced, and default SDK checksums are disabled — a PutObject presigned with
 * checksum parameters fails once the browser sends the real body.
 */
function r2(): S3Client {
  if (cached) return cached;

  cached = new S3Client({
    region: "auto",
    endpoint: r2Endpoint(),
    forcePathStyle: true,
    credentials: credentials(),
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return cached;
}

function bucket(): string {
  const name = env().R2_BUCKET;
  if (!name) throw new Error("R2_BUCKET is required for MEDIA_DRIVER=r2.");
  return name;
}

/** Belt and braces: strip any checksum the SDK still signs into the URL. */
export function stripChecksumParams(signedUrl: string): string {
  const url = new URL(signedUrl);
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("x-amz-checksum-") || key === "x-amz-sdk-checksum-algorithm") {
      url.searchParams.delete(key);
    }
  }
  return url.toString();
}

export class R2MediaStore implements MediaStore {
  async createUpload(input: PresignInput): Promise<UploadTarget> {
    const validation = validateUpload(
      input.kind,
      input.contentType,
      input.size,
    );
    if (!validation.ok) throw new Error(validation.reason);

    const key = `wishes/${input.wishId}/${input.kind}/${newId()}.${validation.extension}`;

    // Content-Type is signed so R2 rejects a body of a different type.
    // Content-Length is deliberately not signed: browsers set it themselves and
    // any mismatch fails the signature. Size is enforced by the head check.
    const signed = await getSignedUrl(
      r2(),
      new PutObjectCommand({
        Bucket: bucket(),
        Key: key,
        ContentType: input.contentType,
      }),
      { expiresIn: PUT_TTL_SECONDS },
    );

    return {
      key,
      uploadUrl: stripChecksumParams(signed),
      method: "PUT",
      headers: { "Content-Type": input.contentType },
    };
  }

  async createReadUrl(key: string): Promise<string> {
    return getSignedUrl(
      r2(),
      new GetObjectCommand({ Bucket: bucket(), Key: key }),
      { expiresIn: GET_TTL_SECONDS },
    );
  }

  async verifyUpload(key: string): Promise<UploadVerification> {
    // Reject a malformed or traversal-shaped key before it ever reaches R2.
    if (!isValidMediaKey(key)) return { ok: false, reason: "type" };

    try {
      const head = await r2().send(
        new HeadObjectCommand({ Bucket: bucket(), Key: key }),
      );
      return checkStoredMedia(key, head.ContentLength ?? 0, head.ContentType);
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } })
        .$metadata?.httpStatusCode;
      const name = (error as { name?: string }).name;
      if (status === 404 || name === "NotFound" || name === "NoSuchKey") {
        return { ok: false, reason: "missing" };
      }
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    if (!isValidMediaKey(key)) {
      throw new Error("Invalid media key.");
    }
    await r2().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
  }
}
