import type { Metadata } from "next";
import { MemoryTemplateCard } from "@/src/components/three-memory/memory-template-card";
import { MEMORY_TEMPLATES } from "@/src/components/three-memory/catalog";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "3D memory reels",
  description:
    "Six native 3D memory reel templates for birthdays, weddings, festivals, thank-yous and quiet days. Add photos and Wishly renders a 9:16 video.",
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
        Six original Wishly scenes. Add three to ten photos and a wish message,
        move through the memory in 3D, then download a silent 9:16 reel for
        Stories, Reels or WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/create" size="lg">
          Make a wish
        </ButtonLink>
        <ButtonLink href="/templates#memory-reels" variant="outline" size="lg">
          See all reels
        </ButtonLink>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
        {MEMORY_TEMPLATES.map((template) => (
          <MemoryTemplateCard key={template.id} template={template} />
        ))}
      </div>
    </main>
  );
}
