import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-sand px-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Wishly
      </p>
      <h1 className="mt-3 font-serif text-4xl italic leading-tight text-ink">
        You&apos;re offline.
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
        The page you were opening needs a connection. Reconnect and try again —
        your wish isn&apos;t going anywhere.
      </p>
      <ButtonLink href="/" size="lg" className="mt-8">
        Try again
      </ButtonLink>
    </main>
  );
}
