import type { Metadata } from "next";

/**
 * Every receiver-facing page is private by default. The `X-Robots-Tag` header
 * is set in `next.config.ts` for the whole `/w/*` tree; this adds the matching
 * `<meta name="robots">` so a crawler that ignores headers still sees it.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function WishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-dvh bg-canvas text-ink">{children}</div>
  );
}
