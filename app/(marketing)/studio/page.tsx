import type { Metadata } from "next";
import { MemoryReelGallery } from "@/components/marketing/memory-reel-gallery";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "3D memory reels",
  description:
    "120 native 3D memory reels from 8 rigs and 15 atmosphere presets. Add photos and Wishly renders a 9:16 video.",
  path: "/studio",
});

export default function StudioIndexPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 lg:pt-20">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        3D memory studio
      </p>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl italic leading-[1.05] text-ink sm:text-6xl">
        Photos in, a little world out.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
        120 original Wishly scenes from 8 rigs × 15 atmosphere presets. Add
        three to ten photos and a wish message, move through the memory in 3D,
        then download a silent 9:16 reel for Stories, Reels or WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/create" size="lg">
          Make a wish
        </ButtonLink>
        <ButtonLink href="/templates#memory-reels" variant="outline" size="lg">
          See all reels
        </ButtonLink>
      </div>

      <div className="mt-12">
        <MemoryReelGallery />
      </div>
    </main>
  );
}
