import Link from "next/link";
import { OccasionIcon } from "@/components/marketing/occasion-icon";
import type { Occasion } from "@/lib/catalog/types";

export function OccasionGrid({ occasions }: { occasions: Occasion[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {occasions.map((occasion) => (
        <li key={occasion.slug}>
          <Link
            href={`/occasions/${occasion.slug}`}
            className="flex min-h-20 items-center gap-3 rounded-card border border-hairline bg-surface px-4 py-4 transition-colors hover:bg-hover"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sand text-ink">
              <OccasionIcon icon={occasion.icon} className="size-5" />
            </span>
            <span className="text-sm font-medium leading-snug text-ink">
              {occasion.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
