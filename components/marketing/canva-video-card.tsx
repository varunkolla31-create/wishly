import Image from "next/image";
import type { CanvaVideoTemplate } from "@/lib/catalog/canva-videos";

export function CanvaVideoCard({
  template,
  onSelect,
}: {
  template: CanvaVideoTemplate;
  onSelect: (template: CanvaVideoTemplate) => void;
}) {
  return (
    <article className="group">
      <button
        type="button"
        onClick={() => onSelect(template)}
        aria-label={`Preview ${template.title}`}
        className="block w-full overflow-hidden rounded-card bg-sand text-left ring-1 ring-black/5 transition duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
      >
        <div className="relative aspect-[16/10]">
          <Image
            src={template.thumb}
            alt={template.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            unoptimized
            className="object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
          <span className="absolute left-2 top-2 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-canvas">
            {template.plan_tier === "FREE" ? "Free" : "Pro"}
          </span>
          <span className="absolute right-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-semibold text-ink">
            {template.aspect_ratio}
          </span>
        </div>
      </button>
      <div className="mt-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink">
          {template.title}
        </h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-xs text-ink-muted">{template.categoryName}</span>
          <button
            type="button"
            onClick={() => onSelect(template)}
            className="shrink-0 text-xs font-semibold text-coral-strong hover:text-coral-hover"
          >
            Preview
          </button>
        </div>
      </div>
    </article>
  );
}
