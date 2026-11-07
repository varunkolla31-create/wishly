import { TemplatePreview } from "@/components/marketing/template-preview";
import { StatusChip } from "@/components/dashboard/status-chip";
import { WishActions } from "@/components/dashboard/wish-actions";
import { getOccasion } from "@/lib/catalog/occasions";
import { getTemplateOrDefault } from "@/lib/catalog/templates";
import type { Wish } from "@/lib/repos/types";
import { formatRelative } from "@/lib/utils/format";

export function WishCard({
  wish,
  replyCount,
}: {
  wish: Wish;
  replyCount: number;
}) {
  const occasion = getOccasion(wish.category);
  const template = getTemplateOrDefault(wish.templateId);
  const title = wish.title || wish.receiverName || "An untitled wish";

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-hairline bg-surface">
      <div className="relative">
        <TemplatePreview template={template} title={title} flat />
        <div className="absolute left-3 top-3">
          <StatusChip status={wish.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {occasion?.name ?? "Wish"} · {wish.mode === "group" ? "Group" : "Solo"}
        </p>
        <h3 className="sr-only">{title}</h3>
        {wish.receiverName ? (
          <p className="mt-1 text-sm text-ink-muted">For {wish.receiverName}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3 text-xs text-ink-muted">
          <span>{wish.views} views</span>
          <span aria-hidden="true">·</span>
          <span>{replyCount} replies</span>
          <span aria-hidden="true">·</span>
          <span>Updated {formatRelative(wish.updatedAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-hairline px-2 py-1">
        <WishActions wishId={wish.wishId} status={wish.status} />
        {wish.status === "published" || wish.status === "locked" ? (
          <span className="pr-3 text-xs text-ink-muted">Live</span>
        ) : null}
      </div>
    </article>
  );
}
