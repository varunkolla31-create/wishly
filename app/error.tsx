"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { reportError } from "@/lib/monitoring";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { where: "app/error", digest: error.digest });
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-sand px-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Wishly
      </p>
      <h1 className="mt-3 font-serif text-4xl italic leading-tight text-ink">
        Something went sideways.
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
        Nothing you wrote was lost — drafts save as you go. Try again, or head
        back to the dashboard.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.assign("/")}>
          Go home
        </Button>
      </div>
    </main>
  );
}
