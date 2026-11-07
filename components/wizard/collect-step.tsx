"use client";

import { Check, Copy, Users, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface CollectStepProps {
  wishId: string;
  mode: "solo" | "group";
  contributorToken: string | null;
  groupEnabled: boolean;
  onChange: (mode: "solo" | "group") => void;
}

const card =
  "flex w-full items-start gap-3 rounded-media border p-4 text-left transition-colors";

export function CollectStep({
  wishId,
  mode,
  contributorToken,
  groupEnabled,
  onChange,
}: CollectStepProps) {
  const [token, setToken] = useState(contributorToken);
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    setToken(contributorToken);
  }, [contributorToken]);

  const url = token && origin ? `${origin}/c/${token}` : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Contributor link copied");
    } catch {
      toast.error("Couldn't copy that.");
    }
  }

  async function createLink() {
    setBusy(true);
    try {
      const response = await fetch(`/api/wishes/${wishId}/contributor-link`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("link_failed");
      const payload = (await response.json()) as {
        data: { contributorToken: string | null };
      };
      setToken(payload.data.contributorToken);
      toast.success("Contributor link ready");
    } catch {
      toast.error("Couldn't create the link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="font-serif text-3xl italic leading-tight text-ink">
        Is this just from you?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        A solo wish is all yours. A group wish gives friends a link to add their
        own photos and notes, which you approve before anything goes live.
      </p>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => onChange("solo")}
          aria-pressed={mode === "solo"}
          className={cn(
            card,
            mode === "solo"
              ? "border-ink bg-surface"
              : "border-hairline bg-canvas hover:bg-hover",
          )}
        >
          <User aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ink" />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-ink">
              Just me
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
              You write everything. Fastest way to send something lovely.
            </span>
          </span>
          {mode === "solo" ? (
            <Check aria-hidden="true" className="ml-auto size-4 text-ink" />
          ) : null}
        </button>

        {groupEnabled ? (
          <button
            type="button"
            onClick={() => onChange("group")}
            aria-pressed={mode === "group"}
            className={cn(
              card,
              mode === "group"
                ? "border-ink bg-surface"
                : "border-hairline bg-canvas hover:bg-hover",
            )}
          >
            <Users aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ink" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">
                From all of us
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                Share a link. Friends add photos, videos, voice notes or messages.
                You approve and reorder them.
              </span>
            </span>
            {mode === "group" ? (
              <Check aria-hidden="true" className="ml-auto size-4 text-ink" />
            ) : null}
          </button>
        ) : null}
      </div>

      {mode === "group" ? (
        <div className="mt-6 rounded-card border border-hairline bg-surface p-5">
          <h3 className="text-sm font-medium text-ink">Contributor link</h3>
          {token ? (
            <>
              <div className="mt-2 flex gap-2">
                <input
                  readOnly
                  value={url}
                  onFocus={(event) => event.currentTarget.select()}
                  aria-label="Contributor link"
                  className="min-h-12 min-w-0 flex-1 rounded-full border border-hairline bg-canvas px-4 text-xs text-ink"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  disabled={!url}
                  className="inline-flex min-h-12 items-center gap-1.5 rounded-full border border-hairline bg-canvas px-4 text-sm font-medium text-ink transition-colors hover:bg-hover disabled:opacity-50"
                >
                  <Copy aria-hidden="true" className="size-4" />
                  Copy
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Nothing a friend adds is visible to {`them`} until you approve it
                in Collect.
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={createLink}
              disabled={busy}
              className="mt-2 inline-flex min-h-12 items-center rounded-full bg-ink px-5 text-sm font-medium text-canvas disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create contributor link"}
            </button>
          )}
        </div>
      ) : (
        <p className="mt-6 text-xs text-ink-muted">
          You can add friends later from the dashboard. Nothing is locked in.
        </p>
      )}
    </div>
  );
}
