import { describe, expect, it } from "vitest";
import { emptyStats, STAT_WEIGHTS, trendingScore } from "@/lib/catalog/ranking";

describe("video template ranking", () => {
  it("uses the spec weights: likes 2, shares 3, uses 1", () => {
    expect(STAT_WEIGHTS).toEqual({ like: 2, share: 3, use: 1 });
    expect(trendingScore({ likes: 4, shares: 2, uses: 10 })).toBe(4 * 2 + 2 * 3 + 10);
  });

  it("starts at zero", () => {
    expect(emptyStats()).toEqual({ likes: 0, shares: 0, uses: 0, trending: 0 });
  });

  it("ranks shares above likes and likes above uses", () => {
    const oneLike = trendingScore({ likes: 1, shares: 0, uses: 0 });
    const oneShare = trendingScore({ likes: 0, shares: 1, uses: 0 });
    const oneUse = trendingScore({ likes: 0, shares: 0, uses: 1 });

    expect(oneShare).toBeGreaterThan(oneLike);
    expect(oneLike).toBeGreaterThan(oneUse);
  });
});
