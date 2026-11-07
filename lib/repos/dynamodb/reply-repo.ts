import "server-only";
import {
  BatchWriteCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddb, keys, tableName } from "@/lib/repos/dynamodb/client";
import { toReply } from "@/lib/repos/dynamodb/mappers";
import type { NewReply, Reply, ReplyRepo } from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

const REPLY_PREFIX = "REPLY#";

export class DynamoReplyRepo implements ReplyRepo {
  async create(input: NewReply): Promise<Reply> {
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
        TableName: tableName(),
        Item: {
          ...reply,
          PK: keys.wishPk(reply.wishId),
          SK: keys.reply(reply.replyId),
          GSI2PK: keys.ownerReplyGsi2Pk(reply.ownerId),
          GSI2SK: keys.replyGsi2Sk(reply.createdAt),
        },
        ConditionExpression: "attribute_not_exists(PK)",
      }),
    );

    return reply;
  }

  async listByWish(wishId: string): Promise<Reply[]> {
    const result = await ddb().send(
      new QueryCommand({
        TableName: tableName(),
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": keys.wishPk(wishId),
          ":prefix": REPLY_PREFIX,
        },
      }),
    );

    return (result.Items ?? [])
      .map(toReply)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listByOwner(ownerId: string): Promise<Reply[]> {
    const result = await ddb().send(
      new QueryCommand({
        TableName: tableName(),
        IndexName: "GSI2",
        KeyConditionExpression: "GSI2PK = :pk",
        ExpressionAttributeValues: { ":pk": keys.ownerReplyGsi2Pk(ownerId) },
        ScanIndexForward: false,
      }),
    );

    return (result.Items ?? []).map(toReply);
  }

  async deleteByWish(wishId: string): Promise<void> {
    const replies = await this.listByWish(wishId);

    for (let index = 0; index < replies.length; index += 25) {
      const chunk = replies.slice(index, index + 25);
      if (chunk.length === 0) continue;

      await ddb().send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName()]: chunk.map((reply) => ({
              DeleteRequest: {
                Key: {
                  PK: keys.wishPk(reply.wishId),
                  SK: keys.reply(reply.replyId),
                },
              },
            })),
          },
        }),
      );
    }
  }
}
