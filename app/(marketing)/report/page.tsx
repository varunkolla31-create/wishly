import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Report a page",
    description:
      "Report a Wishly page that is harassing, impersonating someone, or sharing content without consent.",
    path: "/report",
  }),
  robots: { index: false, follow: false },
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ wish?: string }>;
}) {
  const { wish } = await searchParams;
  const reference = typeof wish === "string" ? wish.slice(0, 80) : "";

  const subject = encodeURIComponent("Report a wish page");
  const body = encodeURIComponent(
    `Wish reference: ${reference || "(paste the link)"}\n\nWhat is wrong with this page:\n\n`,
  );

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Report
      </p>
      <h1 className="mt-3 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
        Report a page.
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink-muted">
        If a wish page is harassing, impersonating someone, or sharing content
        without consent, tell us. Include the link if you have it.
      </p>

      {reference ? (
        <p className="mt-4 rounded-media bg-sand px-4 py-3 text-xs text-ink-muted">
          Reference: {reference}
        </p>
      ) : null}

      <ButtonLink
        href={`mailto:report@wishly.app?subject=${subject}&body=${body}`}
        size="lg"
        className="mt-8"
      >
        Email a report
      </ButtonLink>

      <p className="mt-6 text-sm leading-relaxed text-ink-muted">
        If the page is yours, you can delete it from your dashboard at any time.
        Deleting a wish removes its media and replies too.
      </p>
    </article>
  );
}
