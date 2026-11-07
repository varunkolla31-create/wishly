import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { WrapGate } from "@/components/receiver/wrap-gate";
import { getDemoWish } from "@/lib/demo/wishes";
import { wishRepo } from "@/lib/repos/index";
import {
  buildWishContent,
  isPublished,
  isUnlockTimeReached,
} from "@/lib/wishes/public";
import { hasUnlocked } from "@/lib/wishes/unlocked";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your wish",
  robots: { index: false, follow: false, nocache: true },
};

export default async function RevealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (getDemoWish(id)) redirect(`/w/${id}`);

  const wish = await wishRepo().getById(id);

  if (!wish || !isPublished(wish)) notFound();

  if (!isUnlockTimeReached(wish) || !(await hasUnlocked(wish))) {
    redirect(`/w/${id}`);
  }

  const content = await buildWishContent(wish);

  return <WrapGate content={content} />;
}
