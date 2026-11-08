"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export interface NavLinkItem {
  href: string;
  label: string;
}

export function NavLinks({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const base = link.href.split("#")[0] ?? link.href;
        const active =
          base === "/"
            ? pathname === "/"
            : pathname === base || pathname.startsWith(`${base}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sand font-medium text-ink"
                : "text-ink-muted hover:bg-hover hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
