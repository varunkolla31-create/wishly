export default function AppLoading() {
  return (
    <div className="min-h-dvh bg-sand">
      <div className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="h-5 w-24 animate-pulse rounded-full bg-sand" />
          <div className="h-10 w-28 animate-pulse rounded-full bg-sand" />
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="h-8 w-52 animate-pulse rounded-full bg-canvas" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded-full bg-canvas" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-card border border-hairline bg-canvas/70"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
