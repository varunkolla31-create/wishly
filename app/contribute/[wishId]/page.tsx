import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { wishRepo } from "@/lib/repos/index";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add a memory",
  description: "Add a note or a photo without creating an account.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ContributeByWishPage({
  params,
}: {
  params: Promise<{ wishId: string }>;
}) {
  const { wishId } = await params;
  const wish = await wishRepo().getById(wishId);

  if (!wish) notFound();

  if (wish.mode === "group" && wish.contributorToken) {
    redirect(`/c/${wish.contributorToken}`);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-sand px-4 py-12">
      <div className="w-full max-w-md rounded-card border border-hairline bg-surface p-8 text-center shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Wishly
        </p>
        <h1 className="mt-4 font-serif text-3xl italic leading-tight text-ink">
          This page isn&apos;t collecting notes.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          The sender is keeping this one solo. If you have the link and password,
          you can still open the wish.
        </p>
        <Link
          href={`/w/${wishId}`}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
        >
          Open the wish
        </Link>
      </div>
    </main>
  );
}
