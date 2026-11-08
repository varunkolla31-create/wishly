import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { NavLinks } from "@/components/marketing/nav-links";
import { ThemeToggle } from "@/components/marketing/theme-toggle";

const NAV_LINKS = [
  { href: "/occasions", label: "Occasions" },
  { href: "/templates", label: "3D reels" },
  { href: "/studio", label: "Studio" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center md:flex">
          <NavLinks links={NAV_LINKS} />
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
