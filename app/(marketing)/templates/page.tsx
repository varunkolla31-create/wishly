import type { Metadata } from "next";
import { InteractiveTemplateCard } from "@/components/marketing/interactive-template-card";
import { MemoryReelGallery } from "@/components/marketing/memory-reel-gallery";
import { PhotoPreviewBar } from "@/components/marketing/photo-preview-bar";
import { ButtonLink } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/catalog/templates";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "3D reels",
  description:
    "120 original 3D memory reels from 8 rigs and 15 atmosphere presets. Upload 3–10 photos once, preview every reel live, and download a silent 9:16 video.",
  path: "/templates",
});

export default function TemplatesPage() {
  return (
    <>
      <PhotoPreviewBar />

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 lg:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          3D reels
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl italic leading-[1.05] text-ink sm:text-6xl">
          Your photos, in a little world.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
          120 original 3D reels from 8 rigs and 15 atmosphere presets. Upload
          3–10 photos once and see them inside every reel before you pick one —
          no redirects, no other editor.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/create" size="lg">
            Create a wish
          </ButtonLink>
          <ButtonLink href="#reels" variant="outline" size="lg">
            Preview all 120 reels
          </ButtonLink>
        </div>
      </section>

      <section id="reels" className="scroll-mt-32 border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 pb-2 pt-12 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            3D reels · made first
          </p>
          <h2 className="mt-2 font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
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

      <section
        id="page-looks"
        className="scroll-mt-32 border-t border-hairline bg-sand"
      >
        <div className="mx-auto max-w-6xl px-4 pb-2 pt-12 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Then pick a page look
          </p>
          <h2 className="mt-2 font-serif text-3xl italic leading-tight text-ink">
            The page around the reel.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">
            Eight wish page looks for the lock screen and the letter. The reel
            stays the main event.
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {TEMPLATES.map((template) => (
              <InteractiveTemplateCard key={template.id} template={template} />
            ))}
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
