import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoTables, env } from "@/lib/env";

let cached: DynamoDBDocumentClient | null = null;

/**
 * One document client per process. Static keys are used when present; without
 * them the SDK falls back to its default chain, so an IAM role works in
 * production and nothing is ever hard-coded.
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

export function tables() {
  return dynamoTables();
}

/** Upper bound on pages we will read in one list call. */
export const MAX_PAGES = 10;
