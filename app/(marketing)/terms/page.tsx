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

        <h2 className="pt-4 font-serif text-2xl italic text-ink">
          Music and third-party services
        </h2>
        <p>
          Wishly can embed or link music and video from Spotify and YouTube. Those
          services are provided under their respective Developer Terms of Service,
          and your use of them is also governed by their consumer terms. We do not
          download, store, or redistribute their content. Content availability can
          change without notice, and a track may stop playing if a platform
          removes it.
        </p>
        <p>
          By creating a wish you confirm that you have the rights to the media you
          upload and that the people you name would be glad to receive it.
        </p>
      </div>
    </article>
  );
}
