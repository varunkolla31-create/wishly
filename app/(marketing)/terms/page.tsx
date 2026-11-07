import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  description:
    "The early-access terms for creating and opening wish pages on Wishly.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Terms
      </p>
      <h1 className="mt-3 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
        The short version.
      </h1>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-muted">
        <p>
          Wishly is an early-access product. Features, availability, and storage
          limits may change. Keep a copy of anything you cannot afford to lose.
        </p>
        <p>
          Only upload media you have the right to use, and only create wish
          pages for people who would be glad to receive them. Harassment,
          impersonation, and non-consensual content are not allowed.
        </p>
        <p>
          A wish page is private but not unbreakable. Anyone with the link and
          the password can open it. Share both carefully, and choose a password
          you have not used elsewhere.
        </p>
        <p>
          Each wish page includes a report link. Reported pages may be removed.
        </p>
        <p>
          This is an early-access placeholder, not legal advice. Full terms will
          be published before general availability.
        </p>
      </div>
    </article>
  );
}
