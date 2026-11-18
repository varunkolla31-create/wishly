import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { contactEmail } from "@/lib/config-public";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "How Wishly works: what a wish is, whether it is private, how passwords work, how to delete one, what it costs, and which occasions fit.",
  path: "/faq",
});

const FAQ = [
  {
    q: "What is a wish?",
    a: "A wish is a small private web page you make for one person. It holds a letter, photos, a short video or voice note, sometimes music, and it opens with a password you share separately. It is not a social post and it is not public.",
  },
  {
    q: "Is it private?",
    a: "Yes by design. A wish page is marked noindex, nofollow so search engines skip it, its link preview shows only the receiver's first name, and nothing inside it — the message, the photos, the hint — is visible until the right password is entered. Anyone with both the link and the password can open it, so treat the password like a key.",
  },
  {
    q: "How do passwords work?",
    a: "You choose a password when you publish, and we store only a one-way Argon2id hash. We cannot read it back or email it to you. Send it in a separate message from the link. If you forget it, set a new one from the edit screen — that also retires every previously opened session.",
  },
  {
    q: "How do I delete a wish?",
    a: "If you have an account, delete it from your dashboard. If you published without signing in, you were given a private manage link when you published — open it and delete from there. Deleting removes the page, its photos, videos, voice notes, contributions and replies.",
  },
  {
    q: "What does it cost?",
    a: "Nothing right now. Wishly is in early access, there is no card to add and no paid plan is active. When paid plans exist, early-access wishes stay free.",
  },
  {
    q: "Which occasions does it fit?",
    a: "Birthdays, anniversaries, weddings and engagements, baby showers, graduations, farewells and retirements, get well soon, thank you, sorry, Mother's and Father's Day, friendship, festivals like Diwali, Pongal, Eid, Christmas, Holi and New Year, remembrance, and just because.",
  },
  {
    q: "Do I need an account to receive a wish?",
    a: "No. The receiver never signs in — just the link and the password. Creating a wish works without an account too, though signing in lets you keep it in a dashboard and invite friends to contribute.",
  },
  {
    q: "What happens when a wish expires?",
    a: "Wishes created without an account expire after 30 days by default. After that the link and its media stop opening, and the page reads as not found. The exact date is on your manage page.",
  },
];

export default function FaqPage() {
  const contact = contactEmail();

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        FAQ
      </p>
      <h1 className="mt-3 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
        The questions people actually ask.
      </h1>

      <div className="mt-10 space-y-8">
        {FAQ.map((item) => (
          <section key={item.q}>
            <h2 className="text-base font-medium text-ink">{item.q}</h2>
            <p className="mt-2 text-base leading-relaxed text-ink-muted">
              {item.a}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-card border border-hairline bg-sand p-6">
        <h2 className="font-serif text-2xl italic text-ink">
          Still stuck?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {contact ? (
            <>
              Write to{" "}
              <a
                href={`mailto:${contact}`}
                className="text-coral-strong underline underline-offset-4"
              >
                {contact}
              </a>{" "}
              and a person will answer.
            </>
          ) : (
            <>
              The contact address is not configured on this deployment yet.{" "}
              <Link href="/report" className="underline underline-offset-4">
                The report page
              </Link>{" "}
              still works for something urgent.
            </>
          )}
        </p>
        <ButtonLink href="/create" className="mt-5">
          Create a wish
        </ButtonLink>
      </div>
    </article>
  );
}
