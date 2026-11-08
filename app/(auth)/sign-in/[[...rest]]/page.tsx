import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkErrorBoundary } from "@/components/auth/clerk-error-boundary";
import { AuthShell } from "@/components/auth/auth-shell";
import { ButtonLink } from "@/components/ui/button";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";
import { isDevAuthBypassEnabled } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

function SignInFallback() {
  return (
    <div
      aria-busy="true"
      className="rounded-card border border-hairline bg-surface p-8 shadow-soft"
    >
      <div className="mx-auto h-6 w-36 animate-pulse rounded-full bg-sand" />
      <div className="mx-auto mt-4 h-4 w-56 animate-pulse rounded-full bg-sand" />
      <div className="mt-8 space-y-3">
        <div className="h-12 animate-pulse rounded-full bg-sand" />
        <div className="h-12 animate-pulse rounded-full bg-sand" />
        <div className="h-12 animate-pulse rounded-full bg-sand" />
      </div>
    </div>
  );
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; redirect_url?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect_url ?? params.redirect ?? "/dashboard";
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  const keyLooksValid = Boolean(
    clerkKey && /^pk_(test|live)_/.test(clerkKey),
  );

  if (isDevAuthBypassEnabled()) {
    return (
      <AuthShell mode="sign-in">
        <div className="rounded-card border border-hairline bg-surface p-8 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Developer sign-in
          </p>
          <h1 className="mt-3 font-serif text-3xl italic text-ink">
            You&apos;re already in.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Auth is running in local bypass mode. Continue to the dashboard, or
            set
            <code className="mx-1 rounded bg-sand px-1.5 py-0.5 text-xs">
              AUTH_MODE=clerk
            </code>
            with Clerk keys to use real sign-in.
          </p>
          <ButtonLink href={redirectTo} size="lg" className="mt-6 w-full">
            Continue
          </ButtonLink>
        </div>
      </AuthShell>
    );
  }

  if (!keyLooksValid || !clerkSecret) {
    return (
      <AuthShell mode="sign-in">
        <div className="rounded-card border border-hairline bg-surface p-8 text-center shadow-soft">
          <h1 className="font-serif text-3xl italic text-ink">
            Sign-in isn&apos;t configured yet.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {!keyLooksValid
              ? "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing or invalid."
              : "CLERK_SECRET_KEY is missing."}{" "}
            Add both Clerk keys in Vercel, or enable the local dev auth bypass.
          </p>
          <ButtonLink href="/create" size="lg" className="mt-6 w-full">
            Keep building as a guest
          </ButtonLink>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell mode="sign-in">
      <div className="flex justify-center">
        <Suspense fallback={<SignInFallback />}>
          <ClerkErrorBoundary redirectTo={redirectTo}>
            <SignIn
              appearance={clerkAppearance}
              fallbackRedirectUrl={redirectTo}
              signUpFallbackRedirectUrl={redirectTo}
            />
          </ClerkErrorBoundary>
        </Suspense>
      </div>
    </AuthShell>
  );
}
