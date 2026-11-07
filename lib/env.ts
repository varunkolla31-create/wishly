import "server-only";
import { z } from "zod";

const DEV_SECRET = "dev-only-change-me";

function boolFromEnv(fallback: boolean) {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "boolean") return value;
    return value === "true" || value === "1";
  }, z.boolean());
}

function intFromEnv(fallback: number, min: number, max: number) {
  return z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === "") return fallback;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    },
    z.number().int().min(min).max(max),
  );
}

/** Treats an empty value (as in .env.example) as "not set". */
const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().min(1).default("http://localhost:3000"),
  DATA_DIR: z.string().min(1).default(".wishly-data"),

  AUTH_MODE: z.enum(["dev", "clerk"]).default("dev"),
  DEV_AUTH_BYPASS: boolFromEnv(true),
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.0-flash"),

  YOUTUBE_API_KEY: z.string().optional(),
  YOUTUBE_DAILY_SEARCH_LIMIT: intFromEnv(80, 1, 100),

  AUTH_SECRET: z.string().min(16).default(DEV_SECRET),
  WISH_UNLOCK_SECRET: z.string().min(16).default(DEV_SECRET),

  FEATURE_BILLING: boolFromEnv(false),
  FEATURE_GROUP_MODE: boolFromEnv(true),

  /** Independent switches: data and media can use different backends. */
  DB_DRIVER: z.preprocess(
    emptyToUndefined,
    z.enum(["file", "postgres", "aws"]).optional(),
  ),
  MEDIA_DRIVER: z.preprocess(
    emptyToUndefined,
    z.enum(["file", "aws"]).optional(),
  ),
  /** Deprecated aliases, still honoured for existing configs and tests. */
  DATA_ADAPTER: z.preprocess(
    emptyToUndefined,
    z.enum(["file", "dynamodb", "postgres"]).optional(),
  ),
  MEDIA_ADAPTER: z.preprocess(
    emptyToUndefined,
    z.enum(["file", "s3"]).optional(),
  ),
  /** Coarse fallback: aws means DynamoDB + S3 unless a finer var is set. */
  STORAGE_DRIVER: z.enum(["file", "aws"]).default("file"),

  /** Pooled connection string used by the app. */
  DATABASE_URL: z.string().optional(),
  /** Direct connection string; migrations prefer it when present. */
  DATABASE_URL_UNPOOLED: z.string().optional(),
  /** Contract tests only. They create a throwaway schema. */
  DATABASE_URL_TEST: z.string().optional(),

  AWS_REGION: z.string().optional(),
  AWS_ENDPOINT_URL: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  DYNAMODB_WISHES_TABLE: z.string().min(1).default("Wishes"),
  DYNAMODB_CONTRIBUTIONS_TABLE: z.string().min(1).default("Contributions"),
  DYNAMODB_REPLIES_TABLE: z.string().min(1).default("Replies"),
  /** Legacy single-table name; used as the wishes table when set. */
  DYNAMODB_TABLE: z.string().optional(),
  S3_BUCKET: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function env(): AppEnv {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    DATA_DIR: process.env.WISHLY_DATA_DIR,
    AUTH_MODE: process.env.AUTH_MODE,
    DEV_AUTH_BYPASS: process.env.WISHLY_DEV_AUTH_BYPASS,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    YOUTUBE_DAILY_SEARCH_LIMIT: process.env.YOUTUBE_DAILY_SEARCH_LIMIT,
    AUTH_SECRET: process.env.AUTH_SECRET,
    WISH_UNLOCK_SECRET: process.env.WISH_UNLOCK_SECRET,
    FEATURE_BILLING: process.env.FEATURE_BILLING,
    FEATURE_GROUP_MODE: process.env.FEATURE_GROUP_MODE,
    DB_DRIVER: process.env.DB_DRIVER,
    MEDIA_DRIVER: process.env.MEDIA_DRIVER,
    DATA_ADAPTER: process.env.DATA_ADAPTER,
    MEDIA_ADAPTER: process.env.MEDIA_ADAPTER,
    STORAGE_DRIVER: process.env.STORAGE_DRIVER,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    DATABASE_URL_TEST: process.env.DATABASE_URL_TEST,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ENDPOINT_URL: process.env.AWS_ENDPOINT_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    DYNAMODB_WISHES_TABLE: process.env.DYNAMODB_WISHES_TABLE,
    DYNAMODB_CONTRIBUTIONS_TABLE: process.env.DYNAMODB_CONTRIBUTIONS_TABLE,
    DYNAMODB_REPLIES_TABLE: process.env.DYNAMODB_REPLIES_TABLE,
    DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
    S3_BUCKET: process.env.S3_BUCKET ?? process.env.S3_BUCKET_MEDIA,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration — ${details}`);
  }

  const value = parsed.data;
  const db = dbDriver(value);
  const media = mediaDriver(value);

  if (db === "postgres") {
    const url = value.DATABASE_URL;
    if (!url) {
      throw new Error("DB_DRIVER=postgres requires DATABASE_URL.");
    }
    if (!/^postgres(ql)?:\/\//.test(url)) {
      throw new Error("DATABASE_URL must be a postgres:// or postgresql:// URL.");
    }
    if (!/[?&]sslmode=(require|verify-ca|verify-full)\b/.test(url)) {
      throw new Error(
        "DATABASE_URL must include sslmode=require (TLS is mandatory).",
      );
    }
  }
  if (db === "dynamodb" && !value.AWS_REGION) {
    throw new Error(
      "The DynamoDB adapter requires AWS_REGION (set STORAGE_DRIVER=aws or DB_DRIVER=aws).",
    );
  }
  if (media === "s3" && !value.S3_BUCKET) {
    throw new Error(
      "The S3 adapter requires S3_BUCKET (set STORAGE_DRIVER=aws or MEDIA_DRIVER=aws).",
    );
  }
  if (media === "s3" && !value.AWS_REGION) {
    throw new Error("The S3 adapter requires AWS_REGION.");
  }

  if (value.NODE_ENV === "production") {
    if (value.AUTH_SECRET === DEV_SECRET) {
      throw new Error("AUTH_SECRET must be set to a real secret in production.");
    }
    if (value.WISH_UNLOCK_SECRET === DEV_SECRET) {
      throw new Error(
        "WISH_UNLOCK_SECRET must be set to a real secret in production.",
      );
    }
    if (value.AUTH_MODE === "clerk" && !value.CLERK_SECRET_KEY) {
      throw new Error("AUTH_MODE=clerk requires CLERK_SECRET_KEY.");
    }
  }

  return value;
}

export type DbDriver = "file" | "postgres" | "dynamodb";
export type MediaDriver = "file" | "s3";

/**
 * Precedence: `DB_DRIVER`, then the deprecated `DATA_ADAPTER`, then the coarse
 * `STORAGE_DRIVER` (where `aws` means DynamoDB).
 */
export function dbDriver(value: AppEnv = env()): DbDriver {
  if (value.DB_DRIVER) return value.DB_DRIVER === "aws" ? "dynamodb" : value.DB_DRIVER;
  if (value.DATA_ADAPTER) return value.DATA_ADAPTER;
  return value.STORAGE_DRIVER === "aws" ? "dynamodb" : "file";
}

/** Same precedence for media: `MEDIA_DRIVER`, `MEDIA_ADAPTER`, `STORAGE_DRIVER`. */
export function mediaDriver(value: AppEnv = env()): MediaDriver {
  if (value.MEDIA_DRIVER) return value.MEDIA_DRIVER === "aws" ? "s3" : value.MEDIA_DRIVER;
  if (value.MEDIA_ADAPTER) return value.MEDIA_ADAPTER;
  return value.STORAGE_DRIVER === "aws" ? "s3" : "file";
}

/** The app always uses the pooled URL. */
export function databaseUrl(value: AppEnv = env()): string {
  const url = value.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required for the postgres driver.");
  return url;
}

export interface DynamoTables {
  wishes: string;
  contributions: string;
  replies: string;
}

export function dynamoTables(value: AppEnv = env()): DynamoTables {
  return {
    // DYNAMODB_TABLE is the legacy single-table name; honour it for wishes.
    wishes: value.DYNAMODB_TABLE ?? value.DYNAMODB_WISHES_TABLE,
    contributions: value.DYNAMODB_CONTRIBUTIONS_TABLE,
    replies: value.DYNAMODB_REPLIES_TABLE,
  };
}
