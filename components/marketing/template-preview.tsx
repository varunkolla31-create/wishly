import Image from "next/image";
import type { ReactNode } from "react";
import type { TemplateDefinition } from "@/lib/catalog/types";
import { cn } from "@/lib/utils/cn";

interface TemplatePreviewProps {
  template: TemplateDefinition;
  title?: string;
  className?: string;
  flat?: boolean;
  /** Rendered in a dedicated footer row so it can never overlap the card copy. */
  badge?: ReactNode;
  /** Richer hero treatment: photo thumbnails, editorial lines and soft shadows. */
  rich?: boolean;
  photos?: string[];
}

export function TemplatePreview({
  template,
  title = "For you, always",
  className,
  flat = false,
  badge,
  rich = false,
  photos,
}: TemplatePreviewProps) {
  const { palette, preview } = template;
  const thumbs = (photos ?? []).slice(0, 3);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative aspect-[4/5] overflow-hidden",
        flat
          ? "rounded-none"
          : "rounded-card ring-1 ring-black/5 shadow-[0_18px_45px_-24px_rgba(28,27,26,0.55)]",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(160deg, ${preview.from}, ${preview.to})`,
      }}
    >
      {rich ? (
        <>
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.28), transparent 55%)`,
            }}
          />
          <span
            className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 4px)",
            }}
          />
        </>
      ) : null}

      <div className={cn("absolute inset-0 flex flex-col", rich ? "p-3 sm:p-4" : "p-4 sm:p-5")}>
        {flat ? null : (
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.14em]",
              rich && "text-[9px] tracking-[0.12em]",
            )}
            style={{ color: palette.muted }}
          >
            A wish for you
          </span>
        )}

        <div className={cn("mt-auto", rich ? "space-y-2" : "space-y-3")}>
          {rich ? (
            <div className="flex items-end gap-1.5">
              {thumbs.map((src, index) => (
                <span
                  key={`${src}-${index}`}
                  className="relative block overflow-hidden rounded-[6px] border border-white/50 bg-white/30 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.6)]"
                  style={{
                    width: index === 0 ? 40 : 32,
                    height: index === 0 ? 48 : 38,
                    transform: `rotate(${(index - 1) * 4}deg)`,
                    zIndex: 3 - index,
                  }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized
                    sizes="60px"
                    className="object-cover"
                  />
                </span>
              ))}
              <span
                className="ml-auto rounded-full border border-white/35 bg-white/25 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] backdrop-blur-md"
                style={{ color: palette.text }}
              >
                Private
              </span>
            </div>
          ) : (
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
          )}

          <p
            className={cn(
              "leading-tight",
              rich
                ? "line-clamp-2 text-sm drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)] sm:text-base"
                : "text-xl sm:text-2xl",
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

        {badge ? (
          <div
            className={cn(
              "flex justify-end",
              rich ? "mt-2 border-t border-white/20 pt-1.5" : "mt-3 border-t border-white/20 pt-2.5",
            )}
          >
            {badge}
          </div>
        ) : null}
      </div>
    </div>
  );
}
