import "server-only";
import type { JsonCollection } from "@/lib/storage/json-collection";
import type { NewReply, Reply, ReplyRepo } from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

export class FileReplyRepo implements ReplyRepo {
  constructor(private readonly collection: JsonCollection<Reply>) {}

  async create(input: NewReply): Promise<Reply> {
    const reply: Reply = {
      wishId: input.wishId,
      replyId: newId(),
      ownerId: input.ownerId,
      message: input.message,
      emoji: input.emoji,
      createdAt: new Date().toISOString(),
    };

    await this.collection.mutate((items) => ({
      items: [...items, reply],
      result: null,
    }));

    return reply;
  }

  async listByWish(wishId: string): Promise<Reply[]> {
    const items = await this.collection.read();
    return items
      .filter((reply) => reply.wishId === wishId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listByOwner(ownerId: string): Promise<Reply[]> {
    const items = await this.collection.read();
    return items
      .filter((reply) => reply.ownerId === ownerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async deleteByWish(wishId: string): Promise<void> {
    await this.collection.mutate((items) => ({
      items: items.filter((reply) => reply.wishId !== wishId),
      result: null,
    }));
  }
}
