import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { MobileNav } from "@/components/marketing/mobile-nav";
import { NavLinks } from "@/components/marketing/nav-links";
import { ThemeToggle } from "@/components/marketing/theme-toggle";

const NAV_LINKS = [
  { href: "/occasions", label: "Occasions" },
  { href: "/templates", label: "3D reels" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/80 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Logo className="shrink-0" />

        <nav aria-label="Primary" className="hidden items-center md:flex">
          <NavLinks links={NAV_LINKS} />
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink href="/create" aria-label="Create a wish">
            {/* Only one of these is visible at a time; the other is hidden from
                assistive tech so the link is never announced as
                "Create a wishCreate". */}
            <span aria-hidden="true" className="hidden sm:inline">
              Create a wish
            </span>
            <span aria-hidden="true" className="sm:hidden">
              Create
            </span>
          </ButtonLink>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
