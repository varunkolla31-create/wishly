import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

export type MediaTokenAction = "put" | "get";

const TTL_SECONDS: Record<MediaTokenAction, number> = {
  put: 15 * 60,
  get: 60 * 60,
};

function sign(payload: string): string {
  return createHmac("sha256", env().AUTH_SECRET)
    .update(payload)
    .digest("base64url");
}

export function signMediaToken(
  key: string,
  action: MediaTokenAction,
  now = Date.now(),
): string {
  const expiresAt = Math.floor(now / 1000) + TTL_SECONDS[action];
  return `${expiresAt}.${sign(`${key}:${action}:${expiresAt}`)}`;
}

export function verifyMediaToken(
  key: string,
  action: MediaTokenAction,
  token: string,
  now = Date.now(),
): boolean {
  const [expiresRaw, signature] = token.split(".");
  if (!expiresRaw || !signature) return false;

  const expiresAt = Number(expiresRaw);
  if (!Number.isInteger(expiresAt) || expiresAt * 1000 < now) return false;

  const expected = Buffer.from(sign(`${key}:${action}:${expiresAt}`));
  const actual = Buffer.from(signature);
  return (
    expected.length === actual.length && timingSafeEqual(expected, actual)
  );
}
