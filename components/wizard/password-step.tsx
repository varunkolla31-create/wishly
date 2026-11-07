"use client";

import { Eye, EyeOff, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StrengthMeter } from "@/components/wizard/strength-meter";
import { generatePassphrase } from "@/lib/utils/passphrase";

const inputClass =
  "min-h-12 w-full rounded-full border border-hairline bg-canvas px-4 text-sm text-ink placeholder:text-ink-muted/70";

export function PasswordStep({
  wishId,
  hasPassword,
  initialHint,
  onSaved,
}: {
  wishId: string;
  hasPassword: boolean;
  initialHint: string | null;
  onSaved: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [hint, setHint] = useState(initialHint ?? "");
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setError(null);

    if (password.length < 6) {
      setError("Use at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those two don't match.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/wishes/${wishId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, hint }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as {
          error?: { message?: string };
        };
        throw new Error(payload.error?.message ?? "Couldn't save that.");
      }

      setPassword("");
      setConfirm("");
      setSaved(true);
      onSaved(password);
      toast.success("Password saved");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Couldn't save that password.",
      );
    } finally {
      setSaving(false);
    }
  }

  function generate() {
    const passphrase = generatePassphrase();
    setPassword(passphrase);
    setConfirm(passphrase);
    setVisible(true);
    setError(null);
  }

  return (
    <div className="max-w-xl">
      <h2 className="font-serif text-3xl italic leading-tight text-ink">
        Lock it with a password.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        You&apos;ll send this to them separately from the link. We only store a
        one-way hash — nobody at Wishly can read it back.
      </p>

      <div className="mt-6 space-y-5 rounded-card border border-hairline bg-surface p-5">
        {hasPassword ? (
          <p className="flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-xs text-ink">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-success"
            />
            A password is set. Type a new one to replace it.
          </p>
        ) : null}

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-ink-muted">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={visible ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setSaved(false);
              }}
              autoComplete="new-password"
              maxLength={128}
              className={`${inputClass} pr-14`}
            />
            <button
              type="button"
              onClick={() => setVisible((value) => !value)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute right-1 top-1 flex size-10 items-center justify-center rounded-full text-ink-muted hover:bg-hover hover:text-ink"
            >
              {visible ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
          <div className="mt-2">
            <StrengthMeter password={password} />
          </div>
          <button
            type="button"
            onClick={generate}
            className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-coral hover:text-coral-hover"
          >
            <Wand2 aria-hidden="true" className="size-3.5" />
            Suggest a strong one
          </button>
        </div>

        <div>
          <label htmlFor="confirm" className="block text-xs font-medium text-ink-muted">
            Once more
          </label>
          <input
            id="confirm"
            type={visible ? "text" : "password"}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
            maxLength={128}
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div>
          <label htmlFor="hint" className="block text-xs font-medium text-ink-muted">
            Hint (optional, shown before unlock)
          </label>
          <input
            id="hint"
            value={hint}
            onChange={(event) => setHint(event.target.value)}
            maxLength={80}
            placeholder="Your favourite sweet"
            className={`mt-1 ${inputClass}`}
          />
          <p className="mt-1 text-xs text-ink-muted">
            A nudge, not the answer. This is visible to anyone with the link.
          </p>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? "Saving…" : hasPassword ? "Replace password" : "Save password"}
          </Button>
          {saved ? (
            <span className="text-xs text-ink-muted" role="status">
              Saved. Keep it somewhere safe.
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
