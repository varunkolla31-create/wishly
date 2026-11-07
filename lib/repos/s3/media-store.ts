import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";
import {
  checkStoredMedia,
  isValidMediaKey,
  validateUpload,
  type UploadVerification,
} from "@/lib/media/validate";
import type { MediaStore, PresignInput, UploadTarget } from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

const PUT_TTL_SECONDS = 15 * 60;
const GET_TTL_SECONDS = 60 * 60;

let cached: S3Client | null = null;

function s3(): S3Client {
  if (cached) return cached;

  const config = env();
  cached = new S3Client({
    region: config.AWS_REGION ?? "us-east-1",
    endpoint: config.AWS_ENDPOINT_URL,
    // LocalStack needs path-style addressing; real S3 works either way.
    forcePathStyle: Boolean(config.AWS_ENDPOINT_URL),
    credentials:
      config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: config.AWS_ACCESS_KEY_ID,
            secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
  return cached;
}

function bucket(): string {
  const name = env().S3_BUCKET;
  if (!name) throw new Error("S3_BUCKET is required for MEDIA_ADAPTER=s3.");
  return name;
}

export class S3MediaStore implements MediaStore {
  async createUpload(input: PresignInput): Promise<UploadTarget> {
    const validation = validateUpload(
      input.kind,
      input.contentType,
      input.size,
    );
    if (!validation.ok) throw new Error(validation.reason);

    const key = `wishes/${input.wishId}/${input.kind}/${newId()}.${validation.extension}`;

    const uploadUrl = await getSignedUrl(
      s3(),
      new PutObjectCommand({
        Bucket: bucket(),
        Key: key,
        ContentType: input.contentType,
        ContentLength: input.size,
      }),
      { expiresIn: PUT_TTL_SECONDS },
    );

    return {
      key,
      uploadUrl,
      method: "PUT",
      headers: { "Content-Type": input.contentType },
    };
  }

  async createReadUrl(key: string): Promise<string> {
    return getSignedUrl(
      s3(),
      new GetObjectCommand({ Bucket: bucket(), Key: key }),
      { expiresIn: GET_TTL_SECONDS },
    );
  }

  async verifyUpload(key: string): Promise<UploadVerification> {
    if (!isValidMediaKey(key)) return { ok: false, reason: "type" };

    try {
      const head = await s3().send(
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
    await s3().send(
      new DeleteObjectCommand({ Bucket: bucket(), Key: key }),
    );
  }
}
