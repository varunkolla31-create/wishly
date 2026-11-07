import "server-only";
import {
  BatchWriteCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddb, tables } from "@/lib/repos/dynamodb/client";
import { toReply } from "@/lib/repos/dynamodb/mappers";
import { drain, keyedBy } from "@/lib/repos/dynamodb/pagination";
import {
  findIndexByHash,
  requireRangeKey,
  tableInfo,
  warnScanOnce,
  type TableInfo,
} from "@/lib/repos/dynamodb/schema";
import type { NewReply, Reply, ReplyRepo } from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

export class DynamoReplyRepo implements ReplyRepo {
  private info(): Promise<TableInfo> {
    return tableInfo(tables().replies);
  }

  private key(info: TableInfo, wishId: string, replyId: string) {
    const range = requireRangeKey(info, "DYNAMODB_REPLIES_TABLE");
    return { [info.hashKey]: wishId, [range]: replyId };
  }

  async create(input: NewReply): Promise<Reply> {
    const info = await this.info();
    const range = requireRangeKey(info, "DYNAMODB_REPLIES_TABLE");

    const reply: Reply = {
      wishId: input.wishId,
      replyId: newId(),
      ownerId: input.ownerId,
      message: input.message,
      emoji: input.emoji,
      createdAt: new Date().toISOString(),
    };

    await ddb().send(
      new PutCommand({
        TableName: info.name,
        Item: { ...reply, ...this.key(info, reply.wishId, reply.replyId) },
        ConditionExpression: "attribute_not_exists(#range)",
        ExpressionAttributeNames: { "#range": range },
      }),
    );

    return reply;
  }

  async listByWish(wishId: string): Promise<Reply[]> {
    const info = await this.info();

    let items: Record<string, unknown>[];
    if (keyedBy(info, "wishId")) {
      items = await drain(async (startKey) => {
        const result = await ddb().send(
          new QueryCommand({
            TableName: info.name,
            KeyConditionExpression: "#hash = :wish",
            ExpressionAttributeNames: { "#hash": info.hashKey },
            ExpressionAttributeValues: { ":wish": wishId },
            ExclusiveStartKey: startKey,
          }),
        );
        return { items: result.Items ?? [], lastKey: result.LastEvaluatedKey };
      });
    } else {
      warnScanOnce(info.name, "wishId");
      items = await drain(async (startKey) => {
        const result = await ddb().send(
          new ScanCommand({
            TableName: info.name,
            FilterExpression: "#wish = :wish",
            ExpressionAttributeNames: { "#wish": "wishId" },
            ExpressionAttributeValues: { ":wish": wishId },
            ExclusiveStartKey: startKey,
          }),
        );
        return { items: result.Items ?? [], lastKey: result.LastEvaluatedKey };
      });
    }

    return items
      .map((item) => toReply(item, info))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listByOwner(ownerId: string): Promise<Reply[]> {
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
      : await (async () => {
          warnScanOnce(info.name, "ownerId");
          return drain(async (startKey) => {
            const result = await ddb().send(
              new ScanCommand({
                TableName: info.name,
                FilterExpression: "#owner = :owner",
                ExpressionAttributeNames: { "#owner": "ownerId" },
                ExpressionAttributeValues: { ":owner": ownerId },
                ExclusiveStartKey: startKey,
              }),
            );
            return { items: result.Items ?? [], lastKey: result.LastEvaluatedKey };
          });
        })();

    return items
      .map((item) => toReply(item, info))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async deleteByWish(wishId: string): Promise<void> {
    const info = await this.info();
    const replies = await this.listByWish(wishId);

    for (let index = 0; index < replies.length; index += 25) {
      const chunk = replies.slice(index, index + 25);
      if (chunk.length === 0) continue;

      await ddb().send(
        new BatchWriteCommand({
          RequestItems: {
            [info.name]: chunk.map((reply) => ({
              DeleteRequest: { Key: this.key(info, reply.wishId, reply.replyId) },
            })),
          },
        }),
      );
    }
  }
}
