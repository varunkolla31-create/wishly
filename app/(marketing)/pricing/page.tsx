import type { Metadata } from "next";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { NotifyMeForm } from "@/components/marketing/notify-me-form";
import { Reveal } from "@/components/ui/reveal";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description:
    "Wishly is free during early access. Billing is not part of the current release.",
  path: "/pricing",
});

const billingEnabled = process.env.FEATURE_BILLING === "true";

const EARLY_ACCESS_FEATURES = [
  "Unlimited wish pages while in early access.",
  "Photos, short videos, voice notes and music.",
  "Receiver never needs an account.",
  "Delete your wishes and their media at any time.",
];

/** Explicitly not built. The label on each card says so too. */
const PLANNED = [
  {
    title: "Longer-lived wishes",
    body: "Wishes that stay online for years instead of expiring, with more storage for photos and video.",
  },
  {
    title: "Group wishes for everyone",
    body: "Contributor links without needing an account first, and a bigger memory wall.",
  },
  {
    title: "A custom domain for your page",
    body: "Serving a wish from your own domain, with the same private link behaviour.",
  },
];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Pricing
        </p>
        <h1 className="mt-3 font-serif text-5xl italic leading-[1.05] text-ink sm:text-6xl">
          Free while we&apos;re building.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          Wishly is in early access. Creating, publishing and opening wish pages
          costs nothing right now, and there is no card to add.
        </p>
      </Reveal>

      <TrustStrip className="mt-6" align="start" />

      <Reveal delay={0.08} className="mt-8">
        <div className="relative overflow-hidden rounded-card border border-coral/25 bg-sand p-6 shadow-[0_24px_70px_-38px_rgba(194,24,79,0.55)] ring-1 ring-coral/10 sm:p-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-coral/10 blur-3xl"
          />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-coral-strong">
                Early access
              </p>
              <h2 className="mt-1 text-lg font-medium text-ink">
                Everything, for nothing
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                No card. No trial clock. No receiver sign-in.
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-4xl italic leading-none text-ink">₹0</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
                while in beta
              </p>
            </div>
          </div>

          <ul className="relative mt-6 space-y-3 border-t border-ink/10 pt-5 text-sm leading-relaxed text-ink dark:border-white/10">
            {EARLY_ACCESS_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-coral-strong/10 text-coral-strong">
                  <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <ButtonLink href="/create" size="lg" className="relative mt-7 w-full sm:w-auto">
            Create a wish
          </ButtonLink>
        </div>
      </Reveal>

      <p className="mt-6 text-sm leading-relaxed text-ink-muted">
        {billingEnabled
          ? "Paid plans are being finalised. Nothing on this page charges you."
          : "When paid plans arrive, early-access wishes will stay free. Billing is not part of this release."}
      </p>

      <Reveal delay={0.12} className="mt-12 border-t border-hairline pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          What&apos;s planned
        </p>
        <h2 className="mt-3 font-serif text-3xl italic leading-tight text-ink">
          Nothing here is for sale yet.
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted">
          These are the ideas we are working towards. None of them is built, and
          nothing is charged today — they are listed so you know roughly where
          this is going.
        </p>

        <ul className="mt-6 space-y-3">
          {PLANNED.map((item) => (
            <li
              key={item.title}
              className="rounded-card border border-hairline bg-surface px-5 py-4"
            >
              <p className="text-sm font-medium text-ink">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {item.body}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-warning">
                Planned, not built
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-card border border-hairline bg-sand p-5">
          <h3 className="text-sm font-medium text-ink">
            Want a note when it&apos;s ready?
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            One email, when paid plans actually exist. No newsletter.
          </p>
          <div className="mt-4">
            <NotifyMeForm />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
