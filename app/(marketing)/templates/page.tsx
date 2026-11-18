import type { Metadata } from "next";
import { PhotoPreviewBar } from "@/components/marketing/photo-preview-bar";
import { ReelsTabs } from "@/components/marketing/reels-tabs";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "3D reels",
  description:
    "8 scenes × 15 moods. Browse every 3D memory reel, or open the workbench to put your own photos in one and export a silent 9:16 video.",
  path: "/templates",
});

export default async function ReelsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; reel?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab = tab === "workbench" ? "workbench" : "catalog";

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
          8 scenes × 15 moods. Browse the catalog to find a look, then open the
          workbench to put your own photos inside it and export a silent 9:16
          reel. Same place, two ways to work.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
          The workbench never uploads anything — photos stay in your browser. A
          wish page is different: when you publish it, its photos are stored on
          our servers so the receiver can open it anywhere.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/create" size="lg">
            Create a wish
          </ButtonLink>
          <ButtonLink href="#reels" variant="outline" size="lg">
            Browse the catalog
          </ButtonLink>
        </div>
      </section>

      <section id="reels" className="scroll-mt-40 border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Reveal>
            <ReelsTabs initialTab={initialTab} />
          </Reveal>
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
