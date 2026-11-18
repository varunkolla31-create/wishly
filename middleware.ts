import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);

/**
 * Routes a signed-out visitor must reach.
 *
 * Keep this in step with the app: any page that is not meant to require an
 * account belongs here, or Clerk protects it and a signed-out visitor gets a
 * 404. That silently broke /faq, /about and /manage in production.
 * tests/unit/route-access.test.ts fails when a top-level route is missing.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/create(.*)",
  "/templates(.*)",
  "/studio(.*)",
  "/occasions(.*)",
  "/w(.*)",
  "/manage(.*)",
  "/pricing(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/report(.*)",
  "/faq(.*)",
  "/about(.*)",
  "/offline(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/c(.*)",
  "/contribute(.*)",
  // Next metadata routes. Without these, Clerk protects them and crawlers get
  // a 404 for robots.txt, the sitemap and every Open Graph image.
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image(.*)",
  "/icon.svg",
  "/manifest.webmanifest",
  "/api(.*)",
]);

const middleware = hasClerkKeys
  ? clerkMiddleware(async (auth, request) => {
      if (isPublicRoute(request)) return;
      await auth.protect();
    })
  : () => NextResponse.next();

export default middleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
