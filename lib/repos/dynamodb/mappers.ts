import "server-only";
import type { Contribution, Reply, Wish } from "@/lib/repos/types";

/** Internal row shapes: the domain record plus single-table keys. */
export type WishItem = Wish & {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI3PK?: string;
  GSI3SK?: string;
};

export type ContributionItem = Contribution & {
  PK: string;
  SK: string;
};

export type ReplyItem = Reply & {
  PK: string;
  SK: string;
  GSI2PK: string;
  GSI2SK: string;
};

const KEY_ATTRIBUTES = new Set([
  "PK",
  "SK",
  "GSI1PK",
  "GSI1SK",
  "GSI2PK",
  "GSI2SK",
  "GSI3PK",
  "GSI3SK",
]);

/** Strips every single-table key attribute, leaving the domain record. */
function stripKeys(item: Record<string, unknown>): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item)) {
    if (!KEY_ATTRIBUTES.has(key)) record[key] = value;
  }
  return record;
}

export function toWish(item: Record<string, unknown>): Wish {
  return stripKeys(item) as unknown as Wish;
}

export function toContribution(item: Record<string, unknown>): Contribution {
  return stripKeys(item) as unknown as Contribution;
}

export function toReply(item: Record<string, unknown>): Reply {
  return stripKeys(item) as unknown as Reply;
}
