"use client";

import { UserButton } from "@clerk/nextjs";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function UserMenu({ name, email }: { name: string; email: string }) {
  const label = name || email || "Account";

  if (!clerkEnabled) {
    return (
      <span
        title={`${label} (dev auth bypass)`}
        className="hidden rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-ink-muted sm:inline-flex"
      >
        Dev mode
      </span>
    );
  }

  return <UserButton />;
}
