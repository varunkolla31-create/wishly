import type { TemplateDefinition } from "@/lib/catalog/types";
import { cn } from "@/lib/utils/cn";

interface TemplatePreviewProps {
  template: TemplateDefinition;
  title?: string;
  className?: string;
  flat?: boolean;
}

export function TemplatePreview({
  template,
  title = "For you, always",
  className,
  flat = false,
}: TemplatePreviewProps) {
  const { palette, preview } = template;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative aspect-[4/5] overflow-hidden",
        flat ? "rounded-none" : "rounded-card ring-1 ring-black/5",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(160deg, ${preview.from}, ${preview.to})`,
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5">
        {flat ? null : (
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: palette.muted }}
          >
            A wish for you
          </span>
        )}

        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <span
              className="h-12 w-9 rounded-md"
              style={{ backgroundColor: palette.surface }}
            />
            <span
              className="h-9 w-7 rounded-md opacity-80"
              style={{ backgroundColor: palette.surface }}
            />
            <span
              className="h-6 w-6 rounded-full opacity-70"
              style={{ backgroundColor: palette.accent }}
            />
          </div>

          <p
            className={cn(
              "text-xl leading-tight sm:text-2xl",
              template.titleStyle === "serif"
                ? "font-serif italic"
                : "font-sans font-semibold tracking-tight",
            )}
            style={{ color: palette.text }}
          >
            {title}
          </p>

          <span
            className="block h-1 w-10 rounded-full"
            style={{ backgroundColor: palette.accent }}
          />
        </div>
      </div>
    </div>
  );
}
