import type { Metadata } from "next";
import { requirePageSender } from "@/lib/auth/page";
import { replyRepo, wishRepo } from "@/lib/repos/index";
import { formatRelative } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Replies",
  robots: { index: false, follow: false },
};

export default async function RepliesPage() {
  const sender = await requirePageSender();
  const [replies, wishes] = await Promise.all([
    replyRepo().listByOwner(sender.userId),
    wishRepo().listByOwner(sender.userId),
  ]);

  const titles = new Map(
    wishes.map((wish) => [
      wish.wishId,
      wish.title || wish.receiverName || "An untitled wish",
    ]),
  );

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Replies
      </p>
      <h1 className="mt-2 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
        What they sent back.
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Thank-you notes and reactions from the people who opened your wishes.
      </p>

      {replies.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-hairline bg-surface px-6 py-16 text-center">
          <h2 className="font-serif text-3xl italic text-ink">
            Nothing here yet.
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
            When someone unlocks a wish and sends a reply, it will land here.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {replies.map((reply) => (
            <li
              key={reply.replyId}
              className="rounded-card border border-hairline bg-surface p-5"
            >
              <div className="flex items-start gap-4">
                <span aria-hidden="true" className="text-2xl leading-none">
                  {reply.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-ink">
                    {reply.message}
                  </p>
                  <p className="mt-2 text-xs text-ink-muted">
                    On {titles.get(reply.wishId) ?? "a wish"} ·{" "}
                    {formatRelative(reply.createdAt)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
