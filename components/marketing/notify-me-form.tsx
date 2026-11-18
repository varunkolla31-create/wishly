"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const inputClass =
  "min-h-12 w-full rounded-full border border-hairline bg-canvas px-4 text-sm text-ink placeholder:text-ink-muted/70";

export function NotifyMeForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!consent) {
      toast.error("Tick the box so we know you'd like to hear from us.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: true, source: "pricing" }),
      });
      if (!response.ok) throw new Error("failed");
      setDone(true);
      toast.success("You're on the list");
    } catch {
      toast.error("Couldn't save that. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p
        role="status"
        className="rounded-media bg-sand px-4 py-3 text-sm leading-relaxed text-ink"
      >
        Saved. We&apos;ll write once when paid plans are ready — nothing else.
        You can ask us to remove your address any time.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="notify-email" className="block text-xs font-medium text-ink-muted">
        Email
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="notify-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Notify me"}
        </Button>
      </div>

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 size-4 rounded border-hairline"
        />
        <span>
          Yes, email me once when paid plans launch. I can ask to be removed at
          any time, and my address is not used for anything else.
        </span>
      </label>
    </form>
  );
}
