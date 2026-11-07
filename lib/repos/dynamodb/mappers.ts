import "server-only";
import type { TableInfo } from "@/lib/repos/dynamodb/schema";
import type { Contribution, Reply, Wish } from "@/lib/repos/types";

/**
 * Removes the table's own key attributes, leaving the domain record. Index
 * attributes (ownerId, contributorToken, createdAt…) are real fields, so they
 * are kept.
 */
export function stripKeys(
  item: Record<string, unknown>,
  info: TableInfo,
): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item)) {
    if (key === info.hashKey || key === info.rangeKey) continue;
    record[key] = value;
  }
  return record;
}

export function toWish(item: Record<string, unknown>, info: TableInfo): Wish {
  return stripKeys(item, info) as unknown as Wish;
}

export function toContribution(
  item: Record<string, unknown>,
  info: TableInfo,
): Contribution {
  return stripKeys(item, info) as unknown as Contribution;
}

export function toReply(item: Record<string, unknown>, info: TableInfo): Reply {
  return stripKeys(item, info) as unknown as Reply;
}
