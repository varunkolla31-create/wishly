import type { Metadata } from "next";
import Link from "next/link";
import { fillLegal, legalValues } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  description:
    "The early-access terms for creating and opening wish pages on Wishly.",
  path: "/terms",
});

export default function TermsPage() {
  const values = legalValues();

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Terms
      </p>
      <h1 className="mt-3 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
        The short version.
      </h1>
      <p className="mt-4 text-sm text-ink-muted">
        Effective {values["{{EFFECTIVE_DATE}}"]}.
      </p>

      <div className="mt-6 rounded-card border border-hairline bg-sand px-4 py-3">
        <p className="text-xs leading-relaxed text-ink">
          <strong className="font-medium">Draft, not legal advice.</strong> These
          terms are written to be readable and are not yet reviewed by a lawyer.
          Have them reviewed before you rely on them commercially.
        </p>
      </div>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-muted">
        <section>
          <h2 className="font-serif text-2xl italic text-ink">Who we are</h2>
          <p className="mt-2">
            Wishly is operated by {values["{{LEGAL_ENTITY}}"]}. By creating or
            opening a wish you agree to these terms. If you do not agree, please
            do not use the service.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            Early access
          </h2>
          <p className="mt-2">
            Wishly is an early-access product. Features, availability and storage
            limits may change. Keep a copy of anything you cannot afford to lose.
          </p>
          <p className="mt-2">
            Creating, publishing and opening wish pages is free while we are in
            early access. There is no card to add, and no paid plan is active yet.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            What you may put here
          </h2>
          <p className="mt-2">
            Only upload media you have the right to use, and only create a wish
            page for someone who would be glad to receive it. Harassment,
            impersonation, non-consensual content and content that breaks the law
            are not allowed.
          </p>
          <p className="mt-2">
            You keep ownership of what you upload. You give us permission to
            store and serve it so the receiver can open the page — nothing more.
          </p>
          <p className="mt-2">
            If you are under 18, use Wishly only with a parent or
            guardian&apos;s consent.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            Passwords and privacy
          </h2>
          <p className="mt-2">
            A wish page is private but not unbreakable. Anyone with the link and
            the password can open it. Send the password separately, and choose
            one you have not used elsewhere. We store only a one-way hash and
            cannot recover a forgotten password.
          </p>
          <p className="mt-2">
            Pages created without an account expire. The expiry date is shown on
            the manage page and in{" "}
            <Link
              href="/privacy"
              className="text-coral-strong underline underline-offset-4"
            >
              the privacy policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            Managing and deleting
          </h2>
          <p className="mt-2">
            Signed-in senders manage wishes from the dashboard. If you published
            without signing in, you were given a private manage link — save it,
            because we cannot show it again. It can delete the wish and everything
            attached to it.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            Reporting a page
          </h2>
          <p className="mt-2">
            Each wish page includes a report link, and there is{" "}
            <Link
              href="/report"
              className="text-coral-strong underline underline-offset-4"
            >
              a report page
            </Link>{" "}
            you can use directly. Reported pages may be removed.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            Music and third-party services
          </h2>
          <p className="mt-2">
            Wishly can embed or link music and video from YouTube. Those services
            are provided under their own terms, and your use of them is also
            governed by those terms. We do not download, store, or redistribute
            their content. Content availability can change without notice, and a
            track may stop playing if the platform removes it.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">
            Liability and changes
          </h2>
          <p className="mt-2">
            Wishly is provided as-is during early access, without warranties. To
            the extent the law allows, we are not liable for lost content or for
            what a third party does with a link you shared. Nothing here limits
            rights you have under applicable law.
          </p>
          <p className="mt-2">
            We may update these terms. If a change matters, we will update the
            date above and, for significant changes, tell signed-in senders by
            email.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl italic text-ink">Contact</h2>
          <p className="mt-2">
            Questions about these terms:{" "}
            <a
              className="text-coral-strong underline underline-offset-4"
              href={`mailto:${values["{{CONTACT_EMAIL}}"]}`}
            >
              {values["{{CONTACT_EMAIL}}"]}
            </a>
            . Complaints about data handling go to{" "}
            <a
              className="text-coral-strong underline underline-offset-4"
              href={`mailto:${values["{{GRIEVANCE_EMAIL}}"]}`}
            >
              {values["{{GRIEVANCE_EMAIL}}"]}
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-10 text-xs leading-relaxed text-ink-muted">
        {fillLegal(
          "These terms are a draft for {{LEGAL_ENTITY}} and must be reviewed by a qualified lawyer before launch.",
        )}
      </p>
    </article>
  );
}
