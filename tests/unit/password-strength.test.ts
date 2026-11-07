import { describe, expect, it } from "vitest";
import { estimatePasswordStrength } from "@/lib/security/password-strength";

describe("password strength", () => {
  it("asks for a password when empty", () => {
    const strength = estimatePasswordStrength("");
    expect(strength.score).toBe(0);
    expect(strength.label).toBe("Add a password");
  });

  it("floors common passwords", () => {
    const strength = estimatePasswordStrength("password1");
    expect(strength.score).toBeLessThanOrEqual(1);
    expect(strength.hints[0]).toMatch(/easy to guess/i);
  });

  it("floors sequential strings", () => {
    const strength = estimatePasswordStrength("abcdefgh");
    expect(strength.score).toBeLessThanOrEqual(1);
  });

  it("rewards a long mixed passphrase", () => {
    const strength = estimatePasswordStrength("Golden-Orchid-42!");
    expect(strength.score).toBe(4);
    expect(strength.label).toBe("Strong");
  });

  it("suggests the next useful improvement", () => {
    const strength = estimatePasswordStrength("lowercaseonly");
    expect(strength.hints.join(" ")).toMatch(/upper|number|symbol/i);
  });
});
