import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description:
    "Wishly is free during early access. Billing is not part of the current release.",
  path: "/pricing",
});

const billingEnabled = process.env.FEATURE_BILLING === "true";

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
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

      <div className="mt-10 rounded-card border border-hairline bg-sand p-6 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-medium text-ink">Early access</h2>
          <p className="font-serif text-3xl italic text-ink">₹0</p>
        </div>
        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-muted">
          <li>Unlimited wish pages while in early access.</li>
          <li>Photos, short videos, voice notes and music.</li>
          <li>Receiver never needs an account.</li>
          <li>Delete your wishes and their media at any time.</li>
        </ul>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-ink-muted">
        {billingEnabled
          ? "Paid plans are being finalised. Nothing on this page charges you."
          : "When paid plans arrive, early-access wishes will stay free. Billing is not part of this release."}
      </p>

      <ButtonLink href="/create" size="lg" className="mt-8">
        Create a wish
      </ButtonLink>
    </section>
  );
}
