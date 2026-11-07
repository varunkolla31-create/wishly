export type TemplateStatKind = "like" | "share" | "use";

export interface TemplateStatCounts {
  likes: number;
  shares: number;
  uses: number;
}

export interface TemplateStats extends TemplateStatCounts {
  trending: number;
}

/** Spec: trending_score = likes*2 + shares*3 + uses*1 */
export const STAT_WEIGHTS = {
  like: 2,
  share: 3,
  use: 1,
} as const;

export function trendingScore({
  likes,
  shares,
  uses,
}: TemplateStatCounts): number {
  return (
    likes * STAT_WEIGHTS.like +
    shares * STAT_WEIGHTS.share +
    uses * STAT_WEIGHTS.use
  );
}

export function emptyStats(): TemplateStats {
  return { likes: 0, shares: 0, uses: 0, trending: 0 };
}

export type TemplateStatsMap = Record<string, TemplateStats>;
