"use client";

import { MemoryTemplatePicker } from "@/src/components/three-memory/memory-template-picker";
import type { MemoryTemplate } from "@/src/components/three-memory/catalog";
import { TemplatePreview } from "@/components/marketing/template-preview";
import { getTemplateOrDefault, TEMPLATES } from "@/lib/catalog/templates";
import type { TemplateDefinition } from "@/lib/catalog/types";
import { cn } from "@/lib/utils/cn";

export function TemplateStep({
  selected,
  category,
  reelTemplateId,
  title,
  onSelect,
  onReelSelect,
}: {
  selected: string;
  category: string;
  reelTemplateId: string;
  title: string;
  onSelect: (template: TemplateDefinition) => void;
  onReelSelect: (template: MemoryTemplate) => void;
}) {
  const selectedTemplate = getTemplateOrDefault(selected);

  return (
    <div>
      <h2 className="font-serif text-3xl italic leading-tight text-ink">
        Pick a look.
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        Background, type and photo layout. You can change this later.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
          {TEMPLATES.map((template) => {
            const active = template.id === selected;
            return (
              <li key={template.id}>
                <button
                  type="button"
                  onClick={() => onSelect(template)}
                  aria-pressed={active}
                  aria-label={`${template.name} template`}
                  className={cn(
                    "block w-full rounded-card p-1 transition",
                    active
                      ? "ring-2 ring-coral"
                      : "hover:opacity-95 focus-visible:opacity-95",
                  )}
                >
                  <TemplatePreview
                    template={template}
                    title={title || "For you"}
                  />
                </button>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{template.name}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    {template.tone === "calm" ? "Calm" : "Celebratory"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Live preview
            </p>
            <div className="mt-3">
              <TemplatePreview
                template={selectedTemplate}
                title={title || "For you"}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              {selectedTemplate.tagline}
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-8 rounded-card border border-hairline bg-surface p-5">
        <MemoryTemplatePicker
          category={category}
          value={reelTemplateId}
          onChange={onReelSelect}
        />
      </div>
    </div>
  );
}
