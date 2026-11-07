import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 ${className ?? ""}`}
      aria-label="Wishly home"
    >
      <span aria-hidden="true" className="size-2.5 rounded-full bg-coral" />
      <span className="font-serif text-xl italic leading-none text-ink">
        Wishly
      </span>
    </Link>
  );
}
