import "server-only";
import {
  BatchWriteCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddb, tables } from "@/lib/repos/dynamodb/client";
import { toContribution } from "@/lib/repos/dynamodb/mappers";
import {
  drain,
  isConditionalFailure,
  keyedBy,
} from "@/lib/repos/dynamodb/pagination";
import {
  requireRangeKey,
  tableInfo,
  warnScanOnce,
  type TableInfo,
} from "@/lib/repos/dynamodb/schema";
import type {
  Contribution,
  ContributionRepo,
  ContributionStatus,
  NewContribution,
} from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

export class DynamoContributionRepo implements ContributionRepo {
  private info(): Promise<TableInfo> {
    return tableInfo(tables().contributions);
  }

  private key(info: TableInfo, wishId: string, contributionId: string) {
    const range = requireRangeKey(info, "DYNAMODB_CONTRIBUTIONS_TABLE");
    return { [info.hashKey]: wishId, [range]: contributionId };
  }

  async create(input: NewContribution): Promise<Contribution> {
    const info = await this.info();
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

    const range = requireRangeKey(info, "DYNAMODB_CONTRIBUTIONS_TABLE");
    await ddb().send(
      new PutCommand({
        TableName: info.name,
        Item: { ...contribution, ...this.key(info, contribution.wishId, contribution.contributionId) },
        ConditionExpression: "attribute_not_exists(#range)",
        ExpressionAttributeNames: { "#range": range },
      }),
    );

    return contribution;
  }

  async getById(
    wishId: string,
    contributionId: string,
  ): Promise<Contribution | null> {
    const info = await this.info();
    const result = await ddb().send(
      new GetCommand({
        TableName: info.name,
        Key: this.key(info, wishId, contributionId),
      }),
    );
    return result.Item ? toContribution(result.Item, info) : null;
  }

  async listByWish(
    wishId: string,
    status?: ContributionStatus,
  ): Promise<Contribution[]> {
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
      .map((item) => toContribution(item, info))
      .filter((item) => (status ? item.status === status : true))
      .sort((a, b) => a.order - b.order);
  }

  async updateStatus(
    wishId: string,
    contributionId: string,
    status: ContributionStatus,
  ): Promise<Contribution | null> {
    const info = await this.info();
    const range = requireRangeKey(info, "DYNAMODB_CONTRIBUTIONS_TABLE");

    try {
      const result = await ddb().send(
        new UpdateCommand({
          TableName: info.name,
          Key: this.key(info, wishId, contributionId),
          UpdateExpression: "SET #status = :status",
          ConditionExpression: "attribute_exists(#range)",
          ExpressionAttributeNames: { "#status": "status", "#range": range },
          ExpressionAttributeValues: { ":status": status },
          ReturnValues: "ALL_NEW",
        }),
      );
      return result.Attributes ? toContribution(result.Attributes, info) : null;
    } catch (error) {
      if (isConditionalFailure(error)) return null;
      throw error;
    }
  }

  async reorder(wishId: string, orderedIds: string[]): Promise<void> {
    if (orderedIds.length === 0) return;
    const info = await this.info();
    const range = requireRangeKey(info, "DYNAMODB_CONTRIBUTIONS_TABLE");

    await Promise.all(
      orderedIds.map((contributionId, position) =>
        ddb().send(
          new UpdateCommand({
            TableName: info.name,
            Key: this.key(info, wishId, contributionId),
            UpdateExpression: "SET #order = :order",
            ConditionExpression: "attribute_exists(#range)",
            ExpressionAttributeNames: { "#order": "order", "#range": range },
            ExpressionAttributeValues: { ":order": position },
          }),
        ),
      ),
    );
  }

  async delete(wishId: string, contributionId: string): Promise<boolean> {
    const info = await this.info();
    const result = await ddb().send(
      new DeleteCommand({
        TableName: info.name,
        Key: this.key(info, wishId, contributionId),
        ReturnValues: "ALL_OLD",
      }),
    );
    return Boolean(result.Attributes);
  }

  async deleteByWish(wishId: string): Promise<void> {
    const info = await this.info();
    const items = await this.listByWish(wishId);

    for (let index = 0; index < items.length; index += 25) {
      const chunk = items.slice(index, index + 25);
      if (chunk.length === 0) continue;

      await ddb().send(
        new BatchWriteCommand({
          RequestItems: {
            [info.name]: chunk.map((item) => ({
              DeleteRequest: {
                Key: this.key(info, item.wishId, item.contributionId),
              },
            })),
          },
        }),
      );
    }
  }
}
