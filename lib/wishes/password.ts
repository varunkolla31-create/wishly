import "server-only";
import { wishRepo } from "@/lib/repos/index";
import type { Wish } from "@/lib/repos/types";
import { hashPassword } from "@/lib/security/password";
import { validateNewPassword } from "@/lib/security/password-policy";

export type SetPasswordResult =
  | { ok: true; wish: Wish }
  | { ok: false; message: string };

/**
 * Shared by the signed-in password route and anonymous publish. Bumps
 * `passwordVersion`, which retires every outstanding unlock cookie and media
 * link for this wish.
 */
export async function setWishPassword(
  wish: Wish,
  password: string,
  hint?: string | null,
): Promise<SetPasswordResult> {
  const policy = validateNewPassword(password);
  if (!policy.ok) return { ok: false, message: policy.message };

  const passwordHash = await hashPassword(password);
  const updated = await wishRepo().update(wish.wishId, {
    passwordHash,
    passwordHint: hint?.trim() ? hint.trim() : null,
    passwordVersion: wish.passwordVersion + 1,
  });

  if (!updated) {
    return { ok: false, message: "That wish could not be found." };
  }

  return { ok: true, wish: updated };
}
