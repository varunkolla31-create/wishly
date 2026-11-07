import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LockScreen } from "@/components/receiver/lock-screen";
import { wishRepo } from "@/lib/repos/index";
import {
  isPublished,
  isUnlockTimeReached,
  toPublicWishMeta,
} from "@/lib/wishes/public";
import { hasUnlocked } from "@/lib/wishes/unlocked";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "A wish for you",
  description:
    "Someone made something for you. Unlock it with the password they shared.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: "A wish for you",
    description: "Someone made something for you.",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "A wish for you",
    description: "Someone made something for you.",
  },
};

export default async function WishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wish = await wishRepo().getById(id);

  if (!wish || !isPublished(wish)) notFound();

  if (isUnlockTimeReached(wish) && (await hasUnlocked(wish))) {
    redirect(`/w/${id}/reveal`);
  }

  return <LockScreen wish={toPublicWishMeta(wish)} />;
}
