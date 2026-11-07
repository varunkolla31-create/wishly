import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { env } from "@/lib/env";

const ISSUER = "wishly";
const AUDIENCE = "wishly-unlock";

export const UNLOCK_TTL_SECONDS = 2 * 60 * 60;

function signingKey(): Uint8Array {
  return new TextEncoder().encode(env().WISH_UNLOCK_SECRET);
}

export function unlockCookieName(wishId: string): string {
  return `wishly_unlock_${wishId}`;
}

export interface UnlockTokenInput {
  wishId: string;
  passwordVersion: number;
}

export async function signUnlockToken(
  input: UnlockTokenInput,
): Promise<string> {
  return new SignJWT({ v: input.passwordVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.wishId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${UNLOCK_TTL_SECONDS}s`)
    .sign(signingKey());
}

export async function verifyUnlockToken(
  token: string,
  input: UnlockTokenInput,
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, signingKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload.sub === input.wishId && payload.v === input.passwordVersion;
  } catch {
    return false;
  }
}
