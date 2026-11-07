import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContributorForm } from "@/components/contributor/contributor-form";
import { getOccasion } from "@/lib/catalog/occasions";
import { resolveContributorWish } from "@/lib/wishes/contributor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add a memory",
  description: "Add a photo, video, voice note, or a few words.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ContributorPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const wish = await resolveContributorWish(token);

  if (!wish) notFound();

  const occasion = getOccasion(wish.category);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-sand px-4 py-12">
      <div className="w-full max-w-xl">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Wishly
        </p>
        <div className="mt-4">
          <ContributorForm
            token={token}
            receiverName={wish.receiverName}
            occasionName={occasion?.name ?? "Wish"}
          />
        </div>
      </div>
    </main>
  );
}
