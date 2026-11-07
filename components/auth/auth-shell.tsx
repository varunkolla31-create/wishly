import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

export function AuthShell({
  mode,
  children,
}: {
  mode: "sign-in" | "sign-up";
  children: React.ReactNode;
}) {
  const copy =
    mode === "sign-in"
      ? {
          title: "Welcome back to Wishly",
          body: "Your drafts, your pages, and the replies waiting for you. Pick up exactly where you left off.",
        }
      : {
          title: "Make something they keep",
          body: "A private page, a password, and a few words. It takes a few minutes; it stays with them much longer.",
        };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sand p-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(55% 45% at 15% 8%, rgba(255,56,92,0.10) 0%, transparent 62%), radial-gradient(50% 45% at 92% 92%, rgba(214,194,131,0.22) 0%, transparent 62%)",
          }}
        />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Wish pages, unlocked
          </p>
          <h1 className="mt-4 font-serif text-5xl italic leading-[1.05] text-ink xl:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink-muted">
            {copy.body}
          </p>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-ink-muted">
          <span aria-hidden="true" className="size-2 rounded-full bg-coral" />
          Private by default. The receiver never signs in.
        </div>
      </aside>

      <main className="flex flex-col items-center justify-center bg-canvas px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {children}
          <p className="mt-8 text-center text-xs leading-relaxed text-ink-muted">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-ink">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
