import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Share2 } from "lucide-react";
import type { CanvaVideoTemplate } from "@/lib/catalog/canva-videos";
import type { TemplateStats } from "@/lib/catalog/ranking";

export function CanvaVideoCard({
  template,
  stats,
  liked,
  shared,
  onSelect,
  onLike,
  onShare,
}: {
  template: CanvaVideoTemplate;
  stats: TemplateStats;
  liked: boolean;
  shared: boolean;
  onSelect: (template: CanvaVideoTemplate) => void;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
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
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="min-w-0 truncate text-xs text-ink-muted">
            {template.categoryName}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onLike(template.id)}
              aria-pressed={liked}
              aria-label={`Like ${template.title}`}
              className="inline-flex min-h-7 items-center gap-1 rounded-full px-1.5 text-xs text-ink-muted transition-colors hover:text-coral-strong"
            >
              <Heart
                aria-hidden="true"
                className={`size-3.5 ${liked ? "fill-coral-strong text-coral-strong" : ""}`}
              />
              {stats.likes > 0 ? stats.likes : ""}
            </button>
            <button
              type="button"
              onClick={() => onShare(template.id)}
              aria-label={`Copy a link to ${template.title}`}
              className="inline-flex min-h-7 items-center gap-1 rounded-full px-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
            >
              <Share2 aria-hidden="true" className="size-3.5" />
              {shared ? "Copied" : ""}
            </button>
            <Link
              href={`/studio/${template.id}`}
              className="inline-flex min-h-7 items-center gap-1 rounded-full px-1.5 text-xs font-semibold text-coral-strong hover:text-coral-hover"
            >
              Create
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
