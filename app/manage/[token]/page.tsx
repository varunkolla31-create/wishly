import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManageWish } from "@/components/manage/manage-wish";
import { isManageToken } from "@/lib/security/manage-token";
import { siteUrl } from "@/lib/config-public";
import { wishByManageToken } from "@/lib/wishes/anonymous";
import { isPublished } from "@/lib/wishes/public";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage your wish",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ManagePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // A malformed token is indistinguishable from an unknown one.
  if (!isManageToken(token)) notFound();

  const wish = await wishByManageToken(token);
  if (!wish) notFound();

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Private manage page
      </p>
      <h1 className="mt-2 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
        Your wish, kept here.
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
        This page is for you only. Save the link — anyone with it can delete the
        wish.
      </p>

      <div className="mt-8">
        <ManageWish
          token={token}
          details={{
            wishId: wish.wishId,
            title: wish.title || wish.receiverName || "Untitled wish",
            status: wish.status,
            published: isPublished(wish),
            createdAt: wish.createdAt,
            expiresAt: wish.expiresAt,
            shareUrl: `${siteUrl()}/w/${wish.wishId}`,
            views: wish.views,
            opened: wish.openedAt !== null,
            hasPassword: wish.passwordHash !== null,
          }}
        />
      </div>
    </main>
  );
}
