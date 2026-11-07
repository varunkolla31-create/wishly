import { en, type Dictionary, type TranslationKey } from "@/lib/i18n/en";

export const DEFAULT_LOCALE = "en";

export type Locale = typeof DEFAULT_LOCALE;

/** Registered dictionaries. Adding a locale means adding one entry here. */
const DICTIONARIES: Record<string, Dictionary> = { en };

export function locale(): string {
  const configured = process.env.NEXT_PUBLIC_LOCALE?.trim();
  return configured && configured in DICTIONARIES
    ? configured
    : DEFAULT_LOCALE;
}

/**
 * Looks up a string and fills `{placeholders}`. Unknown keys fall back to the
 * English dictionary and then to the key itself, so a missing translation is
 * visible in development without throwing in production.
 */
export function t(
  key: TranslationKey,
  values?: Record<string, string | number>,
  current: string = locale(),
): string {
  const dictionary = DICTIONARIES[current] ?? en;
  const template = dictionary[key] ?? en[key] ?? key;

  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}

export type { TranslationKey };
