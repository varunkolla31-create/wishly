"use client";

import { Check, EyeOff, Trash2, Undo2, ArrowDown, ArrowUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { SenderContribution } from "@/lib/wishes/contributions-dto";
import { cn } from "@/lib/utils/cn";

const smallAction =
  "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-hairline bg-canvas px-3 text-xs font-medium text-ink transition-colors hover:bg-hover disabled:opacity-50";

export function ModerationList({
  wishId,
  items,
}: {
  wishId: string;
  items: SenderContribution[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [order, setOrder] = useState(items.map((item) => item.contributionId));

  const ordered = order
    .map((id) => items.find((item) => item.contributionId === id))
    .filter((item): item is SenderContribution => Boolean(item));

  async function setStatus(contributionId: string, status: string) {
    setBusyId(contributionId);
    try {
      const response = await fetch(
        `/api/wishes/${wishId}/contributions/${contributionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      if (!response.ok) throw new Error("update_failed");
      toast.success(
        status === "approved"
          ? "Added to the wall"
          : status === "hidden"
            ? "Hidden"
            : "Back in review",
      );
      router.refresh();
    } catch {
      toast.error("Couldn't update that one.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(contributionId: string) {
    setBusyId(contributionId);
    try {
      const response = await fetch(
        `/api/wishes/${wishId}/contributions/${contributionId}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("delete_failed");
      setOrder((current) => current.filter((id) => id !== contributionId));
      toast.success("Removed");
      router.refresh();
    } catch {
      toast.error("Couldn't remove that one.");
    } finally {
      setBusyId(null);
    }
  }

  async function move(contributionId: string, direction: -1 | 1) {
    const index = order.indexOf(contributionId);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= order.length) return;

    const next = order.slice();
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);

    setOrder(next);
    setBusyId(contributionId);
    try {
      const response = await fetch(`/api/wishes/${wishId}/contributions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: next }),
      });
      if (!response.ok) throw new Error("reorder_failed");
      router.refresh();
    } catch {
      toast.error("Couldn't save that order.");
      setOrder(order);
    } finally {
      setBusyId(null);
    }
  }

  if (ordered.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-hairline bg-surface px-6 py-14 text-center">
        <h2 className="font-serif text-3xl italic text-ink">Nothing yet.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
          Share the contributor link above. Anything friends add lands here for
          you to approve.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {ordered.map((item, index) => {
        const busy = busyId === item.contributionId;
        return (
          <li
            key={item.contributionId}
            className="rounded-card border border-hairline bg-surface p-4"
          >
            <div className="flex gap-4">
              {item.media && item.media.kind === "photo" ? (
                <Image
                  src={item.media.url}
                  alt=""
                  width={160}
                  height={160}
                  unoptimized
                  className="size-20 shrink-0 rounded-media border border-hairline object-cover"
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-ink">
                    {item.contributorName}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                      item.status === "approved" && "bg-sand text-success",
                      item.status === "pending" && "bg-sand text-warning",
                      item.status === "hidden" && "bg-sand text-ink-muted",
                    )}
                  >
                    {item.status}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                    {item.type}
                  </span>
                </div>

                {item.text ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {item.text}
                  </p>
                ) : null}

                {item.media && item.media.kind === "video" ? (
                  <video
                    src={item.media.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="mt-3 w-full max-w-xs rounded-media"
                  />
                ) : null}

                {item.media && item.media.kind === "voice" ? (
                  <audio
                    src={item.media.url}
                    controls
                    preload="metadata"
                    className="mt-3 w-full max-w-xs"
                  />
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {item.status !== "approved" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStatus(item.contributionId, "approved")}
                  className={smallAction}
                >
                  <Check aria-hidden="true" className="size-3.5" />
                  Approve
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStatus(item.contributionId, "hidden")}
                  className={smallAction}
                >
                  <EyeOff aria-hidden="true" className="size-3.5" />
                  Hide
                </button>
              )}

              {item.status === "hidden" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStatus(item.contributionId, "pending")}
                  className={smallAction}
                >
                  <Undo2 aria-hidden="true" className="size-3.5" />
                  Back to review
                </button>
              ) : null}

              <button
                type="button"
                disabled={busy || index === 0}
                onClick={() => move(item.contributionId, -1)}
                aria-label="Move up"
                className={smallAction}
              >
                <ArrowUp aria-hidden="true" className="size-3.5" />
              </button>
              <button
                type="button"
                disabled={busy || index === ordered.length - 1}
                onClick={() => move(item.contributionId, 1)}
                aria-label="Move down"
                className={smallAction}
              >
                <ArrowDown aria-hidden="true" className="size-3.5" />
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => remove(item.contributionId)}
                aria-label={`Remove contribution from ${item.contributorName}`}
                className={cn(smallAction, "ml-auto text-error")}
              >
                <Trash2 aria-hidden="true" className="size-3.5" />
                Remove
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ContributorLinkPanel({
  wishId,
  token,
}: {
  wishId: string;
  token: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = token && origin ? `${origin}/c/${token}` : "";

  async function mint(method: "POST" | "DELETE") {
    setBusy(true);
    try {
      const response = await fetch(`/api/wishes/${wishId}/contributor-link`, {
        method,
      });
      if (!response.ok) throw new Error("link_failed");
      toast.success(method === "POST" ? "Contributor link ready" : "Link revoked");
      router.refresh();
    } catch {
      toast.error("Couldn't update the link.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Copied");
    } catch {
      toast.error("Couldn't copy that.");
    }
  }

  return (
    <section className="rounded-card border border-hairline bg-surface p-5">
      <h2 className="text-sm font-medium text-ink">Contributor link</h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
        Anyone with this link can add a photo, video, voice note, or message.
        They never need an account, and nothing goes live until you approve it.
      </p>

      {token ? (
        <>
          <div className="mt-3 flex gap-2">
            <input
              readOnly
              value={url}
              onFocus={(event) => event.currentTarget.select()}
              aria-label="Contributor link"
              className="min-h-12 min-w-0 flex-1 rounded-full border border-hairline bg-canvas px-4 text-xs text-ink"
            />
            <Button type="button" variant="outline" onClick={copy} disabled={!url}>
              Copy
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={busy}
              onClick={() => mint("POST")}
            >
              Rotate link
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={busy}
              onClick={() => mint("DELETE")}
            >
              Revoke
            </Button>
          </div>
        </>
      ) : (
        <Button
          type="button"
          className="mt-3"
          disabled={busy}
          onClick={() => mint("POST")}
        >
          Create contributor link
        </Button>
      )}
    </section>
  );
}
