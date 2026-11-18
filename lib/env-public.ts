export { siteUrl as appUrl, contactEmail, grievanceEmail } from "@/lib/config-public";

/**
 * Client-readable env. Only NEXT_PUBLIC_* values belong here — anything in this
 * module is inlined into the browser bundle.
 */
export const publicEnv = {
  get appUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  },
} as const;
