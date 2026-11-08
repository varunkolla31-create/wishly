"use client";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-6 py-12 text-ink">
      <div className="w-full max-w-md rounded-card border border-hairline bg-surface p-8 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Sign-in
        </p>
        <h1 className="mt-3 font-serif text-3xl italic">
          Something interrupted the form.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {error.message || "The auth widget couldn't finish loading."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-canvas"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
