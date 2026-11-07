import "server-only";
import { cookies } from "next/headers";
import type { Wish } from "@/lib/repos/types";
import {
  unlockCookieName,
  verifyUnlockToken,
} from "@/lib/security/unlock-token";

export async function hasUnlocked(wish: Wish): Promise<boolean> {
  const store = await cookies();
  const token = store.get(unlockCookieName(wish.wishId))?.value;
  if (!token) return false;

  return verifyUnlockToken(token, {
    wishId: wish.wishId,
    passwordVersion: wish.passwordVersion,
  });
}
