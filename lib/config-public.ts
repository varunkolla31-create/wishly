/**
 * One place that answers "what is this deployment's public origin?".
 *
 * `NEXT_PUBLIC_SITE_URL` is the intended switch when a custom domain is added,
 * so nothing else in the app hardcodes a vercel.app host. The Vercel-provided
 * variables are a fallback for previews, and localhost is the last resort.
 *
 * Safe on the client: only NEXT_PUBLIC_* values are read.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const legacy = process.env.NEXT_PUBLIC_APP_URL;
  if (legacy) return legacy.replace(/\/$/, "");

  const production = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production.replace(/\/$/, "")}`;

  const preview = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (preview) return `https://${preview.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

/**
 * Footer and legal contact address. Deliberately not invented: until
 * CONTACT_EMAIL is configured the UI says so rather than showing a fake one.
 */
export function contactEmail(): string | null {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null;
}

export function grievanceEmail(): string | null {
  return (
    process.env.NEXT_PUBLIC_GRIEVANCE_EMAIL ??
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
    null
  );
}
