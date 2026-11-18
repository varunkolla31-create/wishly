/**
 * Password policy for new wishes. Deliberately dependency-free and free of
 * `server-only`, because the wizard, the strength meter and the route handler
 * all import it and must agree on the same answer.
 *
 * Unlock does NOT use this: a wish created before the 6-character floor must
 * still open with the password its sender chose.
 */

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 128;

/**
 * Tuned for this product rather than a generic dump: family words, the
 * festival and occasion vocabulary we ship copy for, and the passwords the
 * public demo wishes use — those are the first guesses a receiver's friend
 * would try.
 */
export const WEAK_PASSWORDS: ReadonlySet<string> = new Set([
  "amma",
  "appa",
  "ammi",
  "appa",
  "mummy",
  "papa",
  "always",
  "midnight",
  "forever",
  "loveyou",
  "iloveyou",
  "birthday",
  "happy",
  "wish",
  "wishly",
  "diwali",
  "pongal",
  "eid",
  "christmas",
  "holi",
  "password",
  "password1",
  "password123",
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "012345",
  "qwerty",
  "qwerty123",
  "letmein",
  "welcome",
  "admin",
  "secret",
]);

export type PasswordPolicyResult =
  | { ok: true }
  | { ok: false; message: string };

function normalise(password: string): string {
  return password.trim().toLowerCase();
}

/**
 * Repeating or sequential strings ("111111", "123456", "aaaaaa") clear the
 * length floor without adding any real entropy.
 */
export function isTriviallyGuessable(password: string): boolean {
  const value = normalise(password);
  if (value.length === 0) return false;
  if (/^(.)\1+$/.test(value)) return true;

  const ascending = "0123456789abcdefghijklmnopqrstuvwxyz";
  for (const run of [value, [...value].reverse().join("")]) {
    for (let start = 0; start + run.length <= ascending.length; start += 1) {
      if (ascending.slice(start, start + run.length) === run) return true;
    }
  }

  return false;
}

export function isWeakPassword(password: string): boolean {
  return WEAK_PASSWORDS.has(normalise(password)) || isTriviallyGuessable(password);
}

/** The server-side gate for a brand-new password. */
export function validateNewPassword(password: string): PasswordPolicyResult {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, message: "That password is too long." };
  }
  if (isWeakPassword(password)) {
    return {
      ok: false,
      message: "That one is easy to guess. Pick something only you two would know.",
    };
  }
  return { ok: true };
}

/**
 * A 4–6 digit PIN is still allowed (the wizard suggests one), so this is the
 * affordable check the UI runs while the creator types.
 */
export function isAcceptableNewPassword(password: string): boolean {
  return validateNewPassword(password).ok;
}
