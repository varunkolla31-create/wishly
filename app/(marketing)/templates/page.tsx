import type { Metadata } from "next";
import { InteractiveTemplateCard } from "@/components/marketing/interactive-template-card";
import { MemoryReelGallery } from "@/components/marketing/memory-reel-gallery";
import { PhotoPreviewBar } from "@/components/marketing/photo-preview-bar";
import { ButtonLink } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/catalog/templates";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Templates",
  description:
    "Eight native wish page templates and eight original 3D memory reels. Pick a look, add photos and download a 9:16 reel, all inside Wishly.",
  path: "/templates",
});

export default function TemplatesPage() {
  return (
    <>
      <PhotoPreviewBar />
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 lg:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Templates
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl italic leading-[1.05] text-ink sm:text-6xl">
          A page, and a little world.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
          Eight wish page looks and eight original 3D memory reels. Every
          template is made by Wishly and previews right here — no redirects, no
          other editor.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/create" size="lg">
            Create a wish
          </ButtonLink>
          <ButtonLink href="#memory-reels" variant="outline" size="lg">
            Explore 3D reels
          </ButtonLink>
        </div>
      </section>

      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 pb-2 pt-12 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Wish page templates
          </p>
          <h2 className="mt-2 font-serif text-3xl italic leading-tight text-ink">
            Pick the feeling.
          </h2>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {TEMPLATES.map((template) => (
              <InteractiveTemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="memory-reels"
        className="scroll-mt-24 border-t border-hairline bg-sand"
      >
        <div className="mx-auto max-w-6xl px-4 pb-2 pt-14 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            3D memory reels
          </p>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
            Three photos. One small world.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            Add 3–10 photos and a wish message. Wishly renders an interactive 3D
            scene and a silent 9:16 reel you can post or send. Drag any preview
            to move through the memory. Every scene respects reduced motion.
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <MemoryReelGallery />
        </div>
      </section>

      <section className="border-t border-hairline bg-sand">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-serif text-3xl italic leading-tight text-ink">
              Calm is a design decision.
            </h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-muted">
              Get well soon, sorry and remembrance pages use the reflective 3D
              scene: slow water, candlelight, no confetti. Because some days need
              a quiet room, not a party.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "No confetti on calm scenes",
              "Reduced motion respected",
              "Native 3D, no third-party editor",
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
