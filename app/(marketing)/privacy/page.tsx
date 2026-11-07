import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "What Wishly stores, what it never stores, and how to delete your data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Privacy
      </p>
      <h1 className="mt-3 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
        What we keep, and what we don&apos;t.
      </h1>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-muted">
        <p>
          Wishly stores the content you add to a wish page — your message,
          photos, videos, voice notes, the receiver&apos;s name, and the moment
          the page unlocks — so the receiver can open it later.
        </p>
        <p>
          Passwords are stored only as a one-way Argon2id hash. We never store,
          log, or email your plaintext password. We aggregate page views as a
          single number; we do not store IP addresses, browser fingerprints, or
          per-visitor records for wish pages.
        </p>
        <p>
          Replies and contributions are stored with the wish they belong to.
          Deleting a wish deletes its contributions, replies, and uploaded media.
        </p>
        <p>
          Wish pages are marked <code>noindex, nofollow</code> and their link
          previews never show private content. Only the receiver name and an
          optional hint are shown before unlock.
        </p>
        <p>
          This is an early-access placeholder policy, not legal advice. A
          complete policy will be published before general availability. To
          request deletion now, sign in and delete the wish from your dashboard.
        </p>
      </div>
    </article>
  );
}
