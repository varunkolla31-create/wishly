import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DemoWish } from "@/components/receiver/demo-wish";
import { GuestWishPage } from "@/components/receiver/guest-wish";
import { LockScreen } from "@/components/receiver/lock-screen";
import { getDemoWish } from "@/lib/demo/wishes";
import { wishRepo } from "@/lib/repos/index";
import {
  isPublished,
  isUnlockTimeReached,
  toPublicWishMeta,
} from "@/lib/wishes/public";
import { hasUnlocked } from "@/lib/wishes/unlocked";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const title = "A private Wishly page is waiting for you";
  const description =
    "Someone sent you a private, password-protected memory reel. Tap to unlock — no sign-in needed.";
  const image = `/w/${id}/opengraph-image`;

  return {
    title,
    description,
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      title,
      description,
      siteName: "Wishly",
      type: "website",
      url: `/w/${id}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "A locked gift box from Wishly",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function WishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id.startsWith("guest-")) {
    return <GuestWishPage guestId={id} />;
  }

  const demo = getDemoWish(id);
  if (demo) return <DemoWish wish={demo} />;

  const wish = await wishRepo().getById(id);

  if (!wish || !isPublished(wish)) notFound();

  if (isUnlockTimeReached(wish) && (await hasUnlocked(wish))) {
    redirect(`/w/${id}/reveal`);
  }

  return <LockScreen wish={toPublicWishMeta(wish)} />;
}
