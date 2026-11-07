import { describe, expect, it } from "vitest";
import { formatRelative } from "@/lib/utils/format";

describe("formatRelative", () => {
  const now = new Date("2026-06-01T12:00:00.000Z").getTime();

  it("describes recent times in minutes and hours", () => {
    expect(formatRelative("2026-06-01T11:59:45.000Z", now)).toBe("just now");
    expect(formatRelative("2026-06-01T11:30:00.000Z", now)).toBe("30m ago");
    expect(formatRelative("2026-06-01T08:00:00.000Z", now)).toBe("4h ago");
  });

  it("describes this week in days", () => {
    expect(formatRelative("2026-05-29T12:00:00.000Z", now)).toBe("3d ago");
  });

  it("falls back to a short date after a week", () => {
    const formatted = formatRelative("2026-05-01T12:00:00.000Z", now);
    expect(formatted).toMatch(/1 May/);
  });

  it("returns an empty string for invalid dates", () => {
    expect(formatRelative("not-a-date", now)).toBe("");
  });
});
