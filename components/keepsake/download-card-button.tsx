"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { downloadKeepsakeCard } from "@/lib/keepsake/card";
import { cn } from "@/lib/utils/cn";

export function DownloadCardButton({
  title,
  occasionName,
  url,
  qrDataUrl,
  hint,
  filename,
  className,
  variant = "outline",
  label = "Download card",
}: {
  title: string;
  occasionName?: string | null;
  url: string;
  qrDataUrl: string;
  hint?: string | null;
  filename?: string;
  className?: string;
  variant?: "outline" | "solid";
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    if (!qrDataUrl) {
      toast.error("The QR code is still being prepared.");
      return;
    }
    setBusy(true);
    try {
      await downloadKeepsakeCard({
        title,
        occasionName,
        url,
        qrDataUrl,
        hint,
        filename,
      });
      toast.success("Keepsake card downloaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't build the card.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy || !qrDataUrl}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors disabled:opacity-50",
        variant === "solid"
          ? "bg-ink text-canvas hover:opacity-90"
          : "border border-hairline bg-canvas text-ink hover:bg-hover",
        className,
      )}
    >
      <Download aria-hidden="true" className="size-4" />
      {busy ? "Preparing…" : label}
    </button>
  );
}
