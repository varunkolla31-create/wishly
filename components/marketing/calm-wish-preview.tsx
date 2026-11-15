import { Feather } from "lucide-react";

/**
 * A finished "calm mode" wish card used on the landing page. Unlike the
 * abstract TemplatePreview, this shows a real editorial layout and switches to
 * dark charcoal surfaces in dark mode instead of staying bright blue-grey.
 */
export function CalmWishPreview() {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-hairline bg-[#f4efe4] text-ink shadow-[0_22px_55px_-28px_rgba(28,27,26,0.45)] dark:border-white/10 dark:bg-[#151a1c] dark:shadow-[0_22px_55px_-24px_rgba(0,0,0,0.75)]">
      {/* Paper grain, tuned per theme. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(rgba(28,27,26,0.06) 0.7px, transparent 0.8px)",
          backgroundSize: "4px 4px",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden opacity-40 dark:block"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.07) 0.7px, transparent 0.8px)",
          backgroundSize: "4px 4px",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-8 size-40 rounded-full bg-[#7f9a8b]/15 blur-2xl dark:bg-[#7f9a8b]/10"
      />

      <div className="relative flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            A note for you
          </span>
          <Feather
            aria-hidden="true"
            className="size-5 text-[#7f9a8b] dark:text-[#9db4a6]"
            strokeWidth={1.4}
          />
        </div>

        <div className="mt-auto">
          <p className="font-serif text-3xl italic leading-[1.08] text-ink sm:text-4xl">
            Thinking of you today.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            No need to reply. Just know the kettle is on here, the light is
            low, and someone is holding you in their thoughts.
          </p>

          <div className="mt-5 flex items-end justify-between gap-3 border-t border-ink/10 pt-3 dark:border-white/10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                With love
              </p>
              <p className="mt-0.5 font-serif text-base italic text-ink">
                Varun
              </p>
            </div>
            <span className="rounded-full border border-ink/10 bg-white/40 px-2.5 py-1 text-[10px] font-medium text-ink-muted backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              14 Nov 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
