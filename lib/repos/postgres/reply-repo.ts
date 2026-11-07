import "server-only";
import { query } from "@/lib/db/postgres";
import { toReply, type ReplyRow } from "@/lib/repos/postgres/mappers";
import type { NewReply, Reply, ReplyRepo } from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

export class PostgresReplyRepo implements ReplyRepo {
  async create(input: NewReply): Promise<Reply> {
    const { rows } = await query<ReplyRow>(
      `INSERT INTO replies (wish_id, reply_id, owner_id, message, emoji)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.wishId, newId(), input.ownerId, input.message, input.emoji],
    );

    const row = rows[0];
    if (!row) throw new Error("Reply insert returned no row.");
    return toReply(row);
  }

  async listByWish(wishId: string): Promise<Reply[]> {
    const { rows } = await query<ReplyRow>(
      `SELECT * FROM replies WHERE wish_id = $1 ORDER BY created_at ASC`,
      [wishId],
    );
    return rows.map(toReply);
  }

  async listByOwner(ownerId: string): Promise<Reply[]> {
    const { rows } = await query<ReplyRow>(
      `SELECT * FROM replies WHERE owner_id = $1 ORDER BY created_at DESC`,
      [ownerId],
    );
    return rows.map(toReply);
  }

  async deleteByWish(wishId: string): Promise<void> {
    await query(`DELETE FROM replies WHERE wish_id = $1`, [wishId]);
  }
}
