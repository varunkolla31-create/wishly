import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WishWizard } from "@/components/wizard/wish-wizard";
import { WIZARD_STEPS } from "@/components/wizard/types";
import { requirePageSender } from "@/lib/auth/page";
import { mediaKindFromKey } from "@/lib/media/validate";
import { toSenderWish } from "@/lib/repos/dto";
import { mediaStore, wishRepo } from "@/lib/repos/index";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit wish",
  robots: { index: false, follow: false },
};

interface EditWishPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}

export default async function EditWishPage({
  params,
  searchParams,
}: EditWishPageProps) {
  const sender = await requirePageSender();
  const { id } = await params;
  const { step } = await searchParams;

  const wish = await wishRepo().getById(id);
  if (!wish || wish.ownerId !== sender.userId) notFound();

  const store = mediaStore();
  const initialMedia = await Promise.all(
    wish.mediaKeys.map(async (key) => ({
      key,
      url: await store.createReadUrl(key),
      kind: mediaKindFromKey(key) ?? "photo",
    })),
  );

  const parsedStep = Number.parseInt(step ?? "1", 10);
  const initialStep = Number.isFinite(parsedStep)
    ? Math.max(0, Math.min(WIZARD_STEPS.length - 1, parsedStep - 1))
    : 0;

  return (
    <WishWizard
      wish={toSenderWish(wish)}
      initialMedia={initialMedia}
      initialStep={initialStep}
    />
  );
}
