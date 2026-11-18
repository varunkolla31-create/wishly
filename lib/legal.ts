import { contactEmail, grievanceEmail, siteUrl } from "@/lib/config-public";

/**
 * Legal copy placeholders.
 *
 * Nothing here is invented: if a value is not configured the page renders a
 * clearly marked placeholder ({{LEGAL_ENTITY}}, {{CONTACT_EMAIL}}, …) rather
 * than a plausible-looking fake. That placeholder is a build-time reminder to
 * fill the real value in before launch, and it should never ship to users.
 */

export const LEGAL_PLACEHOLDERS = [
  "{{LEGAL_ENTITY}}",
  "{{REGISTERED_ADDRESS}}",
  "{{CONTACT_EMAIL}}",
  "{{GRIEVANCE_EMAIL}}",
  "{{SITE_URL}}",
  "{{EFFECTIVE_DATE}}",
] as const;

export type LegalPlaceholder = (typeof LEGAL_PLACEHOLDERS)[number];

/**
 * `LEGAL_ENTITY` and `REGISTERED_ADDRESS` are read from public env because they
 * are printed on the page and carry no secret. They are intentionally empty by
 * default — there is no company to name yet.
 */
export function legalValues(): Record<LegalPlaceholder, string> {
  const entity = process.env.NEXT_PUBLIC_LEGAL_ENTITY ?? "";
  const address = process.env.NEXT_PUBLIC_LEGAL_ADDRESS ?? "";
  const contact = contactEmail();
  const grievance = grievanceEmail();
  const effective =
    process.env.NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE ?? "not yet set";

  return {
    "{{LEGAL_ENTITY}}": entity || "{{LEGAL_ENTITY}}",
    "{{REGISTERED_ADDRESS}}": address || "{{REGISTERED_ADDRESS}}",
    "{{CONTACT_EMAIL}}": contact || "{{CONTACT_EMAIL}}",
    "{{GRIEVANCE_EMAIL}}": grievance || contact || "{{GRIEVANCE_EMAIL}}",
    "{{SITE_URL}}": siteUrl(),
    "{{EFFECTIVE_DATE}}": effective,
  };
}

/** Replaces every known placeholder in a string of legal copy. */
export function fillLegal(text: string): string {
  const values = legalValues();
  return Object.entries(values).reduce(
    (output, [placeholder, value]) => output.split(placeholder).join(value),
    text,
  );
}

export function isPlaceholderMissing(value: string): boolean {
  return LEGAL_PLACEHOLDERS.some((placeholder) => value.includes(placeholder));
}

/**
 * Third-party processors, derived from the dependencies this app actually
 * ships. Keep this list honest: if a dependency is removed, remove its entry.
 */
export interface Processor {
  name: string;
  purpose: string;
  data: string;
  region: string;
}

export function processors(): Processor[] {
  return [
    {
      name: "Vercel",
      purpose: "Hosting and serving the site",
      data: "Request logs, IP address, and the pages you request",
      region: "Global edge network; primary region configurable",
    },
    {
      name: "Neon (PostgreSQL)",
      purpose: "Storing wishes, replies and contribution records",
      data: "Wish content, hashed passwords, hashed IPs for rate limiting",
      region: "Configured database region (currently us-east-1)",
    },
    {
      name: "Cloudflare R2",
      purpose: "Storing uploaded photos, videos and voice notes",
      data: "Media files and their object keys",
      region: "Configured bucket jurisdiction",
    },
    {
      name: "Clerk",
      purpose: "Sign-in for senders who choose to create an account",
      data: "Name, email address and session tokens",
      region: "United States",
    },
    {
      name: "Google (Gemini)",
      purpose: "Optional message idea generator",
      data: "The occasion and relationship you type into the generator",
      region: "United States",
    },
    {
      name: "YouTube (Google)",
      purpose: "Optional background music embedded on a reveal page",
      data: "Standard embed requests; we do not store YouTube media",
      region: "United States",
    },
  ];
}
