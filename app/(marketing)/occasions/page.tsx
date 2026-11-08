import type { Metadata } from "next";
import { OccasionGrid } from "@/components/marketing/occasion-grid";
import { ButtonLink } from "@/components/ui/button";
import { OCCASIONS } from "@/lib/catalog/occasions";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Occasions",
  description:
    "Every kind of Wishly page: birthdays, anniversaries, festivals, thank-yous, farewells and the quiet days in between.",
  path: "/occasions",
});

export default function OccasionsPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 lg:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Occasions
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl italic leading-[1.05] text-ink sm:text-6xl">
          For every kind of day.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
          From loud birthdays to the quiet days that need soft light and no
          confetti. Pick an occasion to see its prompts, page looks and 3D reels.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/create" size="lg">
            Create a wish
          </ButtonLink>
          <ButtonLink href="/templates" variant="outline" size="lg">
            Browse 3D reels
          </ButtonLink>
        </div>
      </section>

      <section className="border-t border-hairline bg-sand">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <OccasionGrid occasions={OCCASIONS} />
        </div>
      </section>
    </>
  );
}
