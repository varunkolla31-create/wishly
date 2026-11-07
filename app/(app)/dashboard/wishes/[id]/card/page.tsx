import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { DownloadCardButton } from "@/components/keepsake/download-card-button";
import { requirePageSender } from "@/lib/auth/page";
import { getOccasion } from "@/lib/catalog/occasions";
import { env } from "@/lib/env";
import { wishRepo } from "@/lib/repos/index";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Print card",
  robots: { index: false, follow: false },
};

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sender = await requirePageSender();
  const { id } = await params;

  const wish = await wishRepo().getById(id);
  if (!wish || wish.ownerId !== sender.userId) notFound();

  const url = `${env().APP_URL}/w/${wish.wishId}`;
  const qr = await QRCode.toDataURL(url, {
    margin: 1,
    width: 560,
    color: { dark: "#1C1B1A", light: "#FFFFFF" },
  });

  const occasion = getOccasion(wish.category);
  const title = wish.title || wish.receiverName || "A wish for you";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 print:px-0 print:py-0">
      <div className="print:hidden">
        <Link
          href={`/dashboard/wishes/${id}/edit`}
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← Back to the wish
        </Link>
        <h1 className="mt-3 font-serif text-3xl italic text-ink">
          Print the keepsake card.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          A5, black on white. Hand it over with the password written separately.
          The QR still requires the password to open.
        </p>
      </div>

      <article className="mx-auto mt-8 w-full max-w-[120mm] rounded-card border border-hairline bg-canvas p-10 text-center text-ink print:mt-0 print:rounded-none print:border-0 print:p-0">
        <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          <span aria-hidden="true" className="size-2 rounded-full bg-coral" />
          Wishly
        </p>

        <h2 className="mt-5 font-serif text-3xl italic leading-tight">
          {title}
        </h2>

        <p className="mt-2 text-xs text-ink-muted">
          {occasion ? `${occasion.name} · ` : ""}Scan to open your surprise.
        </p>

        {/* Server-rendered data URL: no client JS needed to print this. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qr}
          alt="QR code for this wish link"
          width={240}
          height={240}
          className="mx-auto mt-6 size-60 rounded-media border border-hairline"
        />

        <p className="mt-4 break-all text-[10px] text-ink-muted">{url}</p>

        <p className="mt-5 rounded-full bg-sand px-4 py-2 text-[11px] text-ink-muted">
          Password: the one you were given
        </p>

        {wish.passwordHint ? (
          <p className="mt-3 text-[11px] text-ink-muted">
            Hint: {wish.passwordHint}
          </p>
        ) : null}
      </article>

      <div className="mt-8 print:hidden">
        <p className="text-xs leading-relaxed text-ink-muted">
          Use your browser&apos;s print dialog (Ctrl/Cmd + P) and choose A5 or
          fit-to-page, or download the card as a PNG.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <DownloadCardButton
            title={title}
            occasionName={occasion?.name}
            url={url}
            qrDataUrl={qr}
            hint={wish.passwordHint}
            filename={`wishly-card-${wish.wishId}.png`}
          />
        </div>
      </div>
    </main>
  );
}
