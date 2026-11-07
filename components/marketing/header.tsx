import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { ThemeToggle } from "@/components/marketing/theme-toggle";

const NAV_LINKS = [
  { href: "/occasions/birthday", label: "Occasions" },
  { href: "/templates", label: "Templates" },
  { href: "/studio", label: "3D reels" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-hover hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink href="/dashboard">
            <span className="hidden sm:inline">Create a wish</span>
            <span className="sm:hidden">Create</span>
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
