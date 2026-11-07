import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { env } from "@/lib/env";

let cached: DynamoDBDocumentClient | null = null;

/**
 * One document client per process. `AWS_ENDPOINT_URL` points the same client at
 * LocalStack; unset it and the SDK resolves the real regional endpoint.
 */
export function ddb(): DynamoDBDocumentClient {
  if (cached) return cached;

  const config = env();
  const base = new DynamoDBClient({
    region: config.AWS_REGION ?? "us-east-1",
    endpoint: config.AWS_ENDPOINT_URL,
    credentials:
      config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: config.AWS_ACCESS_KEY_ID,
            secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });

  cached = DynamoDBDocumentClient.from(base, {
    marshallOptions: { removeUndefinedValues: true },
  });
  return cached;
}

export function tableName(): string {
  const name = env().DYNAMODB_TABLE;
  if (!name) throw new Error("DYNAMODB_TABLE is required for DATA_ADAPTER=dynamodb.");
  return name;
}

/** Single-table key builders, matching docs/DATA_MODEL.md. */
export const keys = {
  wishPk: (wishId: string) => `WISH#${wishId}`,
  meta: () => "META",
  contribution: (contributionId: string) => `CONTRIB#${contributionId}`,
  reply: (replyId: string) => `REPLY#${replyId}`,
  ownerGsi1Pk: (ownerId: string) => `OWNER#${ownerId}`,
  ownerUpdatedGsi1Sk: (updatedAt: string) => `UPDATED#${updatedAt}`,
  ownerReplyGsi2Pk: (ownerId: string) => `OWNER#${ownerId}`,
  replyGsi2Sk: (createdAt: string) => `REPLY#${createdAt}`,
  tokenGsi3Pk: (token: string) => `CONTRIB_TOKEN#${token}`,
  metaGsi3Sk: () => "META",
};
