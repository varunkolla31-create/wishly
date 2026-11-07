import type { Metadata } from "next";
import { CanvaVideoGallery } from "@/components/marketing/canva-video-gallery";
import { ButtonLink } from "@/components/ui/button";
import {
  CANVA_VIDEO_CATEGORIES,
  CANVA_VIDEO_TEMPLATES,
} from "@/lib/catalog/canva-videos";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Video templates",
  description:
    "Browse Canva video templates for birthdays, weddings, Diwali, anniversaries, reels and more. Open any template in Canva and make it yours.",
  path: "/video-templates",
});

export default function VideoTemplatesPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 lg:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Canva video templates
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl italic leading-[1.05] text-ink sm:text-6xl">
          A moving card for the moment.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
          {CANVA_VIDEO_TEMPLATES.length} hand-picked Canva video templates across{" "}
          {CANVA_VIDEO_CATEGORIES.length} occasions. Open one in Canva, drop in
          your photos and words, and send it as a video — or use it alongside a
          Wishly page.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ButtonLink href="/dashboard" size="lg">
            Make a Wishly page
          </ButtonLink>
          <span className="text-sm text-ink-muted">
            Templates open on canva.com in a new tab.
          </span>
        </div>
      </section>

      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <CanvaVideoGallery
            templates={CANVA_VIDEO_TEMPLATES}
            categories={CANVA_VIDEO_CATEGORIES}
          />
        </div>
      </section>

      <section className="border-t border-hairline bg-sand">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-serif text-3xl italic leading-tight text-ink">
              Video now, a page they keep.
            </h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-muted">
              Videos are perfect for the feed. A Wishly page is the version they
              unlock slowly: photos, a letter, a voice note and music, kept behind
              a private password.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "Free and Pro templates",
              "16:9, 9:16 and 1:1",
              "Links straight to Canva",
              "No Canva API needed",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-ink"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-xs leading-relaxed text-ink-muted">
            Template previews and links belong to Canva. Opening a template takes
            you to Canva&apos;s editor, where Canva&apos;s own terms and licensing
            apply. Pro templates require a Canva Pro, Teams or Enterprise plan.
          </p>
        </div>
      </section>
    </>
  );
}
