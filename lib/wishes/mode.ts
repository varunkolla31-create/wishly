import "server-only";
import type { Wish, WishPatch } from "@/lib/repos/types";
import { newContributorToken } from "@/lib/security/contributor-token";

/**
 * Produces the patch needed to switch a wish between solo and group.
 *
 * Group mode mints a contributor token the first time and moves an unpublished
 * wish into `collecting` so the dashboard reads honestly. Switching back to solo
 * drops the token and returns an unpublished wish to `draft`. Published wishes
 * keep their status either way — they are already live behind a password.
 */
export function modeTransitionPatch(wish: Wish, mode: "solo" | "group"): WishPatch {
  if (mode === wish.mode) return {};

  if (mode === "group") {
    return {
      mode: "group",
      contributorToken: wish.contributorToken ?? newContributorToken(),
      contributorTokenRevokedAt: null,
      status: wish.status === "draft" ? "collecting" : wish.status,
    };
  }

  return {
    mode: "solo",
    contributorToken: null,
    contributorTokenRevokedAt: null,
    status:
      wish.status === "collecting" ? "draft" : wish.status,
  };
}
