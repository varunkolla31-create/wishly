import Link from "next/link";
import { UserMenu } from "@/components/app/user-menu";
import { NewWishButton } from "@/components/dashboard/new-wish-button";
import { Logo } from "@/components/marketing/logo";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import type { Sender } from "@/lib/auth/session";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/replies", label: "Replies" },
];

export function AppHeader({ sender }: { sender: Sender }) {
  return (
    <header className="border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <nav aria-label="Sender" className="hidden items-center gap-1 sm:flex">
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
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu
            name={`${sender.firstName} ${sender.lastName}`.trim()}
            email={sender.email}
          />
          <NewWishButton />
        </div>
      </div>
    </header>
  );
}
