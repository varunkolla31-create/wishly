import type { Metadata } from "next";
import { NewWishButton } from "@/components/dashboard/new-wish-button";
import { SeedButton } from "@/components/dashboard/seed-button";
import { WishCard } from "@/components/dashboard/wish-card";
import { isDevAuthBypassEnabled } from "@/lib/auth/session";
import { requirePageSender } from "@/lib/auth/page";
import { replyRepo, wishRepo } from "@/lib/repos/index";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const sender = await requirePageSender();
  const wishes = await wishRepo().listByOwner(sender.userId);
  const replies = await replyRepo().listByOwner(sender.userId);

  const replyCounts = new Map<string, number>();
  for (const reply of replies) {
    replyCounts.set(reply.wishId, (replyCounts.get(reply.wishId) ?? 0) + 1);
  }

  const publishedCount = wishes.filter(
    (wish) => wish.status === "published" || wish.status === "locked",
  ).length;
  const firstName = sender.firstName || "there";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Dashboard
          </p>
          <h1 className="mt-2 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {wishes.length} {wishes.length === 1 ? "wish" : "wishes"} ·{" "}
            {publishedCount} live · {replies.length}{" "}
            {replies.length === 1 ? "reply" : "replies"}
          </p>
        </div>
        <NewWishButton size="lg" className="hidden sm:inline-flex" />
      </div>

      {wishes.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-hairline bg-surface px-6 py-16 text-center">
          <h2 className="font-serif text-3xl italic text-ink">
            No wishes yet.
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
            Start a draft, add the words and the photos, then send the link with
            a password they can use to open it.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <NewWishButton />
            {isDevAuthBypassEnabled() ? <SeedButton /> : null}
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishes.map((wish) => (
            <li key={wish.wishId}>
              <WishCard
                wish={wish}
                replyCount={replyCounts.get(wish.wishId) ?? 0}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
