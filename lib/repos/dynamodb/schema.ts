import "server-only";
import { DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { ddb } from "@/lib/repos/dynamodb/client";

export interface IndexInfo {
  name: string;
  hashKey: string;
  rangeKey: string | null;
}

export interface TableInfo {
  name: string;
  hashKey: string;
  rangeKey: string | null;
  indexes: IndexInfo[];
}

const cache = new Map<string, Promise<TableInfo>>();

/**
 * Describes a table once per process. The app does not assume the key names a
 * caller chose; if your table uses `id` instead of `wishId`, writes still land
 * on the right attribute.
 */
export function tableInfo(name: string): Promise<TableInfo> {
  const existing = cache.get(name);
  if (existing) return existing;

  const pending = describe(name);
  cache.set(name, pending);
  return pending;
}

async function describe(name: string): Promise<TableInfo> {
  const result = await ddb().send(new DescribeTableCommand({ TableName: name }));
  const table = result.Table;
  if (!table?.KeySchema) {
    throw new Error(`Table ${name} was not found or has no key schema.`);
  }

  const hash = table.KeySchema.find((key) => key.KeyType === "HASH");
  const range = table.KeySchema.find((key) => key.KeyType === "RANGE");
  if (!hash?.AttributeName) {
    throw new Error(`Table ${name} has no partition key.`);
  }

  return {
    name,
    hashKey: hash.AttributeName,
    rangeKey: range?.AttributeName ?? null,
    indexes: (table.GlobalSecondaryIndexes ?? [])
      .map((index) => {
        const hashKey = index.KeySchema?.find((key) => key.KeyType === "HASH");
        const rangeKey = index.KeySchema?.find((key) => key.KeyType === "RANGE");
        if (!index.IndexName || !hashKey?.AttributeName) return null;
        return {
          name: index.IndexName,
          hashKey: hashKey.AttributeName,
          rangeKey: rangeKey?.AttributeName ?? null,
        };
      })
      .filter((index): index is IndexInfo => index !== null),
  };
}

/** Finds any index whose partition key is the attribute we need. */
export function findIndexByHash(
  info: TableInfo,
  attribute: string,
): IndexInfo | null {
  return info.indexes.find((index) => index.hashKey === attribute) ?? null;
}

/**
 * Contributions and replies need two records per wish, which is impossible on
 * a hash-only table. Fail with the exact env var rather than silently losing
 * data.
 */
export function requireRangeKey(info: TableInfo, envVar: string): string {
  if (!info.rangeKey) {
    throw new Error(
      `Table ${info.name} has no sort key. Add one (for example contributionId) or point ${envVar} at a table that has one.`,
    );
  }
  return info.rangeKey;
}

const warned = new Set<string>();

/** Logs once per process, so a Scan fallback is visible without log spam. */
export function warnScanOnce(table: string, reason: string): void {
  const key = `${table}:${reason}`;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(
    `[dynamodb] ${table}: no index on ${reason}; falling back to Scan. Add a GSI to make this efficient.`,
  );
}
