import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

export type MediaTokenAction = "put" | "get";

const TTL_SECONDS: Record<MediaTokenAction, number> = {
  put: 15 * 60,
  // Short enough that a copied read link dies quickly. The media route also
  // requires the wish's unlock cookie, so a link on its own is not enough.
  get: 15 * 60,
};

interface TokenPayload {
  key: string;
  action: MediaTokenAction;
  expiresAt: number;
  /** The wish's passwordVersion at mint time; a reset invalidates the link. */
  version: number;
}

function sign(payload: string): string {
  return createHmac("sha256", env().AUTH_SECRET)
    .update(payload)
    .digest("base64url");
}

function material(input: TokenPayload): string {
  return `${input.key}:${input.action}:${input.version}:${input.expiresAt}`;
}

export function signMediaToken(
  key: string,
  action: MediaTokenAction,
  now = Date.now(),
  version = 0,
): string {
  const expiresAt = Math.floor(now / 1000) + TTL_SECONDS[action];
  return `${expiresAt}.${version}.${sign(material({ key, action, expiresAt, version }))}`;
}

export interface MediaTokenCheck {
  valid: boolean;
  /** The version baked into the token, so the caller can compare with a cookie. */
  version: number | null;
}

export function inspectMediaToken(
  key: string,
  action: MediaTokenAction,
  token: string,
  now = Date.now(),
): MediaTokenCheck {
  const [expiresRaw, versionRaw, signature] = token.split(".");
  if (!expiresRaw || !versionRaw || !signature) {
    return { valid: false, version: null };
  }

  const expiresAt = Number(expiresRaw);
  const version = Number(versionRaw);
  if (
    !Number.isInteger(expiresAt) ||
    !Number.isInteger(version) ||
    expiresAt * 1000 < now
  ) {
    return { valid: false, version: null };
  }

  const expected = Buffer.from(
    sign(material({ key, action, expiresAt, version })),
  );
  const actual = Buffer.from(signature);
  const valid =
    expected.length === actual.length && timingSafeEqual(expected, actual);

  return valid ? { valid: true, version } : { valid: false, version: null };
}

export function verifyMediaToken(
  key: string,
  action: MediaTokenAction,
  token: string,
  now = Date.now(),
): boolean {
  return inspectMediaToken(key, action, token, now).valid;
}
