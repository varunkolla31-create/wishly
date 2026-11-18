import "server-only";
import { cookies } from "next/headers";
import type { Wish } from "@/lib/repos/types";
import {
  unlockCookieName,
  verifyUnlockToken,
} from "@/lib/security/unlock-token";

/**
 * Reads a cookie value out of a plain `Request`. Route handlers get the
 * request as an argument, and reading from it directly (rather than through
 * `cookies()`) keeps the check usable outside Next's request scope, which is
 * what the media gate's tests rely on.
 */
function cookieFromRequest(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() !== name) continue;
    return decodeURIComponent(part.slice(index + 1).trim());
  }
  return null;
}

async function hasUnlockedViaCookies(wish: Wish): Promise<boolean> {
  const store = await cookies();
  const token = store.get(unlockCookieName(wish.wishId))?.value;
  if (!token) return false;

  return verifyUnlockToken(token, {
    wishId: wish.wishId,
    passwordVersion: wish.passwordVersion,
  });
}

/**
 * True when this visitor has unlocked this wish. Pass the incoming `Request`
 * from a route handler; omit it in server components, where `cookies()` works.
 */
export async function hasUnlocked(
  wish: Wish,
  request?: Request,
): Promise<boolean> {
  if (!request) return hasUnlockedViaCookies(wish);

  const token = cookieFromRequest(request, unlockCookieName(wish.wishId));
  if (!token) return false;

  return verifyUnlockToken(token, {
    wishId: wish.wishId,
    passwordVersion: wish.passwordVersion,
  });
}
