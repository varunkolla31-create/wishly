import { TemplatePreview } from "@/components/marketing/template-preview";
import type { TemplateDefinition } from "@/lib/catalog/types";

export function TemplateCard({ template }: { template: TemplateDefinition }) {
  return (
    <article className="group">
      <TemplatePreview
        template={template}
        className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
      />
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium text-ink">{template.name}</h3>
        <span className="text-xs text-ink-muted">
          {template.tone === "calm" ? "Calm" : "Celebratory"}
        </span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        {template.tagline}
      </p>
    </article>
  );
}
