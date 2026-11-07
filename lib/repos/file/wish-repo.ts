import "server-only";
import type { JsonCollection } from "@/lib/storage/json-collection";
import type { NewWish, Wish, WishPatch, WishRepo } from "@/lib/repos/types";
import { tokensMatch } from "@/lib/security/contributor-token";
import { newId } from "@/lib/utils/ids";

export class FileWishRepo implements WishRepo {
  constructor(private readonly collection: JsonCollection<Wish>) {}

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
      bonusNote: null,
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

    await this.collection.mutate((items) => ({
      items: [...items, wish],
      result: wish,
    }));

    return wish;
  }

  async getById(wishId: string): Promise<Wish | null> {
    const items = await this.collection.read();
    return items.find((wish) => wish.wishId === wishId) ?? null;
  }

  async getByContributorToken(token: string): Promise<Wish | null> {
    const items = await this.collection.read();
    return (
      items.find(
        (wish) =>
          wish.contributorToken !== null &&
          wish.contributorTokenRevokedAt === null &&
          tokensMatch(wish.contributorToken, token),
      ) ?? null
    );
  }

  async listByOwner(ownerId: string): Promise<Wish[]> {
    const items = await this.collection.read();
    return items
      .filter((wish) => wish.ownerId === ownerId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      // Never hand a password hash back to a list view.
      .map((wish) => ({ ...wish, passwordHash: null }));
  }

  async update(wishId: string, patch: WishPatch): Promise<Wish | null> {
    return this.collection.mutate((items) => {
      const index = items.findIndex((wish) => wish.wishId === wishId);
      const current = index === -1 ? undefined : items[index];
      if (!current) return { items, result: null };

      const next: Wish = {
        ...current,
        ...patch,
        wishId: current.wishId,
        ownerId: current.ownerId,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
      };

      const copy = items.slice();
      copy[index] = next;
      return { items: copy, result: next };
    });
  }

  async delete(wishId: string): Promise<boolean> {
    return this.collection.mutate((items) => {
      const remaining = items.filter((wish) => wish.wishId !== wishId);
      return { items: remaining, result: remaining.length !== items.length };
    });
  }

  async incrementViews(wishId: string, by = 1): Promise<void> {
    const amount = Number.isFinite(by) ? Math.max(0, Math.trunc(by)) : 1;

    await this.collection.mutate((items) => {
      const index = items.findIndex((wish) => wish.wishId === wishId);
      const current = index === -1 ? undefined : items[index];
      if (!current) return { items, result: null };

      const copy = items.slice();
      copy[index] = { ...current, views: current.views + amount };
      return { items: copy, result: null };
    });
  }
}
