export default function AuthLoading() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="hidden bg-sand p-12 lg:block">
        <div className="h-6 w-24 animate-pulse rounded-full bg-canvas/70" />
        <div className="mt-64 max-w-md space-y-4">
          <div className="h-4 w-36 animate-pulse rounded-full bg-canvas/70" />
          <div className="h-12 w-full animate-pulse rounded-2xl bg-canvas/70" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-canvas/70" />
        </div>
      </aside>
      <main className="flex items-center justify-center bg-canvas px-4 py-12 sm:px-8">
        <div className="w-full max-w-md rounded-card border border-hairline bg-surface p-8 shadow-soft">
          <div className="mx-auto h-6 w-40 animate-pulse rounded-full bg-sand" />
          <div className="mx-auto mt-4 h-4 w-56 animate-pulse rounded-full bg-sand" />
          <div className="mt-8 space-y-3">
            <div className="h-12 animate-pulse rounded-full bg-sand" />
            <div className="h-12 animate-pulse rounded-full bg-sand" />
            <div className="h-12 animate-pulse rounded-full bg-sand" />
          </div>
        </div>
      </main>
    </div>
  );
}
