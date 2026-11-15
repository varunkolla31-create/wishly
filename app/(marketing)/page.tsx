import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import { OccasionGrid } from "@/components/marketing/occasion-grid";
import { CalmWishPreview } from "@/components/marketing/calm-wish-preview";
import { TemplatePreview } from "@/components/marketing/template-preview";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { MemoryPreview } from "@/src/components/three-memory/memory-preview";
import { SAMPLE_PHOTOS } from "@/src/components/three-memory/catalog";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { OCCASIONS } from "@/lib/catalog/occasions";
import { getTemplate } from "@/lib/catalog/templates";
import type { TemplateDefinition } from "@/lib/catalog/types";
import { t } from "@/lib/i18n";

function requireTemplate(id: string): TemplateDefinition {
  const template = getTemplate(id);
  if (!template) throw new Error(`Unknown template: ${id}`);
  return template;
}

const HERO_TEMPLATES = [
  requireTemplate("soft-pastel"),
  requireTemplate("confetti-pop"),
  requireTemplate("midnight-glow"),
] as const;

function DemoBadge({ password }: { password: string }) {
  return (
    <span className="pointer-events-none inline-flex items-center gap-1 rounded-full border border-hairline bg-canvas/85 px-2 py-0.5 text-[9px] font-semibold text-ink shadow-sm backdrop-blur-md">
      <Lock aria-hidden="true" className="size-2.5" strokeWidth={2.4} />
      Password: {password}
    </span>
  );
}

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pick the occasion",
    body: "Birthday, wedding, thank you, or something that doesn't have a name yet. Start from a tone that fits.",
  },
  {
    step: "02",
    title: "Make it theirs",
    body: "Add a letter, photos, a short video or a voice note. Choose music and the moment they can open it.",
  },
  {
    step: "03",
    title: "Send a link and a password",
    body: "They get a private page that only opens with the password. No account, no app, nothing to install.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:pb-24 lg:pt-20">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Wish pages, unlocked
            </p>
            <h1 className="mt-4 font-serif text-5xl italic leading-[1.03] text-ink sm:text-6xl lg:text-7xl">
              {t("marketing.hero.title")}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              {t("marketing.hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/create" size="lg">
                {t("marketing.hero.cta")}
              </ButtonLink>
              <ButtonLink
                href="/templates"
                variant="ghost"
                size="lg"
                className="border border-hairline"
              >
                {t("marketing.hero.secondary")}
              </ButtonLink>
            </div>
            <p className="mt-5 text-sm text-ink-muted">
              Free while in early access. The receiver never signs in.
            </p>
            <Link
              href="/w/demo-midnight"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-transparent px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-hover hover:text-ink"
            >
              <PlayCircle aria-hidden="true" className="size-3.5" />
              Try live demo
              <span className="rounded-full bg-gold/25 px-1.5 py-0.5 text-[10px] font-semibold text-ink">
                Password: midnight
              </span>
            </Link>
            <TrustStrip className="mt-4" align="start" />
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="grid grid-cols-1 items-end sm:grid-cols-3 sm:gap-4">
              <Link
                href="/w/demo-love"
                aria-label="Open the For you, always demo"
                className="relative hidden -rotate-6 opacity-90 transition hover:z-20 hover:opacity-100 sm:block sm:translate-y-4"
              >
                <TemplatePreview
                  template={HERO_TEMPLATES[0]}
                  title="For you, always"
                  rich
                  photos={SAMPLE_PHOTOS.slice(0, 3)}
                  badge={<DemoBadge password="always" />}
                />
              </Link>
              <Link
                href="/w/demo-amma"
                aria-label="Open the Happy birthday, Amma demo"
                className="relative z-10 mx-auto block w-full max-w-[220px] transition hover:-translate-y-0.5 sm:max-w-none sm:scale-105"
              >
                <TemplatePreview
                  template={HERO_TEMPLATES[1]}
                  title="Happy birthday, Amma"
                  rich
                  photos={SAMPLE_PHOTOS.slice(5, 8)}
                  badge={<DemoBadge password="amma" />}
                />
              </Link>
              <Link
                href="/w/demo-midnight"
                aria-label="Open the See you at midnight demo"
                className="relative hidden rotate-6 opacity-90 transition hover:z-20 hover:opacity-100 sm:block sm:translate-y-4"
              >
                <TemplatePreview
                  template={HERO_TEMPLATES[2]}
                  title="See you at midnight"
                  rich
                  photos={SAMPLE_PHOTOS.slice(8, 11)}
                  badge={<DemoBadge password="midnight" />}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-hairline bg-sand">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <Reveal className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                3D memory reels
              </p>
              <h2 className="mt-3 max-w-xl font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
                Photos in, a little world out.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted">
                Add three to ten photos and Wishly builds an interactive 3D
                scene and a silent 9:16 reel for Stories, Reels or WhatsApp.
                Drag the preview to move through it — no other editor, no
                templates to download.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/studio" size="lg">
                  Try the 3D studio
                </ButtonLink>
                <ButtonLink href="/templates#reels" variant="outline" size="lg">
                  See all reels
                </ButtonLink>
              </div>
            </div>
            <MemoryPreview
              input={{
                templateId: "3d-vinyl-turntable",
                photos: SAMPLE_PHOTOS,
                title: "For you, always",
                receiverName: "you",
              }}
              className="mx-auto w-full max-w-xs"
            />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-hairline bg-sand">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <Reveal>
            <h2 className="max-w-2xl font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
              Three steps, then it&apos;s theirs.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((item, index) => (
              <Reveal key={item.step} delay={index * 0.08}>
                <div className="h-full rounded-card border border-hairline bg-surface p-6">
                  <span className="text-xs font-semibold tracking-[0.12em] text-coral-strong">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-base font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Occasions
            </p>
            <h2 className="mt-3 font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
              For every kind of day.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              From loud birthdays to the quiet days that need soft light and no
              confetti.
            </p>
          </div>
          <ButtonLink href="/templates" variant="outline">
            Browse 3D reels
          </ButtonLink>
        </Reveal>
        <Reveal className="mt-8" delay={0.08}>
          <OccasionGrid occasions={OCCASIONS} />
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
        <Reveal className="order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Tone matters
          </p>
          <h2 className="mt-3 font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
            Not every occasion is loud.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Get well soon and remembrance pages use slow, calm motion — no
            confetti, no bright noise. Celebrations get the colors and the
            confetti. The page should feel like the moment, not like a template.
          </p>
          <ButtonLink href="/occasions/get-well-soon" variant="outline" className="mt-6">
            See the calm style
          </ButtonLink>
        </Reveal>
        <Reveal className="order-1 mx-auto w-full max-w-xs lg:order-2 lg:max-w-sm" delay={0.08}>
          <CalmWishPreview />
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal className="rounded-[32px] bg-sand px-6 py-14 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
            Make the thing they keep.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-ink-muted">
            It takes a few minutes. It stays with them much longer.
          </p>
          <ButtonLink href="/create" size="lg" className="mt-8">
            Create a wish
          </ButtonLink>
        </Reveal>
      </section>
    </>
  );
}
