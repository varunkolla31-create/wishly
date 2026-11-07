import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { isDevAuthBypassEnabled } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (isDevAuthBypassEnabled()) {
    return (
      <div className="rounded-card border border-hairline bg-surface p-8 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Developer sign-in
        </p>
        <h1 className="mt-3 font-serif text-3xl italic text-ink">
          You&apos;re already in.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Auth is running in local bypass mode. Continue to the dashboard, or set
          <code className="mx-1 rounded bg-sand px-1.5 py-0.5 text-xs">
            AUTH_MODE=clerk
          </code>
          with Clerk keys to use real sign-in.
        </p>
        <ButtonLink href="/dashboard" size="lg" className="mt-6 w-full">
          Continue to dashboard
        </ButtonLink>
      </div>
    );
  }

  if (!clerkKey) {
    return (
      <div className="rounded-card border border-hairline bg-surface p-8 text-center shadow-soft">
        <h1 className="font-serif text-3xl italic text-ink">
          Sign-in isn&apos;t configured yet.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Set the Clerk publishable and secret keys, or enable the local dev auth
          bypass.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <SignIn />
    </div>
  );
}
