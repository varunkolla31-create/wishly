import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OccasionIcon } from "@/components/marketing/occasion-icon";
import { TemplateCard } from "@/components/marketing/template-card";
import { TemplatePreview } from "@/components/marketing/template-preview";
import { ButtonLink } from "@/components/ui/button";
import { getOccasion, OCCASIONS } from "@/lib/catalog/occasions";
import { getTemplate, TEMPLATES } from "@/lib/catalog/templates";
import type { TemplateDefinition } from "@/lib/catalog/types";
import { pageMetadata } from "@/lib/seo";

interface OccasionPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return OCCASIONS.map((occasion) => ({ slug: occasion.slug }));
}

export async function generateMetadata({
  params,
}: OccasionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const occasion = getOccasion(slug);
  if (!occasion) return { title: "Occasion not found" };

  return pageMetadata({
    title: occasion.seoTitle,
    description: occasion.seoDescription,
    path: `/occasions/${occasion.slug}`,
  });
}

function requireTemplate(id: string): TemplateDefinition {
  const template = getTemplate(id);
  if (!template) throw new Error(`Unknown template: ${id}`);
  return template;
}

export default async function OccasionPage({ params }: OccasionPageProps) {
  const { slug } = await params;
  const occasion = getOccasion(slug);
  if (!occasion) notFound();

  const defaultTemplate = requireTemplate(occasion.defaultTemplateId);
  const companionTemplates = TEMPLATES.filter(
    (template) =>
      template.id !== defaultTemplate.id && template.tone === defaultTemplate.tone,
  ).slice(0, 2);
  const relatedOccasions = OCCASIONS.filter(
    (item) => item.slug !== occasion.slug,
  ).slice(0, 8);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 lg:pt-20">
        <Link
          href="/"
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← All occasions
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="max-w-xl">
            <span className="flex size-12 items-center justify-center rounded-full bg-sand text-ink">
              <OccasionIcon icon={occasion.icon} className="size-6" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {occasion.tone === "calm" ? "A quieter page" : "Make it a moment"}
            </p>
            <h1 className="mt-3 font-serif text-5xl italic leading-[1.05] text-ink sm:text-6xl">
              A {occasion.name.toLowerCase()} wish they can unlock.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              {occasion.blurb}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/dashboard" size="lg">
                Create a {occasion.name.toLowerCase()} wish
              </ButtonLink>
              <ButtonLink href="/templates" variant="outline" size="lg">
                Browse templates
              </ButtonLink>
            </div>
            {occasion.tone === "calm" ? (
              <p className="mt-5 text-sm text-ink-muted">
                Calm motion, soft colors, no confetti.
              </p>
            ) : null}
          </div>

          <div>
            {companionTemplates.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                <TemplatePreview
                  template={defaultTemplate}
                  title={`For ${occasion.name.toLowerCase()}`}
                  className="col-span-2"
                />
                <div className="grid gap-3">
                  {companionTemplates.map((template) => (
                    <TemplatePreview
                      key={template.id}
                      template={template}
                      className="text-sm"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <TemplatePreview
                template={defaultTemplate}
                title={`For ${occasion.name.toLowerCase()}`}
                className="mx-auto max-w-sm"
              />
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-hairline bg-sand">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Prompts to start you off
            </p>
            <h2 className="mt-3 font-serif text-3xl italic leading-tight text-ink">
              Not sure what to say?
            </h2>
            <ul className="mt-6 space-y-3">
              {occasion.prompts.map((prompt) => (
                <li
                  key={prompt}
                  className="rounded-card border border-hairline bg-surface px-5 py-4 text-sm leading-relaxed text-ink"
                >
                  {prompt}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              How it works
            </p>
            <ol className="mt-6 space-y-4">
              {[
                "Choose this occasion and a template.",
                "Add your message, photos, music, and a password.",
                "Share the link and the password. They unlock the rest.",
              ].map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-medium text-canvas">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-relaxed text-ink-muted">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
            <ButtonLink href="/dashboard" className="mt-6">
              Start a draft
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-3xl italic leading-tight text-ink">
            More templates for this tone
          </h2>
          <Link
            href="/templates"
            className="text-sm font-medium text-coral hover:text-coral-hover"
          >
            All templates →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
          {[defaultTemplate, ...companionTemplates].map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Other occasions
        </h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {relatedOccasions.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/occasions/${item.slug}`}
                className="inline-flex min-h-10 items-center rounded-full border border-hairline bg-surface px-4 text-sm text-ink transition-colors hover:bg-hover"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
