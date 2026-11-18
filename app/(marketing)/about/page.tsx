import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { contactEmail, grievanceEmail } from "@/lib/config-public";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Why Wishly exists, what it does with your data, and how to reach a human.",
  path: "/about",
});

export default function AboutPage() {
  const contact = contactEmail();
  const grievance = grievanceEmail();

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        About
      </p>
      <h1 className="mt-3 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
        Some things deserve more than a message.
      </h1>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-muted">
        <p>
          Wishly is a small tool for making one thing, well: a private page for a
          person you care about. You write the words, add the photos, choose the
          mood, and send a link with a password that is not in the same message.
          That small piece of friction is the whole point — it makes opening it
          feel like receiving something.
        </p>
        <p>
          It exists because a birthday message gets scrolled past in four
          seconds, and a carefully made thing does not. The page is quiet, it
          does not notify anyone, and it does not ask the receiver to sign up for
          anything.
        </p>
        <p>
          We keep very little. Passwords are stored only as one-way hashes.
          Wish pages are excluded from search engines. Link previews show a name
          and nothing else. We do not run advertising or cross-site tracking, and
          the only thing recorded about a receiver opening a wish is a single
          yes-or-no.
        </p>
        <p>
          Wishly is in early access. It is being built in the open, features
          change, and the honest limits are written down on the pricing and
          privacy pages rather than implied.
        </p>
      </div>

      <div className="mt-10 rounded-card border border-hairline bg-sand p-6">
        <h2 className="font-serif text-2xl italic text-ink">Get in touch</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted">
          <li>
            General questions:{" "}
            {contact ? (
              <a
                href={`mailto:${contact}`}
                className="text-coral-strong underline underline-offset-4"
              >
                {contact}
              </a>
            ) : (
              <span className="text-xs">
                not configured on this deployment yet
              </span>
            )}
          </li>
          <li>
            Data or grievance requests:{" "}
            {grievance ? (
              <a
                href={`mailto:${grievance}`}
                className="text-coral-strong underline underline-offset-4"
              >
                {grievance}
              </a>
            ) : (
              <span className="text-xs">not configured yet</span>
            )}
          </li>
          <li>
            A page that breaks the rules:{" "}
            <Link
              href="/report"
              className="text-coral-strong underline underline-offset-4"
            >
              report it
            </Link>
          </li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/create">Create a wish</ButtonLink>
          <ButtonLink href="/faq" variant="outline">
            Read the FAQ
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
