"use client";

import { Check, Copy, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export interface ManageDetails {
  wishId: string;
  title: string;
  status: string;
  published: boolean;
  createdAt: string;
  expiresAt: string | null;
  shareUrl: string;
  views: number;
  opened: boolean;
  hasPassword: boolean;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Never";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(date);
}

function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  const target = Date.parse(iso);
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / (24 * 60 * 60 * 1000));
}

export function ManageWish({
  details,
  token,
}: {
  details: ManageDetails;
  token: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const remaining = daysLeft(details.expiresAt);

  async function copy() {
    try {
      await navigator.clipboard.writeText(details.shareUrl);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const response = await fetch(`/api/manage/${token}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("delete_failed");
      setDeleted(true);
      setConfirmOpen(false);
    } catch {
      toast.error("Couldn't delete that wish.");
    } finally {
      setBusy(false);
    }
  }

  if (deleted) {
    return (
      <div className="rounded-card border border-hairline bg-surface p-8 text-center">
        <h1 className="font-serif text-3xl italic text-ink">Deleted.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
          The wish, its photos, its voice notes and any replies are gone. The
          share link no longer opens anything.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-sm font-medium text-canvas"
        >
          Back to Wishly
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 text-xs font-semibold capitalize text-ink">
          {details.published ? "Published" : details.status}
        </span>
        <h1 className="mt-4 font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
          {details.title}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Created {formatDate(details.createdAt)}
        </p>

        <dl className="mt-6 grid gap-4 border-t border-hairline pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Views
            </dt>
            <dd className="mt-1 text-sm text-ink">{details.views}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Opened
            </dt>
            <dd className="mt-1 text-sm text-ink">
              {details.opened ? "Yes" : "Not yet"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Expires
            </dt>
            <dd className="mt-1 text-sm text-ink">
              {formatDate(details.expiresAt)}
              {remaining !== null && remaining >= 0 ? (
                <span className="ml-1 text-ink-muted">
                  ({remaining} {remaining === 1 ? "day" : "days"} left)
                </span>
              ) : null}
            </dd>
          </div>
        </dl>

        {remaining !== null && remaining <= 7 && remaining >= 0 ? (
          <p className="mt-4 rounded-media bg-sand px-4 py-3 text-xs leading-relaxed text-ink">
            This wish expires soon. Keep the link somewhere safe, or delete it
            yourself when you&apos;re done.
          </p>
        ) : null}
      </div>

      <div className="rounded-card border border-hairline bg-surface p-6">
        <h2 className="text-sm font-medium text-ink">Share link</h2>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={details.shareUrl}
            onFocus={(event) => event.currentTarget.select()}
            aria-label="Share link"
            className="min-h-12 min-w-0 flex-1 rounded-full border border-hairline bg-canvas px-4 text-sm text-ink"
          />
          <Button type="button" variant="outline" onClick={copy}>
            {copied ? (
              <Check aria-hidden="true" className="size-4" />
            ) : (
              <Copy aria-hidden="true" className="size-4" />
            )}
            Copy
          </Button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          {details.hasPassword
            ? "Send the password separately from this link. We can't read it back."
            : "This wish uses a memory quiz instead of a password."}
        </p>
        <Link
          href={details.shareUrl.replace(/^https?:\/\/[^/]+/, "")}
          className="mt-3 inline-block text-xs font-medium text-coral-strong hover:text-coral-hover"
        >
          Open the wish →
        </Link>
      </div>

      <div className="rounded-card border border-hairline bg-surface p-6">
        <h2 className="text-sm font-medium text-ink">Delete this wish</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          The page, photos, videos, voice notes, contributions and replies are
          removed. This cannot be undone.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Delete wish
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this wish?"
      >
        <p className="text-sm leading-relaxed text-ink-muted">
          {details.title} and everything attached to it will be deleted. This
          cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
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
            {busy ? "Deleting…" : "Delete wish"}
          </button>
        </div>
      </Dialog>

      <p className="text-center text-xs text-ink-muted">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="underline underline-offset-4 hover:text-ink"
        >
          Refresh status
        </button>
      </p>
    </div>
  );
}
