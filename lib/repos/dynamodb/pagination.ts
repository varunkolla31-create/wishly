import "server-only";
import type { TableInfo } from "@/lib/repos/dynamodb/schema";
import { MAX_PAGES } from "@/lib/repos/dynamodb/client";

export interface Page<T> {
  items: T[];
  lastKey?: Record<string, unknown>;
}

/**
 * Reads pages until exhausted or MAX_PAGES is hit. A shared cap keeps one
 * pathological table from turning a page render into an unbounded loop.
 */
export async function drain<T>(
  fetchPage: (startKey?: Record<string, unknown>) => Promise<Page<T>>,
): Promise<T[]> {
  const items: T[] = [];
  let startKey: Record<string, unknown> | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await fetchPage(startKey);
    items.push(...result.items);
    startKey = result.lastKey;
    if (!startKey) break;
  }

  return items;
}

export function isConditionalFailure(error: unknown): boolean {
  return (
    (error as { name?: string }).name === "ConditionalCheckFailedException"
  );
}

/** True when the table can answer a wish-scoped query without a Scan. */
export function keyedBy(info: TableInfo, attribute: string): boolean {
  return info.hashKey === attribute;
}
