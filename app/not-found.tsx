import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-5 py-16 text-center text-ink">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        404
      </p>
      <h1 className="mt-4 font-serif text-5xl italic leading-[1.05] sm:text-6xl">
        This page isn&apos;t here.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted">
        The link may be incomplete, or the wish may have been deleted or
        expired. If someone sent you this address, ask them for the full link —
        it&apos;s easy to clip a few characters when copying.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" size="lg">
          Go home
        </ButtonLink>
        <ButtonLink href="/create" variant="outline" size="lg">
          Create a wish
        </ButtonLink>
      </div>

      <nav className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-muted">
        {[
          { href: "/occasions", label: "Occasions" },
          { href: "/templates", label: "3D reels" },
          { href: "/pricing", label: "Pricing" },
          { href: "/report", label: "Report a page" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="underline underline-offset-4 transition-colors hover:text-ink"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
