import "server-only";
import { query } from "@/lib/db/postgres";
import { toWish, type WishRow } from "@/lib/repos/postgres/mappers";
import type { NewWish, Wish, WishPatch, WishRepo } from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

/** camelCase patch key → column name. Anything not listed is not patchable. */
const COLUMNS: Record<string, string> = {
  mode: "mode",
  category: "category",
  templateId: "template_id",
  receiverName: "receiver_name",
  title: "title",
  message: "message",
  mediaKeys: "media_keys",
  musicId: "music_id",
  passwordHash: "password_hash",
  passwordHint: "password_hint",
  passwordVersion: "password_version",
  unlockAt: "unlock_at",
  status: "status",
  contributorToken: "contributor_token",
  contributorTokenRevokedAt: "contributor_token_revoked_at",
};

/** media_keys is jsonb; pg would otherwise encode an array as a PG array. */
function encode(key: string, value: unknown): unknown {
  if (key === "mediaKeys" && Array.isArray(value)) return JSON.stringify(value);
  return value === undefined ? null : value;
}

export class PostgresWishRepo implements WishRepo {
  async create(input: NewWish): Promise<Wish> {
    const now = new Date().toISOString();
    const { rows } = await query<WishRow>(
      `INSERT INTO wishes (
         wish_id, owner_id, mode, category, template_id, receiver_name, title,
         created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8)
       RETURNING *`,
      [
        newId(),
        input.ownerId,
        input.mode ?? "solo",
        input.category,
        input.templateId,
        input.receiverName ?? "",
        input.title ?? "",
        now,
      ],
    );

    const row = rows[0];
    if (!row) throw new Error("Wish insert returned no row.");
    return toWish(row);
  }

  async getById(wishId: string): Promise<Wish | null> {
    const { rows } = await query<WishRow>(
      `SELECT * FROM wishes WHERE wish_id = $1`,
      [wishId],
    );
    return rows[0] ? toWish(rows[0]) : null;
  }

  async getByContributorToken(token: string): Promise<Wish | null> {
    const { rows } = await query<WishRow>(
      `SELECT * FROM wishes
       WHERE contributor_token = $1 AND contributor_token_revoked_at IS NULL`,
      [token],
    );
    return rows[0] ? toWish(rows[0]) : null;
  }

  async listByOwner(ownerId: string): Promise<Wish[]> {
    const { rows } = await query<WishRow>(
      `SELECT * FROM wishes WHERE owner_id = $1 ORDER BY updated_at DESC`,
      [ownerId],
    );
    // Never hand a password hash back to a list view.
    return rows.map((row) => ({ ...toWish(row), passwordHash: null }));
  }

  async update(wishId: string, patch: WishPatch): Promise<Wish | null> {
    const assignments: string[] = [];
    const values: unknown[] = [];

    for (const [key, column] of Object.entries(COLUMNS)) {
      if (!(key in patch)) continue;
      values.push(encode(key, (patch as Record<string, unknown>)[key]));
      assignments.push(`${column} = $${values.length}`);
    }

    values.push(wishId);
    const idParam = `$${values.length}`;

    const { rows } = await query<WishRow>(
      `UPDATE wishes
       SET ${[...assignments, "updated_at = now()"].join(", ")}
       WHERE wish_id = ${idParam}
       RETURNING *`,
      values,
    );

    return rows[0] ? toWish(rows[0]) : null;
  }

  async delete(wishId: string): Promise<boolean> {
    const { rowCount } = await query(
      `DELETE FROM wishes WHERE wish_id = $1`,
      [wishId],
    );
    return (rowCount ?? 0) > 0;
  }

  async incrementViews(wishId: string, by = 1): Promise<void> {
    const amount = Number.isFinite(by) ? Math.max(0, Math.trunc(by)) : 1;
    // Deliberately leaves updated_at alone so the dashboard order is stable.
    await query(`UPDATE wishes SET views = views + $2 WHERE wish_id = $1`, [
      wishId,
      amount,
    ]);
  }
}
