"use client";

import { CalendarClock, Eye, EyeOff, MonitorPlay, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ReceiverPreview } from "@/components/wizard/receiver-preview";
import { StrengthMeter } from "@/components/wizard/strength-meter";
import type { DraftValues } from "@/components/wizard/types";
import type { MediaItem } from "@/lib/media/types";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from "@/lib/security/password-policy";
import { cn } from "@/lib/utils/cn";
import { generatePassphrase } from "@/lib/utils/passphrase";

const inputClass =
  "min-h-12 w-full rounded-full border border-hairline bg-canvas px-4 text-sm text-ink placeholder:text-ink-muted/70";

const GATE_OPTIONS = [
  {
    value: "password" as const,
    label: "Password",
    hint: "The classic. Send it separately from the link.",
  },
  {
    value: "quiz" as const,
    label: "Memory quiz",
    hint: "One question only they can answer. No password to share.",
  },
  {
    value: "both" as const,
    label: "Both",
    hint: "Password plus the quiz. The most locked-down option.",
  },
];

export function PasswordStep({
  form,
  wishId,
  hasPassword,
  initialHint,
  media,
  onSaved,
}: {
  form: UseFormReturn<DraftValues>;
  wishId: string;
  hasPassword: boolean;
  initialHint: string | null;
  media: MediaItem[];
  onSaved: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [hint, setHint] = useState(initialHint ?? "");
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const values = form.watch();
  const gateMode = values.gateMode;
  const quizAnswerIndex = values.quizAnswerIndex;

  async function save() {
    setError(null);

    const policy = validateNewPassword(password);
    if (!policy.ok) {
      setError(policy.message);
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
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    setPassword(pin);
    setConfirm(pin);
    setVisible(true);
    setError(null);
  }

  function generatePassphraseValue() {
    const phrase = generatePassphrase();
    setPassword(phrase);
    setConfirm(phrase);
    setVisible(true);
    setError(null);
  }

  return (
    <div className="max-w-xl">
      <h2 className="font-serif text-3xl italic leading-tight text-ink">
        Lock it. Make it theirs.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Choose how they open it. A password is sent separately from the link; a
        memory quiz asks one question only they can answer.
      </p>

      <div className="mt-6 space-y-5">
        <div className="grid gap-2 sm:grid-cols-3">
          {GATE_OPTIONS.map((option) => {
            const active = gateMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  form.setValue("gateMode", option.value, {
                    shouldDirty: true,
                  })
                }
                aria-pressed={active}
                className={cn(
                  "rounded-card border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-ink bg-canvas"
                    : "border-hairline bg-surface hover:bg-hover",
                )}
              >
                <span className="block text-sm font-medium text-ink">
                  {option.label}
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-ink-muted">
                  {option.hint}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-card border border-hairline bg-surface p-5">
          <div className="flex items-center gap-2">
            <CalendarClock aria-hidden="true" className="size-4 text-coral-strong" />
            <label
              htmlFor="unlockAt"
              className="block text-xs font-medium text-ink-muted"
            >
              Open it on a certain day (optional)
            </label>
          </div>
          <input
            id="unlockAt"
            type="datetime-local"
            {...form.register("unlockAt")}
            className={`mt-2 ${inputClass} sm:max-w-xs`}
          />
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            Before this time the receiver sees a styled countdown (“Opens at
            midnight…”) instead of the password box. Leave it empty to open
            immediately.
          </p>
        </div>

        {gateMode !== "quiz" ? (
          <div className="space-y-5 rounded-card border border-hairline bg-surface p-5">
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
              <label
                htmlFor="password"
                className="block text-xs font-medium text-ink-muted"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value.slice(0, MAX_PASSWORD_LENGTH),
                    );
                    setSaved(false);
                  }}
                  autoComplete="new-password"
                  maxLength={MAX_PASSWORD_LENGTH}
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
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <button
                  type="button"
                  onClick={generate}
                  className="inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-coral-strong hover:text-coral-hover"
                >
                  <RefreshCw aria-hidden="true" className="size-3.5" />
                  Suggest a 6-digit PIN
                </button>
                <button
                  type="button"
                  onClick={generatePassphraseValue}
                  className="inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-coral-strong hover:text-coral-hover"
                >
                  <RefreshCw aria-hidden="true" className="size-3.5" />
                  Suggest a passphrase
                </button>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                At least {MIN_PASSWORD_LENGTH} characters. Avoid names, festival
                words and anything you use elsewhere.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="block text-xs font-medium text-ink-muted"
              >
                Once more
              </label>
              <input
                id="confirm"
                type={visible ? "text" : "password"}
                value={confirm}
                onChange={(event) =>
                  setConfirm(event.target.value.slice(0, MAX_PASSWORD_LENGTH))
                }
                autoComplete="new-password"
                maxLength={MAX_PASSWORD_LENGTH}
                className={`mt-1 ${inputClass}`}
              />
            </div>

            <div>
              <label
                htmlFor="hint"
                className="block text-xs font-medium text-ink-muted"
              >
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
                A nudge, not the answer. This is visible to anyone with the
                link.
              </p>
            </div>

            {error ? (
              <p role="alert" className="text-sm text-error">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={save} disabled={saving}>
                {saving
                  ? "Saving…"
                  : hasPassword
                    ? "Replace password"
                    : "Save password"}
              </Button>
              {saved ? (
                <span className="text-xs text-ink-muted" role="status">
                  Saved. Keep it somewhere safe.
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {gateMode !== "password" ? (
          <div className="space-y-4 rounded-card border border-hairline bg-surface p-5">
            <div>
              <label
                htmlFor="quizQuestion"
                className="block text-xs font-medium text-ink-muted"
              >
                Memory question
              </label>
              <input
                id="quizQuestion"
                {...form.register("quizQuestion")}
                maxLength={140}
                placeholder="Where did we first meet?"
                className={`mt-1 ${inputClass}`}
              />
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-medium text-ink-muted">
                Three answer pills
              </span>
              {(["quizOption0", "quizOption1", "quizOption2"] as const).map(
                (field, index) => (
                  <label
                    key={field}
                    className="flex items-center gap-3 rounded-full border border-hairline bg-canvas px-4 py-2"
                  >
                    <input
                      type="radio"
                      name="quizAnswerIndex"
                      checked={quizAnswerIndex === index}
                      onChange={() =>
                        form.setValue("quizAnswerIndex", index, {
                          shouldDirty: true,
                        })
                      }
                      aria-label={`Correct answer is option ${index + 1}`}
                    />
                    <input
                      {...form.register(field)}
                      maxLength={60}
                      placeholder={`Answer ${index + 1}`}
                      className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none"
                    />
                    {quizAnswerIndex === index ? (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-coral-strong">
                        Correct
                      </span>
                    ) : null}
                  </label>
                ),
              )}
            </div>

            <div>
              <label
                htmlFor="quizWrongToast"
                className="block text-xs font-medium text-ink-muted"
              >
                Funny wrong-answer message
              </label>
              <input
                id="quizWrongToast"
                {...form.register("quizWrongToast")}
                maxLength={120}
                placeholder="Close! But that was the cat's name."
                className={`mt-1 ${inputClass}`}
              />
            </div>
          </div>
        ) : null}

        <div className="rounded-card border border-hairline bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-md">
              <h3 className="flex items-center gap-2 text-sm font-medium text-ink">
                <MonitorPlay aria-hidden="true" className="size-4 text-coral-strong" />
                Preview as receiver
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Test the exact countdown, password screen and the full 3D /
                music reveal before you copy the share link.
              </p>
            </div>
            <Button
              type="button"
              variant={showPreview ? "secondary" : "outline"}
              onClick={() => setShowPreview((value) => !value)}
              aria-expanded={showPreview}
            >
              {showPreview ? "Close preview" : "Preview as receiver"}
            </Button>
          </div>

          {showPreview ? (
            <div className="mt-4">
              <ReceiverPreview
                receiverName={values.receiverName}
                title={values.title}
                message={values.message}
                templateId={values.templateId}
                musicId={values.musicId}
                music={values.music ?? null}
                milestoneDate={values.milestoneDate}
                milestoneLabel={values.milestoneLabel}
                secretScratchMessage={values.secretScratchMessage}
                giftVoucherCode={values.giftVoucherCode}
                heartbeat={
                  values.category === "love-valentine" ||
                  values.category === "anniversary"
                }
                unlockAt={values.unlockAt}
                hint={hint || initialHint}
                gateMode={gateMode}
                quizQuestion={values.quizQuestion}
                quizOptions={[
                  values.quizOption0,
                  values.quizOption1,
                  values.quizOption2,
                ]}
                media={media}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
