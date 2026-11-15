import { cn } from "@/lib/utils/cn";

const ITEMS = [
  "No receiver sign-in",
  "Works in WhatsApp & Safari",
  "Delete anytime",
] as const;

/**
 * A single, quiet trust line. Pass `align="start"` in hero columns.
 */
export function TrustStrip({
  className,
  align = "center",
}: {
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-relaxed text-ink-muted",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
    >
      {ITEMS.map((item, index) => (
        <li key={item} className="flex items-center gap-2">
          {index > 0 ? (
            <span
              aria-hidden="true"
              className="size-1 rounded-full bg-ink-muted/40"
            />
          ) : null}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
