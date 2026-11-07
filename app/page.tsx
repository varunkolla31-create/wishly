export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-canvas px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Wishly
      </p>
      <h1 className="max-w-2xl font-serif text-5xl italic leading-[1.05] text-ink sm:text-6xl md:text-7xl">
        A wish they can unlock.
      </h1>
      <p className="max-w-md text-base leading-relaxed text-ink-muted">
        Password-protected wish pages for birthdays, weddings, and every small
        moment in between.
      </p>
    </main>
  );
}
