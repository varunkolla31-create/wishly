import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

const FOOTER_LINKS = [
  { href: "/occasions/birthday", label: "Occasions" },
  { href: "/templates", label: "3D reels" },
  { href: "/studio", label: "Studio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-sand">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-xs text-sm text-ink-muted">
            Wish pages made to be opened slowly, with the people who matter.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-3">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <p className="text-xs text-ink-muted">
          © {new Date().getFullYear()} Wishly. Crafted for moments worth keeping.
        </p>
      </div>
    </footer>
  );
}
