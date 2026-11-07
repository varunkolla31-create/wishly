export default function WishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-dvh bg-canvas text-ink">{children}</div>
  );
}
