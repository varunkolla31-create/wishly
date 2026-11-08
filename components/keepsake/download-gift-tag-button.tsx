"use client";

import { Gift } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { downloadGiftTag } from "@/lib/keepsake/gift-tag";
import { cn } from "@/lib/utils/cn";

export function DownloadGiftTagButton({
  title,
  url,
  hint,
  qrDataUrl,
  filename,
  className,
  variant = "outline",
  label = "Download QR gift tag",
  iconOnly = false,
}: {
  title: string;
  url: string;
  hint?: string | null;
  qrDataUrl?: string | null;
  filename?: string;
  className?: string;
  variant?: "outline" | "solid";
  label?: string;
  iconOnly?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    if (!url) {
      toast.error("The link isn't ready yet.");
      return;
    }
    setBusy(true);
    try {
      let qr = qrDataUrl ?? "";
      if (!qr) {
        const QRCode = await import("qrcode");
        qr = await QRCode.toDataURL(url, {
          margin: 1,
          width: 640,
          color: { dark: "#1C1B1A", light: "#FFFFFF" },
        });
      }
      await downloadGiftTag({ title, hint, url, qrDataUrl: qr, filename });
      toast.success("QR gift tag downloaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't build the gift tag.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      aria-label={iconOnly ? "Download printable QR gift card" : undefined}
      title={iconOnly ? "QR gift tag" : undefined}
      className={cn(
        iconOnly
          ? "flex size-12 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-hover hover:text-ink disabled:pointer-events-none disabled:opacity-50"
          : "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors disabled:opacity-50",
        !iconOnly
          ? variant === "solid"
            ? "bg-ink text-canvas hover:opacity-90"
            : "border border-hairline bg-canvas text-ink hover:bg-hover"
          : "",
        className,
      )}
    >
      <Gift aria-hidden="true" className={iconOnly ? "size-[18px]" : "size-4"} />
      {iconOnly ? null : busy ? "Preparing…" : label}
    </button>
  );
}
