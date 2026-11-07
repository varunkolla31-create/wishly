import "server-only";
import { GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, keys, tableName } from "@/lib/repos/dynamodb/client";
import { toWish } from "@/lib/repos/dynamodb/mappers";
import type { NewWish, Wish, WishPatch, WishRepo } from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

/** Fields that may be written through `update`, with their storage attribute. */
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

export class DynamoWishRepo implements WishRepo {
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

    const item: Record<string, unknown> = {
      ...wish,
      PK: keys.wishPk(wish.wishId),
      SK: keys.meta(),
      GSI1PK: keys.ownerGsi1Pk(wish.ownerId),
      GSI1SK: keys.ownerUpdatedGsi1Sk(wish.updatedAt),
    };

    if (wish.contributorToken && !wish.contributorTokenRevokedAt) {
      item.GSI3PK = keys.tokenGsi3Pk(wish.contributorToken);
      item.GSI3SK = keys.metaGsi3Sk();
    }

    await ddb().send(
      new PutCommand({
        TableName: tableName(),
        Item: item,
        ConditionExpression: "attribute_not_exists(PK)",
      }),
    );

    return wish;
  }

  async getById(wishId: string): Promise<Wish | null> {
    const result = await ddb().send(
      new GetCommand({
        TableName: tableName(),
        Key: { PK: keys.wishPk(wishId), SK: keys.meta() },
      }),
    );
    return result.Item ? toWish(result.Item) : null;
  }

  async getByContributorToken(token: string): Promise<Wish | null> {
    const result = await ddb().send(
      new QueryCommand({
        TableName: tableName(),
        IndexName: "GSI3",
        KeyConditionExpression: "GSI3PK = :pk",
        ExpressionAttributeValues: { ":pk": keys.tokenGsi3Pk(token) },
        Limit: 1,
      }),
    );

    const item = result.Items?.[0];
    if (!item) return null;

    const wish = toWish(item);
    // The index entry is removed on revoke, but guard anyway.
    if (wish.contributorToken !== token || wish.contributorTokenRevokedAt) {
      return null;
    }
    return wish;
  }

  async listByOwner(ownerId: string): Promise<Wish[]> {
    const result = await ddb().send(
      new QueryCommand({
        TableName: tableName(),
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk",
        ExpressionAttributeValues: { ":pk": keys.ownerGsi1Pk(ownerId) },
        ScanIndexForward: false,
      }),
    );

    // Never project the password hash into list results.
    return (result.Items ?? []).map((item) => {
      const wish = toWish(item);
      return { ...wish, passwordHash: null };
    });
  }

  async update(wishId: string, patch: WishPatch): Promise<Wish | null> {
    const sets = new Map<string, string>();
    const removals = new Set<string>();
    const names: Record<string, string> = {};
    const values: Record<string, unknown> = {};

    const name = (field: string) => {
      names[`#${field}`] = field;
      return `#${field}`;
    };

    for (const field of PATCHABLE) {
      if (!(field in patch)) continue;
      const value = patch[field];
      const attr = name(field);

      if (value === null || value === undefined) {
        removals.add(attr);
        sets.delete(attr);
      } else {
        values[`:${field}`] = value;
        sets.set(attr, `:${field}`);
        removals.delete(attr);
      }
    }

    // Keep the contributor-token index in sync with the stored token.
    const token = patch.contributorToken;
    const revokedAt = patch.contributorTokenRevokedAt;

    names["#GSI3PK"] = "GSI3PK";
    names["#GSI3SK"] = "GSI3SK";

    if (typeof token === "string" && token.length > 0 && !revokedAt) {
      values[":gsi3pk"] = keys.tokenGsi3Pk(token);
      values[":gsi3sk"] = keys.metaGsi3Sk();
      sets.set("#GSI3PK", ":gsi3pk");
      sets.set("#GSI3SK", ":gsi3sk");
      removals.delete("#GSI3PK");
      removals.delete("#GSI3SK");
    } else if ("contributorToken" in patch || "contributorTokenRevokedAt" in patch) {
      sets.delete("#GSI3PK");
      sets.delete("#GSI3SK");
      removals.add("#GSI3PK");
      removals.add("#GSI3SK");
    }

    const now = new Date().toISOString();
    names["#updatedAt"] = "updatedAt";
    names["#GSI1SK"] = "GSI1SK";
    values[":updatedAt"] = now;
    values[":gsi1sk"] = keys.ownerUpdatedGsi1Sk(now);
    sets.set("#updatedAt", ":updatedAt");
    sets.set("#GSI1SK", ":gsi1sk");

    const expression = [
      sets.size ? `SET ${[...sets].map(([attr, value]) => `${attr} = ${value}`).join(", ")}` : "",
      removals.size ? `REMOVE ${[...removals].join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    try {
      const result = await ddb().send(
        new UpdateCommand({
          TableName: tableName(),
          Key: { PK: keys.wishPk(wishId), SK: keys.meta() },
          UpdateExpression: expression,
          ConditionExpression: "attribute_exists(PK)",
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
          ReturnValues: "ALL_NEW",
        }),
      );
      return result.Attributes ? toWish(result.Attributes) : null;
    } catch (error) {
      if ((error as { name?: string }).name === "ConditionalCheckFailedException") {
        return null;
      }
      throw error;
    }
  }

  async delete(wishId: string): Promise<boolean> {
    const result = await ddb().send(
      new DeleteCommand({
        TableName: tableName(),
        Key: { PK: keys.wishPk(wishId), SK: keys.meta() },
        ReturnValues: "ALL_OLD",
      }),
    );
    return Boolean(result.Attributes);
  }

  async incrementViews(wishId: string, by = 1): Promise<void> {
    const amount = Number.isFinite(by) ? Math.max(0, Math.trunc(by)) : 1;

    await ddb().send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { PK: keys.wishPk(wishId), SK: keys.meta() },
        // Deliberately does not touch updatedAt or GSI1SK.
        UpdateExpression: "ADD #views :amount",
        ConditionExpression: "attribute_exists(PK)",
        ExpressionAttributeNames: { "#views": "views" },
        ExpressionAttributeValues: { ":amount": amount },
      }),
    );
  }
}
