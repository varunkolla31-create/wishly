import "server-only";
import {
  BatchWriteCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddb, keys, tableName } from "@/lib/repos/dynamodb/client";
import { toContribution } from "@/lib/repos/dynamodb/mappers";
import type {
  Contribution,
  ContributionRepo,
  ContributionStatus,
  NewContribution,
} from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

const CONTRIB_PREFIX = "CONTRIB#";

export class DynamoContributionRepo implements ContributionRepo {
  async create(input: NewContribution): Promise<Contribution> {
    const existing = await this.listByWish(input.wishId);
    const highest = existing.reduce((max, item) => Math.max(max, item.order), -1);

    const contribution: Contribution = {
      wishId: input.wishId,
      contributionId: newId(),
      contributorName: input.contributorName,
      type: input.type,
      mediaKey: input.mediaKey ?? null,
      text: input.text ?? null,
      status: input.status ?? "pending",
      order: highest + 1,
      createdAt: new Date().toISOString(),
    };

    await ddb().send(
      new PutCommand({
        TableName: tableName(),
        Item: {
          ...contribution,
          PK: keys.wishPk(contribution.wishId),
          SK: keys.contribution(contribution.contributionId),
        },
        ConditionExpression: "attribute_not_exists(PK)",
      }),
    );

    return contribution;
  }

  async getById(
    wishId: string,
    contributionId: string,
  ): Promise<Contribution | null> {
    const result = await ddb().send(
      new GetCommand({
        TableName: tableName(),
        Key: {
          PK: keys.wishPk(wishId),
          SK: keys.contribution(contributionId),
        },
      }),
    );
    return result.Item ? toContribution(result.Item) : null;
  }

  async listByWish(
    wishId: string,
    status?: ContributionStatus,
  ): Promise<Contribution[]> {
    const result = await ddb().send(
      new QueryCommand({
        TableName: tableName(),
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": keys.wishPk(wishId),
          ":prefix": CONTRIB_PREFIX,
        },
      }),
    );

    return (result.Items ?? [])
      .map(toContribution)
      .filter((item) => (status ? item.status === status : true))
      .sort((a, b) => a.order - b.order);
  }

  async updateStatus(
    wishId: string,
    contributionId: string,
    status: ContributionStatus,
  ): Promise<Contribution | null> {
    try {
      const result = await ddb().send(
        new UpdateCommand({
          TableName: tableName(),
          Key: {
            PK: keys.wishPk(wishId),
            SK: keys.contribution(contributionId),
          },
          UpdateExpression: "SET #status = :status",
          ConditionExpression: "attribute_exists(PK)",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: { ":status": status },
          ReturnValues: "ALL_NEW",
        }),
      );
      return result.Attributes ? toContribution(result.Attributes) : null;
    } catch (error) {
      if ((error as { name?: string }).name === "ConditionalCheckFailedException") {
        return null;
      }
      throw error;
    }
  }

  async reorder(wishId: string, orderedIds: string[]): Promise<void> {
    if (orderedIds.length === 0) return;

    await Promise.all(
      orderedIds.map((contributionId, position) =>
        ddb().send(
          new UpdateCommand({
            TableName: tableName(),
            Key: {
              PK: keys.wishPk(wishId),
              SK: keys.contribution(contributionId),
            },
            UpdateExpression: "SET #order = :order",
            ConditionExpression: "attribute_exists(PK)",
            ExpressionAttributeNames: { "#order": "order" },
            ExpressionAttributeValues: { ":order": position },
          }),
        ),
      ),
    );
  }

  async delete(wishId: string, contributionId: string): Promise<boolean> {
    const result = await ddb().send(
      new DeleteCommand({
        TableName: tableName(),
        Key: {
          PK: keys.wishPk(wishId),
          SK: keys.contribution(contributionId),
        },
        ReturnValues: "ALL_OLD",
      }),
    );
    return Boolean(result.Attributes);
  }

  async deleteByWish(wishId: string): Promise<void> {
    const items = await this.listByWish(wishId);
    await this.batchDelete(wishId, items.map((item) => item.contributionId));
  }

  private async batchDelete(wishId: string, ids: string[]): Promise<void> {
    for (let index = 0; index < ids.length; index += 25) {
      const chunk = ids.slice(index, index + 25);
      if (chunk.length === 0) continue;

      await ddb().send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName()]: chunk.map((contributionId) => ({
              DeleteRequest: {
                Key: {
                  PK: keys.wishPk(wishId),
                  SK: keys.contribution(contributionId),
                },
              },
            })),
          },
        }),
      );
    }
  }
}
