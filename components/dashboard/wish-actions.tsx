"use client";

import { Copy, CopyPlus, QrCode, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import type { WishStatus } from "@/lib/repos/types";

const actionClass =
  "flex size-12 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-hover hover:text-ink disabled:pointer-events-none disabled:opacity-50";

interface WishActionsProps {
  wishId: string;
  status: WishStatus;
}

export function WishActions({ wishId, status }: WishActionsProps) {
  const router = useRouter();
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const isPublic = status === "published" || status === "locked";

  function publicUrl(): string {
    return `${window.location.origin}/w/${wishId}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl());
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  async function showQr() {
    try {
      const QRCode = await import("qrcode");
      const data = await QRCode.toDataURL(publicUrl(), {
        margin: 1,
        width: 480,
        color: { dark: "#1C1B1A", light: "#FFFFFF" },
      });
      setQrData(data);
      setQrOpen(true);
    } catch {
      toast.error("Couldn't build the QR code.");
    }
  }

  async function duplicate() {
    setBusy(true);
    try {
      const response = await fetch(`/api/wishes/${wishId}/duplicate`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("duplicate_failed");
      toast.success("Wish duplicated as a draft");
      router.refresh();
    } catch {
      toast.error("Couldn't duplicate that wish.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const response = await fetch(`/api/wishes/${wishId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("delete_failed");
      setDeleteOpen(false);
      toast.success("Wish deleted");
      router.refresh();
    } catch {
      toast.error("Couldn't delete that wish.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center">
      {isPublic ? (
        <>
          <button
            type="button"
            onClick={copyLink}
            className={actionClass}
            aria-label="Copy wish link"
            title="Copy link"
          >
            <Copy aria-hidden="true" className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={showQr}
            className={actionClass}
            aria-label="Show QR code"
            title="QR code"
          >
            <QrCode aria-hidden="true" className="size-[18px]" />
          </button>
        </>
      ) : null}

      <button
        type="button"
        onClick={duplicate}
        disabled={busy}
        className={actionClass}
        aria-label="Duplicate wish"
        title="Duplicate"
      >
        <CopyPlus aria-hidden="true" className="size-[18px]" />
      </button>

      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        disabled={busy}
        className={actionClass}
        aria-label="Delete wish"
        title="Delete"
      >
        <Trash2 aria-hidden="true" className="size-[18px]" />
      </button>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} title="Scan to open">
        <div className="space-y-4">
          {qrData ? (
            <>
              <Image
                src={qrData}
                alt="QR code for this wish link"
                width={224}
                height={224}
                unoptimized
                className="mx-auto size-56 rounded-media border border-hairline"
              />
              <p className="break-all rounded-media bg-sand px-3 py-2 text-xs text-ink-muted">
                {publicUrl()}
              </p>
            </>
          ) : null}
          <button
            type="button"
            onClick={copyLink}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-canvas"
          >
            <Copy aria-hidden="true" className="size-4" />
            Copy link
          </button>
        </div>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this wish?"
      >
        <p className="text-sm leading-relaxed text-ink-muted">
          The link, photos, voice notes and replies go with it. This cannot be
          undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            className="flex min-h-12 items-center rounded-full px-5 text-sm font-medium text-ink transition-colors hover:bg-hover"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="flex min-h-12 items-center rounded-full bg-ink px-5 text-sm font-medium text-canvas disabled:opacity-50"
          >
            Delete wish
          </button>
        </div>
      </Dialog>
    </div>
  );
}
