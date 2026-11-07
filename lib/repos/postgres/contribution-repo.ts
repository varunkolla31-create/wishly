import "server-only";
import { query, withTransaction } from "@/lib/db/postgres";
import {
  toContribution,
  type ContributionRow,
} from "@/lib/repos/postgres/mappers";
import type {
  Contribution,
  ContributionRepo,
  ContributionStatus,
  NewContribution,
} from "@/lib/repos/types";
import { newId } from "@/lib/utils/ids";

export class PostgresContributionRepo implements ContributionRepo {
  async create(input: NewContribution): Promise<Contribution> {
    const { rows } = await query<ContributionRow>(
      `INSERT INTO contributions (
         wish_id, contribution_id, contributor_name, type, media_key, "text",
         status, sort_order
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         COALESCE((SELECT MAX(sort_order) + 1 FROM contributions WHERE wish_id = $1), 0)
       )
       RETURNING *`,
      [
        input.wishId,
        newId(),
        input.contributorName,
        input.type,
        input.mediaKey ?? null,
        input.text ?? null,
        input.status ?? "pending",
      ],
    );

    const row = rows[0];
    if (!row) throw new Error("Contribution insert returned no row.");
    return toContribution(row);
  }

  async getById(
    wishId: string,
    contributionId: string,
  ): Promise<Contribution | null> {
    const { rows } = await query<ContributionRow>(
      `SELECT * FROM contributions
       WHERE wish_id = $1 AND contribution_id = $2`,
      [wishId, contributionId],
    );
    return rows[0] ? toContribution(rows[0]) : null;
  }

  async listByWish(
    wishId: string,
    status?: ContributionStatus,
  ): Promise<Contribution[]> {
    const { rows } = status
      ? await query<ContributionRow>(
          `SELECT * FROM contributions
           WHERE wish_id = $1 AND status = $2
           ORDER BY sort_order ASC, created_at ASC`,
          [wishId, status],
        )
      : await query<ContributionRow>(
          `SELECT * FROM contributions
           WHERE wish_id = $1
           ORDER BY sort_order ASC, created_at ASC`,
          [wishId],
        );

    return rows.map(toContribution);
  }

  async updateStatus(
    wishId: string,
    contributionId: string,
    status: ContributionStatus,
  ): Promise<Contribution | null> {
    const { rows } = await query<ContributionRow>(
      `UPDATE contributions SET status = $3
       WHERE wish_id = $1 AND contribution_id = $2
       RETURNING *`,
      [wishId, contributionId, status],
    );
    return rows[0] ? toContribution(rows[0]) : null;
  }

  async reorder(wishId: string, orderedIds: string[]): Promise<void> {
    if (orderedIds.length === 0) return;

    await withTransaction(async (client) => {
      for (const [position, contributionId] of orderedIds.entries()) {
        await client.query(
          `UPDATE contributions SET sort_order = $3
           WHERE wish_id = $1 AND contribution_id = $2`,
          [wishId, contributionId, position],
        );
      }
    });
  }

  async delete(wishId: string, contributionId: string): Promise<boolean> {
    const { rowCount } = await query(
      `DELETE FROM contributions WHERE wish_id = $1 AND contribution_id = $2`,
      [wishId, contributionId],
    );
    return (rowCount ?? 0) > 0;
  }

  async deleteByWish(wishId: string): Promise<void> {
    await query(`DELETE FROM contributions WHERE wish_id = $1`, [wishId]);
  }
}
