import type { Metadata } from "next";
import { MemoryWorkbench } from "@/components/studio/memory-workbench";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "3D studio",
  description:
    "Preview 120 native 3D memory reels in one workbench: upload photos, switch rigs and atmospheres, then export a silent 9:16 video.",
  path: "/studio",
});

export default function StudioIndexPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 lg:pt-20">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          3D studio · workbench
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl italic leading-[1.05] text-ink sm:text-6xl">
          Photos in, a little world out.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
          This is the workbench, not the catalog. Upload photos once, then switch
          rigs and atmospheres to compare every scene live in 3D — then export a
          silent 9:16 reel for Stories, Reels or WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/create" size="lg">
            Make a wish
          </ButtonLink>
          <ButtonLink href="/templates#reels" variant="outline" size="lg">
            Browse the catalog
          </ButtonLink>
        </div>
      </Reveal>

      <div className="mt-12">
        <MemoryWorkbench />
      </div>
    </main>
  );
}
