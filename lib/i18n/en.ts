/**
 * Flat English dictionary. Keys are dot-namespaced so a future locale file can
 * be checked against this shape at compile time (`Locale extends typeof en`).
 */
export const en = {
  "brand.tagline": "a wish they can unlock",
  "marketing.hero.title": "Some things deserve more than a message.",
  "marketing.hero.subtitle":
    "Create a password-protected page for any occasion. Send the link, share the password, and let them open it like a gift.",
  "marketing.hero.cta": "Start a wish",
  "marketing.hero.secondary": "See 3D reels",

  "lock.overline": "A wish for",
  "lock.heading": "Someone made something for you.",
  "lock.placeholder": "Enter the password",
  "lock.action": "Unlock",
  "lock.unlocking": "Unlocking…",
  "lock.hint": "Hint",
  "lock.opensIn": "Opens in",
  "lock.locked": "Locked",
  "lock.error.mismatch": "That password didn't match. Try again.",
  "lock.error.rateLimited": "Too many tries. Wait a moment, then try again.",
  "lock.error.notYet": "This wish still has a little time left.",
  "lock.error.generic": "Something went wrong. Try once more.",
  "lock.report": "Report this page",

  "reveal.overline": "A little something",
  "reveal.heading": "For {name}.",
  "reveal.subheading": "Wrapped, sealed, and waiting. There's no rush.",
  "reveal.action": "Unwrap it",
  "reveal.unwrapAlt": "Wrapped, sealed, and waiting.",
  "reveal.fromEveryone": "From everyone",
  "reveal.memoryTitle": "Their memories, together.",
  "reveal.replyTitle": "Send something back",
  "reveal.replyHint":
    "A thank-you, a reaction, anything. It goes to the person who made this.",
  "reveal.replyAction": "Send reply",
  "reveal.replySent": "Sent.",

  "common.madeWith": "Made with Wishly",
  "common.saved": "Saved",
  "common.saving": "Saving…",
  "common.continue": "Continue",
  "common.back": "Back",
} as const;

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;
