/**
 * One place that answers "what is this deployment's public origin?".
 *
 * `NEXT_PUBLIC_SITE_URL` is the intended switch when a custom domain is added,
 * so nothing else in the app hardcodes a vercel.app host. The Vercel-provided
 * variables are a fallback for previews, and localhost is the last resort.
 *
 * Safe on the client: NEXT_PUBLIC_* values are inlined; the unprefixed Vercel
 * names resolve to undefined there, which is expected.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return stripTrailingSlash(explicit);

  const legacy = process.env.NEXT_PUBLIC_APP_URL;
  if (legacy) return stripTrailingSlash(legacy);

  // Vercel injects these server-side; the NEXT_PUBLIC_ copy is only present
  // when a deployment opted in to exposing system variables. On the client the
  // unprefixed names resolve to undefined, so localhost remains the fallback.
  const production =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${stripTrailingSlash(production)}`;

  const preview =
    process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (preview) return `https://${stripTrailingSlash(preview)}`;

  return "http://localhost:3000";
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
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
