import {
  MIN_PASSWORD_LENGTH,
  isWeakPassword,
} from "@/lib/security/password-policy";

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
  score: StrengthScore;
  label: string;
  hints: string[];
  /** False when the server would refuse this as a new password. */
  acceptable: boolean;
}

const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;

function isSequential(password: string): boolean {
  const lower = password.toLowerCase();
  return ["012345", "123456", "abcdef", "qwerty"].some((sequence) =>
    lower.includes(sequence),
  );
}

export function estimatePasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) {
    return {
      score: 0,
      label: "Add a password",
      hints: [],
      acceptable: false,
    };
  }

  const hints: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else if (password.length < MIN_PASSWORD_LENGTH) {
    hints.push(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
  } else {
    hints.push("Try at least 8 characters.");
  }

  if (password.length >= 12) score += 1;
  else if (password.length >= 8) hints.push("Twelve characters is safer.");

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (hasLower && hasUpper) score += 1;
  else hints.push("Mix upper and lower case letters.");

  if (hasDigit) score += 1;
  else hints.push("Add a number.");

  if (hasSymbol) score += 1;
  else hints.push("Add a symbol.");

  const weak = isWeakPassword(password) || isSequential(password);
  if (weak || /^(.)\1+$/.test(password)) {
    score = Math.min(score, 1);
    hints.unshift("That one is easy to guess.");
  }

  const clamped = Math.max(0, Math.min(4, score)) as StrengthScore;
  const acceptable =
    password.length >= MIN_PASSWORD_LENGTH && !weak;

  return {
    score: clamped,
    label: LABELS[clamped],
    hints: hints.slice(0, 2),
    acceptable,
  };
}
