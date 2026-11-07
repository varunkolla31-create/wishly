import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ContributorLinkPanel,
  ModerationList,
} from "@/components/dashboard/moderation";
import { requirePageSender } from "@/lib/auth/page";
import { getOccasion } from "@/lib/catalog/occasions";
import { contributionRepo, wishRepo } from "@/lib/repos/index";
import { toSenderContributions } from "@/lib/wishes/contributions-dto";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collect memories",
  robots: { index: false, follow: false },
};

export default async function CollectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sender = await requirePageSender();
  const { id } = await params;

  const wish = await wishRepo().getById(id);
  if (!wish || wish.ownerId !== sender.userId) notFound();

  const contributions = await contributionRepo().listByWish(id);
  const items = await toSenderContributions(contributions);
  const pending = items.filter((item) => item.status === "pending").length;
  const occasion = getOccasion(wish.category);

  return (
    <>
      <Link
        href={`/dashboard/wishes/${id}/edit`}
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        ← Back to the wish
      </Link>

      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Collect
      </p>
      <h1 className="mt-2 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
        Gather {wish.receiverName || "their"} people.
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
        {wish.mode === "group"
          ? "Share the link, approve what feels right, and it becomes a memory wall in the reveal."
          : "This wish is solo right now. Create a contributor link to let friends add their own memories."}
        {occasion ? ` ${occasion.name}.` : ""}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl italic text-ink">
              Waiting and approved
            </h2>
            {pending > 0 ? (
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-warning">
                {pending} to review
              </span>
            ) : null}
          </div>
          <ModerationList wishId={id} items={items} />
        </section>

        <aside className="space-y-4">
          <ContributorLinkPanel
            wishId={id}
            token={wish.contributorTokenRevokedAt ? null : wish.contributorToken}
          />
          <div className="rounded-card border border-hairline bg-sand p-5">
            <h2 className="text-sm font-medium text-ink">How it works</h2>
            <ol className="mt-2 space-y-2 text-xs leading-relaxed text-ink-muted">
              <li>1. Share the contributor link.</li>
              <li>2. Friends add a photo, video, voice note, or message.</li>
              <li>3. You approve, hide, remove, or reorder them.</li>
              <li>4. Approved items appear in the memory wall after unlock.</li>
            </ol>
          </div>
        </aside>
      </div>
    </>
  );
}
