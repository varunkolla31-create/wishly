import type { Metadata } from "next";
import { CanvaVideoGallery } from "@/components/marketing/canva-video-gallery";
import { TemplateCard } from "@/components/marketing/template-card";
import { ButtonLink } from "@/components/ui/button";
import {
  CANVA_VIDEO_CATEGORIES,
  CANVA_VIDEO_TEMPLATES,
} from "@/lib/catalog/canva-videos";
import { TEMPLATES } from "@/lib/catalog/templates";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Templates",
  description:
    "Eight wish page templates plus 212 Canva video templates for birthdays, weddings, Diwali, anniversaries and reels. Pick a look, or open a video template in Canva.",
  path: "/templates",
});

export default function TemplatesPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 lg:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Templates
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl italic leading-[1.05] text-ink sm:text-6xl">
          A page that looks like the feeling.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
          Every template sets the background, type, photo layout, confetti and
          music mood. Pick one now — you can change it any time before you
          publish.
        </p>
        <div className="mt-8">
          <ButtonLink href="/dashboard" size="lg">
            Create a wish
          </ButtonLink>
        </div>
      </section>

      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {TEMPLATES.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="video-templates"
        className="scroll-mt-24 border-t border-hairline bg-sand"
      >
        <div className="mx-auto max-w-6xl px-4 pb-4 pt-14 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Canva video templates
          </p>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
            Add motion to the moment.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            {CANVA_VIDEO_TEMPLATES.length} Canva video templates across{" "}
            {CANVA_VIDEO_CATEGORIES.length} occasions. Open any template in Canva,
            add your photos and words, and send it as a video — or pair it with a
            Wishly page. Pro templates need a Canva Pro plan.
          </p>
        </div>
        <div className="bg-canvas">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <CanvaVideoGallery
              templates={CANVA_VIDEO_TEMPLATES}
              categories={CANVA_VIDEO_CATEGORIES}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-hairline bg-sand">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-serif text-3xl italic leading-tight text-ink">
              Calm is a design decision.
            </h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-muted">
              Get well soon and remembrance pages use Calm Sky: slower motion,
              softer colors, no confetti. Because some days need a quiet room,
              not a party.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "No confetti on calm pages",
              "Reduced motion respected",
              "One clear action at a time",
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
    </>
  );
}
