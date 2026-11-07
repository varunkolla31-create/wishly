import type { WishStatus } from "@/lib/repos/types";
import { cn } from "@/lib/utils/cn";

const LABELS: Record<WishStatus, string> = {
  draft: "Draft",
  collecting: "Collecting",
  published: "Published",
  locked: "Locked",
};

const DOTS: Record<WishStatus, string> = {
  draft: "bg-ink-muted",
  collecting: "bg-warning",
  published: "bg-success",
  locked: "bg-ink",
};

export function StatusChip({ status }: { status: WishStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink shadow-soft backdrop-blur">
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", DOTS[status])}
      />
      {LABELS[status]}
    </span>
  );
}
