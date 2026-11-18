import "server-only";
import { mediaProxyUrl } from "@/lib/media/read-url";
import { mediaKindFromKey } from "@/lib/media/validate";
import type { Contribution } from "@/lib/repos/types";

export interface SenderContribution {
  contributionId: string;
  contributorName: string;
  type: Contribution["type"];
  status: Contribution["status"];
  order: number;
  text: string | null;
  createdAt: string;
  media: { key: string; url: string; kind: string } | null;
}

/**
 * Projects contributions for the sender's own dashboard. `passwordVersion` is
 * the wish's, so the preview links die with any password change, and they route
 * through /api/media rather than exposing storage URLs.
 */
export async function toSenderContributions(
  items: Contribution[],
  passwordVersion: number,
): Promise<SenderContribution[]> {
  return items.map((item) => ({
    contributionId: item.contributionId,
    contributorName: item.contributorName,
    type: item.type,
    status: item.status,
    order: item.order,
    text: item.text,
    createdAt: item.createdAt,
    media: item.mediaKey
      ? {
          key: item.mediaKey,
          url: mediaProxyUrl(item.mediaKey, passwordVersion),
          kind: mediaKindFromKey(item.mediaKey) ?? item.type,
        }
      : null,
  }));
}
