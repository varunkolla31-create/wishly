import type { Metadata } from "next";
import Link from "next/link";
import { fillLegal, legalValues, processors } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "What Wishly stores, where it is kept, how long it lasts, and how to get it back or delete it.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const values = legalValues();

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Privacy
      </p>
      <h1 className="mt-3 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
        What we keep, and what we don&apos;t.
      </h1>
      <p className="mt-4 text-sm text-ink-muted">
        Effective {values["{{EFFECTIVE_DATE}}"]}.
      </p>

      <div className="mt-6 rounded-card border border-hairline bg-sand px-4 py-3">
        <p className="text-xs leading-relaxed text-ink">
          <strong className="font-medium">Draft, not legal advice.</strong> This
          page is written to be honest and readable, and it follows the shape of
          India&apos;s Digital Personal Data Protection Act, 2023. It has not
          been reviewed by a lawyer yet. If you need certainty before launch,
          have it reviewed.
        </p>
      </div>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-muted">
        <section>
          <h2 className="font-serif text-2xl italic text-ink">Who we are</h2>
          <p className="mt-2">
            Wishly is operated by {values["{{LEGAL_ENTITY}}"]}, at{" "}
            {values["{{REGISTERED_ADDRESS}}"]}. For any privacy question or
            request, write to{" "}
            <a
              className="text-coral-strong underline underline-offset-4"
              href={`mailto:${values["{{CONTACT_EMAIL}}"]}`}
            >
              {values["{{CONTACT_EMAIL}}"]}
            </a>
            .
          </p>
          <p className="mt-2">
            Under the DPDP Act we act as the Data Fiduciary for the personal data
            described below.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            What we store
          </h2>
          <p className="mt-2">
            When someone creates a wish, we store the message, the receiver&apos;s
            first name, the photos, videos and voice notes they upload, the
            optional music choice, and the moment the page may be opened.
          </p>
          <p className="mt-2">
            If the sender signs in, we also store their account details through
            Clerk. If they publish without signing in, we store no account — just
            the wish, plus a hashed manage token so they can delete it later.
          </p>
          <p className="mt-2">
            Passwords are stored only as a one-way Argon2id hash. We never store,
            log, or email a plaintext password, and we cannot read one back. IP
            addresses are never stored in the clear: unlock rate limiting uses a
            salted HMAC of the address, which cannot be reversed.
          </p>
          <p className="mt-2">
            We count page views as a single number per wish and record one
            &ldquo;opened&rdquo; timestamp. We do not keep a visitor history,
            browser fingerprints, or per-visitor records. We do not use
            advertising or cross-site tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            How long we keep it
          </h2>
          <p className="mt-2">
            A wish created without signing in expires after 30 days by default
            and stops opening — including its media — from that moment. The exact
            date is shown on the creator&apos;s manage page.
          </p>
          <p className="mt-2">
            A wish created from an account stays until the sender deletes it.
            Deleting a wish deletes its contributions, replies, uploaded media and
            voice notes.
          </p>
          <p className="mt-2">
            Rate-limit counters are short-lived and unrelated to any person; they
            are swept automatically.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            Where it is stored
          </h2>
          <p className="mt-2">
            Data is stored with the processors listed below, which may process it
            outside India. Where that happens, we rely on the processor&apos;s
            contractual safeguards and keep the list here up to date.
          </p>

          <ul className="mt-4 space-y-3">
            {processors().map((processor) => (
              <li
                key={processor.name}
                className="rounded-card border border-hairline bg-surface px-4 py-3"
              >
                <p className="text-sm font-medium text-ink">
                  {processor.name}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {processor.purpose}. {processor.data}.
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {processor.region}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            Music and third-party content
          </h2>
          <p className="mt-2">
            A sender may attach a YouTube link as background music. That player is
            provided by YouTube under its own terms, and we do not download,
            store, or redistribute its audio or video. If a track is removed
            upstream, it stops playing here.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            Children and minors
          </h2>
          <p className="mt-2">
            Wishly is not directed at children under 13, and we do not knowingly
            collect their personal data. If you are under 18, please use Wishly
            only with a parent or guardian&apos;s consent. If you believe a child
            has given us personal data, write to us and we will delete it.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">Your rights</h2>
          <p className="mt-2">
            You can ask for a copy of your data, correction of it, or its
            deletion. You can also nominate someone to exercise these rights on
            your behalf if you die or become incapacitated.
          </p>
          <p className="mt-2">
            There is no account required to make a request. If you created a wish
            without signing in, use the manage link you saved, or write to{" "}
            <a
              className="text-coral-strong underline underline-offset-4"
              href={`mailto:${values["{{CONTACT_EMAIL}}"]}`}
            >
              {values["{{CONTACT_EMAIL}}"]}
            </a>{" "}
            and quote the wish link. If you have an account, you can delete
            wishes from your dashboard at any time, or write to the same address.
          </p>
          <p className="mt-2">
            We answer requests within the period the DPDP Act allows. If you are
            not satisfied, you may complain to the Data Protection Board of
            India.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            Grievance contact
          </h2>
          <p className="mt-2">
            For a complaint about how we handled your data, contact our grievance
            officer at{" "}
            <a
              className="text-coral-strong underline underline-offset-4"
              href={`mailto:${values["{{GRIEVANCE_EMAIL}}"]}`}
            >
              {values["{{GRIEVANCE_EMAIL}}"]}
            </a>
            . For a page that is harassing someone or shared without consent, use{" "}
            <Link
              href="/report"
              className="text-coral-strong underline underline-offset-4"
            >
              the report page
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">Changes</h2>
          <p className="mt-2">
            If this policy changes in a way that matters, we will update the date
            at the top and, for significant changes, tell signed-in senders by
            email.
          </p>
        </section>
      </div>

      <p className="mt-10 text-xs leading-relaxed text-ink-muted">
        {fillLegal(
          "This document is a draft for {{LEGAL_ENTITY}} and must be reviewed by a qualified lawyer before launch.",
        )}
      </p>
    </article>
  );
}
