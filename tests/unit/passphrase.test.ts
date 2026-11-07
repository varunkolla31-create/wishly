import { describe, expect, it } from "vitest";
import { generatePassphrase } from "@/lib/utils/passphrase";

describe("generatePassphrase", () => {
  it("builds a readable three-word passphrase", () => {
    const passphrase = generatePassphrase();
    expect(passphrase).toMatch(/^[a-z]+-[a-z]+-[a-z]+-\d{2}$/);
    expect(passphrase.length).toBeGreaterThanOrEqual(14);
  });

  it("does not repeat the same value every call", () => {
    const values = new Set(
      Array.from({ length: 20 }, () => generatePassphrase()),
    );
    expect(values.size).toBeGreaterThan(1);
  });
});
