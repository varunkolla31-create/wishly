import "server-only";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddb, tables } from "@/lib/repos/dynamodb/client";
import { toWish } from "@/lib/repos/dynamodb/mappers";
import { drain, isConditionalFailure } from "@/lib/repos/dynamodb/pagination";
import {
  findIndexByHash,
  tableInfo,
  warnScanOnce,
  type TableInfo,
} from "@/lib/repos/dynamodb/schema";
import type { NewWish, Wish, WishPatch, WishRepo } from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

/** Every field a caller may write through `update`. */
const PATCHABLE = [
  "mode",
  "category",
  "templateId",
  "receiverName",
  "title",
  "message",
  "mediaKeys",
  "musicId",
  "passwordHash",
  "passwordHint",
  "passwordVersion",
  "unlockAt",
  "status",
  "contributorToken",
  "contributorTokenRevokedAt",
] as const satisfies readonly (keyof WishPatch)[];

function toItem(wish: Wish, info: TableInfo): Record<string, unknown> {
  return { ...wish, [info.hashKey]: wish.wishId };
}

export class DynamoWishRepo implements WishRepo {
  private info(): Promise<TableInfo> {
    return tableInfo(tables().wishes);
  }

  async create(input: NewWish): Promise<Wish> {
    const now = new Date().toISOString();
    const wish: Wish = {
      wishId: newId(),
      ownerId: input.ownerId,
      mode: input.mode ?? "solo",
      category: input.category,
      templateId: input.templateId,
      receiverName: input.receiverName ?? "",
      title: input.title ?? "",
      message: "",
      mediaKeys: [],
      musicId: null,
      passwordHash: null,
      passwordHint: null,
      passwordVersion: 1,
      unlockAt: null,
      status: "draft",
      contributorToken: null,
      contributorTokenRevokedAt: null,
      views: 0,
      createdAt: now,
      updatedAt: now,
    };

    const info = await this.info();
    await ddb().send(
      new PutCommand({
        TableName: info.name,
        Item: toItem(wish, info),
        ConditionExpression: "attribute_not_exists(#hash)",
        ExpressionAttributeNames: { "#hash": info.hashKey },
      }),
    );

    return wish;
  }

  async getById(wishId: string): Promise<Wish | null> {
    const info = await this.info();
    const result = await ddb().send(
      new GetCommand({
        TableName: info.name,
        Key: { [info.hashKey]: wishId },
      }),
    );
    return result.Item ? toWish(result.Item, info) : null;
  }

  async getByContributorToken(token: string): Promise<Wish | null> {
    const info = await this.info();
    const index = findIndexByHash(info, "contributorToken");

    const items = index
      ? await drain(async (startKey) => {
          const result = await ddb().send(
            new QueryCommand({
              TableName: info.name,
              IndexName: index.name,
              KeyConditionExpression: "#token = :token",
              ExpressionAttributeNames: { "#token": index.hashKey },
              ExpressionAttributeValues: { ":token": token },
              ExclusiveStartKey: startKey,
              Limit: 20,
            }),
          );
          return { items: result.Items ?? [], lastKey: result.LastEvaluatedKey };
        })
      : await this.scanBy(info, "contributorToken", token);

    const wish = items
      .map((item) => toWish(item, info))
      .find(
        (candidate) =>
          candidate.contributorToken === token &&
          candidate.contributorTokenRevokedAt === null,
      );

    return wish ?? null;
  }

  async listByOwner(ownerId: string): Promise<Wish[]> {
    const info = await this.info();
    const index = findIndexByHash(info, "ownerId");

    const items = index
      ? await drain(async (startKey) => {
          const result = await ddb().send(
            new QueryCommand({
              TableName: info.name,
              IndexName: index.name,
              KeyConditionExpression: "#owner = :owner",
              ExpressionAttributeNames: { "#owner": index.hashKey },
              ExpressionAttributeValues: { ":owner": ownerId },
              ExclusiveStartKey: startKey,
            }),
          );
          return { items: result.Items ?? [], lastKey: result.LastEvaluatedKey };
        })
      : await this.scanBy(info, "ownerId", ownerId);

    // Lists never carry the password hash, and are newest-updated first.
    return items
      .map((item) => ({ ...toWish(item, info), passwordHash: null }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async update(wishId: string, patch: WishPatch): Promise<Wish | null> {
    const info = await this.info();
    const names: Record<string, string> = { "#hash": info.hashKey };
    const values: Record<string, unknown> = {};
    const sets: string[] = [];
    const removes: string[] = [];

    for (const field of PATCHABLE) {
      if (!(field in patch)) continue;
      const value = (patch as Record<string, unknown>)[field];
      const placeholder = `#f_${field}`;
      names[placeholder] = field;

      if (value === null || value === undefined) {
        removes.push(placeholder);
      } else {
        sets.push(`${placeholder} = :${field}`);
        values[`:${field}`] = value;
      }
    }

    const now = new Date().toISOString();
    names["#updatedAt"] = "updatedAt";
    sets.push("#updatedAt = :updatedAt");
    values[":updatedAt"] = now;
    values[":hash"] = wishId;

    const expression = [
      sets.length ? `SET ${sets.join(", ")}` : "",
      removes.length ? `REMOVE ${removes.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    try {
      const result = await ddb().send(
        new UpdateCommand({
          TableName: info.name,
          Key: { [info.hashKey]: wishId },
          UpdateExpression: expression,
          ConditionExpression: "attribute_exists(#hash)",
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
          ReturnValues: "ALL_NEW",
        }),
      );
      return result.Attributes ? toWish(result.Attributes, info) : null;
    } catch (error) {
      if (isConditionalFailure(error)) return null;
      throw error;
    }
  }

  async delete(wishId: string): Promise<boolean> {
    const info = await this.info();
    const result = await ddb().send(
      new DeleteCommand({
        TableName: info.name,
        Key: { [info.hashKey]: wishId },
        ReturnValues: "ALL_OLD",
      }),
    );
    return Boolean(result.Attributes);
  }

  async incrementViews(wishId: string, by = 1): Promise<void> {
    const info = await this.info();
    const amount = Number.isFinite(by) ? Math.max(0, Math.trunc(by)) : 1;

    try {
      await ddb().send(
        new UpdateCommand({
          TableName: info.name,
          Key: { [info.hashKey]: wishId },
          // Deliberately does not touch updatedAt.
          UpdateExpression: "ADD #views :amount",
          ConditionExpression: "attribute_exists(#hash)",
          ExpressionAttributeNames: {
            "#views": "views",
            "#hash": info.hashKey,
          },
          ExpressionAttributeValues: { ":amount": amount },
        }),
      );
    } catch (error) {
      if (!isConditionalFailure(error)) throw error;
    }
  }

  private async scanBy(
    info: TableInfo,
    attribute: string,
    value: string,
  ): Promise<Record<string, unknown>[]> {
    warnScanOnce(info.name, `"${attribute}"`);
    return drain(async (startKey) => {
      const result = await ddb().send(
        new ScanCommand({
          TableName: info.name,
          FilterExpression: "#attr = :value",
          ExpressionAttributeNames: { "#attr": attribute },
          ExpressionAttributeValues: { ":value": value },
          ExclusiveStartKey: startKey,
        }),
      );
      return { items: result.Items ?? [], lastKey: result.LastEvaluatedKey };
    });
  }
}
