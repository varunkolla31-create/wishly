import "server-only";
import { mediaKindFromKey } from "@/lib/media/validate";
import type { Contribution } from "@/lib/repos/types";
import { mediaStore } from "@/lib/repos/index";

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

export async function toSenderContributions(
  items: Contribution[],
): Promise<SenderContribution[]> {
  const store = mediaStore();

  return Promise.all(
    items.map(async (item) => ({
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
            url: await store.createReadUrl(item.mediaKey),
            kind: mediaKindFromKey(item.mediaKey) ?? item.type,
          }
        : null,
    })),
  );
}
