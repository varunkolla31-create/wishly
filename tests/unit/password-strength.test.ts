import { describe, expect, it } from "vitest";
import {
  isAcceptableNewPassword,
  isTriviallyGuessable,
  isWeakPassword,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from "@/lib/security/password-policy";
import { estimatePasswordStrength } from "@/lib/security/password-strength";

describe("password policy", () => {
  it("requires the minimum length", () => {
    const result = validateNewPassword("a".repeat(MIN_PASSWORD_LENGTH - 1));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/at least/i);
  });

  it("accepts a passphrase at the floor", () => {
    expect(validateNewPassword("gold44").ok).toBe(true);
  });

  it("keeps a six digit PIN working", () => {
    expect(isAcceptableNewPassword("483920")).toBe(true);
  });

  it("rejects the words the demos use", () => {
    for (const weak of ["amma", "midnight", "always"]) {
      expect(isWeakPassword(weak)).toBe(true);
    }
    // "midnight" would pass a naive length check on its own.
    expect(validateNewPassword("midnight").ok).toBe(false);
  });

  it("rejects festival and family vocabulary", () => {
    for (const weak of ["diwali", "pongal", "mummy", "birthday"]) {
      expect(isWeakPassword(weak)).toBe(true);
    }
  });

  it("is case and whitespace insensitive", () => {
    expect(isWeakPassword("  AMma ")).toBe(true);
    expect(isWeakPassword("MidNight")).toBe(true);
  });

  it("flags repeats and runs without calling them weak words", () => {
    expect(isTriviallyGuessable("111111")).toBe(true);
    expect(isTriviallyGuessable("abcdef")).toBe(true);
    expect(isTriviallyGuessable("cba987")).toBe(true);
    expect(isWeakPassword("cba987")).toBe(true);
  });

  it("does not flag a normal passphrase as trivial", () => {
    expect(isTriviallyGuessable("gold44")).toBe(false);
    expect(isWeakPassword("gold44")).toBe(false);
  });

  it("enforces the maximum length", () => {
    const long = "x".repeat(MAX_PASSWORD_LENGTH + 1);
    expect(validateNewPassword(long).ok).toBe(false);
  });
});

describe("strength meter", () => {
  it("asks for a password when empty", () => {
    const strength = estimatePasswordStrength("");
    expect(strength.score).toBe(0);
    expect(strength.label).toBe("Add a password");
    expect(strength.acceptable).toBe(false);
  });

  it("floors weak words and reports them as unacceptable", () => {
    const strength = estimatePasswordStrength("midnight");
    expect(strength.score).toBeLessThanOrEqual(1);
    expect(strength.acceptable).toBe(false);
    expect(strength.hints[0]).toMatch(/easy to guess/i);
  });

  it("rewards a long mixed passphrase", () => {
    const strength = estimatePasswordStrength("Golden-Orchid-42!");
    expect(strength.score).toBe(4);
    expect(strength.label).toBe("Strong");
    expect(strength.acceptable).toBe(true);
  });

  it("accepts a generated passphrase", () => {
    const strength = estimatePasswordStrength("willow-plum-ember-42");
    expect(strength.acceptable).toBe(true);
  });

  it("suggests the next useful improvement", () => {
    const strength = estimatePasswordStrength("lowercaseonly");
    expect(strength.hints.join(" ")).toMatch(/upper|number|symbol/i);
  });
});
