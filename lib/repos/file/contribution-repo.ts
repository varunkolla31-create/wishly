import "server-only";
import type { JsonCollection } from "@/lib/storage/json-collection";
import type {
  Contribution,
  ContributionRepo,
  ContributionStatus,
  NewContribution,
} from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

export class FileContributionRepo implements ContributionRepo {
  constructor(private readonly collection: JsonCollection<Contribution>) {}

  async create(input: NewContribution): Promise<Contribution> {
    const contribution: Contribution = {
      wishId: input.wishId,
      contributionId: newId(),
      contributorName: input.contributorName,
      type: input.type,
      mediaKey: input.mediaKey ?? null,
      text: input.text ?? null,
      status: input.status ?? "pending",
      order: 0,
      createdAt: new Date().toISOString(),
    };

    await this.collection.mutate((items) => {
      const highest = items
        .filter((item) => item.wishId === input.wishId)
        .reduce((max, item) => Math.max(max, item.order), -1);
      contribution.order = highest + 1;
      return { items: [...items, contribution], result: null };
    });

    return contribution;
  }

  async getById(
    wishId: string,
    contributionId: string,
  ): Promise<Contribution | null> {
    const items = await this.collection.read();
    return (
      items.find(
        (item) =>
          item.wishId === wishId && item.contributionId === contributionId,
      ) ?? null
    );
  }

  async listByWish(
    wishId: string,
    status?: ContributionStatus,
  ): Promise<Contribution[]> {
    const items = await this.collection.read();
    return items
      .filter((item) => item.wishId === wishId)
      .filter((item) => (status ? item.status === status : true))
      .sort((a, b) => a.order - b.order);
  }

  async updateStatus(
    wishId: string,
    contributionId: string,
    status: ContributionStatus,
  ): Promise<Contribution | null> {
    return this.collection.mutate((items) => {
      const index = items.findIndex(
        (item) =>
          item.wishId === wishId && item.contributionId === contributionId,
      );
      const current = index === -1 ? undefined : items[index];
      if (!current) return { items, result: null };

      const next = { ...current, status };
      const copy = items.slice();
      copy[index] = next;
      return { items: copy, result: next };
    });
  }

  async reorder(wishId: string, orderedIds: string[]): Promise<void> {
    await this.collection.mutate((items) => {
      const positions = new Map(
        orderedIds.map((id, position) => [id, position]),
      );
      return {
        items: items.map((item) =>
          item.wishId === wishId && positions.has(item.contributionId)
            ? { ...item, order: positions.get(item.contributionId) ?? item.order }
            : item,
        ),
        result: null,
      };
    });
  }

  async delete(wishId: string, contributionId: string): Promise<boolean> {
    return this.collection.mutate((items) => {
      const remaining = items.filter(
        (item) =>
          !(item.wishId === wishId && item.contributionId === contributionId),
      );
      return { items: remaining, result: remaining.length !== items.length };
    });
  }

  async deleteByWish(wishId: string): Promise<void> {
    await this.collection.mutate((items) => ({
      items: items.filter((item) => item.wishId !== wishId),
      result: null,
    }));
  }
}
