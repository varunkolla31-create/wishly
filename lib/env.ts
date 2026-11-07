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

  DATA_ADAPTER: z.enum(["file", "dynamodb", "postgres"]).default("file"),
  MEDIA_ADAPTER: z.enum(["file", "s3"]).default("file"),

  DATABASE_URL: z.string().optional(),

  AWS_REGION: z.string().optional(),
  AWS_ENDPOINT_URL: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
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
    DATA_ADAPTER: process.env.DATA_ADAPTER,
    MEDIA_ADAPTER: process.env.MEDIA_ADAPTER,
    DATABASE_URL: process.env.DATABASE_URL,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ENDPOINT_URL: process.env.AWS_ENDPOINT_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
    S3_BUCKET: process.env.S3_BUCKET,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration — ${details}`);
  }

  const value = parsed.data;

  if (value.DATA_ADAPTER === "postgres" && !value.DATABASE_URL) {
    throw new Error("DATA_ADAPTER=postgres requires DATABASE_URL.");
  }
  if (value.DATA_ADAPTER === "dynamodb" && (!value.AWS_REGION || !value.DYNAMODB_TABLE)) {
    throw new Error(
      "DATA_ADAPTER=dynamodb requires AWS_REGION and DYNAMODB_TABLE.",
    );
  }
  if (value.MEDIA_ADAPTER === "s3" && (!value.AWS_REGION || !value.S3_BUCKET)) {
    throw new Error("MEDIA_ADAPTER=s3 requires AWS_REGION and S3_BUCKET.");
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
