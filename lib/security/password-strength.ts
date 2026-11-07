export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
  score: StrengthScore;
  label: string;
  hints: string[];
}

const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "123456",
  "12345678",
  "123456789",
  "qwerty",
  "qwerty123",
  "letmein",
  "welcome",
  "iloveyou",
  "admin",
  "wishly",
  "birthday",
]);

function isSequential(password: string): boolean {
  const lower = password.toLowerCase();
  return ["012345", "123456", "abcdef", "qwerty"].some((sequence) =>
    lower.includes(sequence),
  );
}

export function estimatePasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) {
    return { score: 0, label: "Add a password", hints: [] };
  }

  const hints: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else hints.push("Try at least 8 characters.");

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

  const lower = password.toLowerCase();
  if (
    COMMON_PASSWORDS.has(lower) ||
    isSequential(password) ||
    /^(.)\1+$/.test(password)
  ) {
    score = Math.min(score, 1);
    hints.unshift("That one is easy to guess.");
  }

  const clamped = Math.max(0, Math.min(4, score)) as StrengthScore;

  return {
    score: clamped,
    label: LABELS[clamped],
    hints: hints.slice(0, 2),
  };
}
