import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);

const isPublicRoute = createRouteMatcher([
  "/",
  "/create(.*)",
  "/templates(.*)",
  "/studio(.*)",
  "/occasions(.*)",
  "/w(.*)",
  "/pricing(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/report(.*)",
  "/offline(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/c(.*)",
  "/contribute(.*)",
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
