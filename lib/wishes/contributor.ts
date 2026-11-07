import "server-only";
import { HttpError } from "@/lib/api/respond";
import { wishRepo } from "@/lib/repos/index";
import type { Wish } from "@/lib/repos/types";
import { isContributorToken } from "@/lib/security/contributor-token";

/** A published wish is finished collecting; anything earlier can still take entries. */
export function canAcceptContributions(wish: Wish): boolean {
  if (wish.mode !== "group") return false;
  if (wish.contributorToken === null) return false;
  if (wish.contributorTokenRevokedAt !== null) return false;
  return wish.status === "draft" || wish.status === "collecting";
}

/**
 * Resolves a contributor link token. Malformed tokens are rejected before any
 * lookup so a bad link costs no I/O and resolves to the same 404 as an unused one.
 */
export async function resolveContributorWish(token: string): Promise<Wish | null> {
  if (!isContributorToken(token)) return null;
  const wish = await wishRepo().getByContributorToken(token);
  if (!wish) return null;
  return canAcceptContributions(wish) ? wish : null;
}

export async function requireContributorWish(token: string): Promise<Wish> {
  const wish = await resolveContributorWish(token);
  if (!wish) {
    throw new HttpError(
      404,
      "not_found",
      "This link is closed. Ask the person who sent it for a new one.",
    );
  }
  return wish;
}
