import { siteUrl } from "@/lib/config-public";

export { siteUrl as appUrl, contactEmail, grievanceEmail } from "@/lib/config-public";

/**
 * Client-readable env. Only NEXT_PUBLIC_* values belong here — anything in this
 * module is inlined into the browser bundle.
 */
export const publicEnv = {
  /** Delegates to the single resolver so preview and production cannot drift. */
  get appUrl(): string {
    return siteUrl();
  },
} as const;
