import "server-only";
import {
  trendingScore,
  type TemplateStatKind,
  type TemplateStats,
  type TemplateStatsMap,
} from "@/lib/catalog/ranking";
import { query } from "@/lib/db/postgres";
import { dbDriver } from "@/lib/env";

interface StatsRow {
  template_id: string;
  likes_count: number;
  shares_count: number;
  uses_count: number;
}

/** camelCase kind → column. Never interpolate anything outside this map. */
const COLUMNS: Record<TemplateStatKind, string> = {
  like: "likes_count",
  share: "shares_count",
  use: "uses_count",
};

function toStats(row: StatsRow): TemplateStats {
  const counts = {
    likes: row.likes_count,
    shares: row.shares_count,
    uses: row.uses_count,
  };
  return { ...counts, trending: trendingScore(counts) };
}

/**
 * Ephemeral fallback for the file/dynamo drivers and unit tests. Single-process
 * only; production runs DB_DRIVER=postgres.
 */
const memory = new Map<string, StatsRow>();

export async function listTemplateStats(): Promise<TemplateStatsMap> {
  if (dbDriver() !== "postgres") {
    const out: TemplateStatsMap = {};
    for (const [id, row] of memory) out[id] = toStats(row);
    return out;
  }

  const { rows } = await query<StatsRow>(
    `SELECT template_id, likes_count, shares_count, uses_count
     FROM video_template_stats`,
  );
  const out: TemplateStatsMap = {};
  for (const row of rows) out[row.template_id] = toStats(row);
  return out;
}

export async function incrementTemplateStat(
  templateId: string,
  kind: TemplateStatKind,
): Promise<TemplateStats> {
  if (dbDriver() !== "postgres") {
    const existing: StatsRow = memory.get(templateId) ?? {
      template_id: templateId,
      likes_count: 0,
      shares_count: 0,
      uses_count: 0,
    };
    if (kind === "like") existing.likes_count += 1;
    if (kind === "share") existing.shares_count += 1;
    if (kind === "use") existing.uses_count += 1;
    memory.set(templateId, existing);
    return toStats(existing);
  }

  const column = COLUMNS[kind];
  const { rows } = await query<StatsRow>(
    `INSERT INTO video_template_stats (template_id, ${column})
     VALUES ($1, 1)
     ON CONFLICT (template_id) DO UPDATE
       SET ${column} = video_template_stats.${column} + 1,
           updated_at = now()
     RETURNING template_id, likes_count, shares_count, uses_count`,
    [templateId],
  );

  const row = rows[0];
  if (!row) throw new Error("Template stat upsert returned no row.");
  return toStats(row);
}
