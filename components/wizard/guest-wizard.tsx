"use client";

import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { OccasionStep } from "@/components/wizard/occasion-step";
import { TemplateStep } from "@/components/wizard/template-step";
import { MusicPicker } from "@/components/wizard/music-picker";
import { Button } from "@/components/ui/button";
import { getOccasion } from "@/lib/catalog/occasions";
import { getTemplateOrDefault } from "@/lib/catalog/templates";
import { fromLocalDateTimeInput } from "@/components/wizard/types";
import { cn } from "@/lib/utils/cn";

const DRAFT_KEY = "wishly_guest_draft";
const STEPS = ["Occasion", "Template", "Words", "Lock"] as const;

interface GuestDraft {
  category: string;
  templateId: string;
  receiverName: string;
  title: string;
  message: string;
  musicId: string | null;
  password: string;
  hint: string;
  unlockAt: string;
}

const EMPTY_DRAFT: GuestDraft = {
  category: "birthday",
  templateId: "confetti-pop",
  receiverName: "",
  title: "",
  message: "",
  musicId: "warm-glow",
  password: "",
  hint: "",
  unlockAt: "",
};

const inputClass =
  "min-h-12 w-full rounded-full border border-hairline bg-canvas px-4 text-sm text-ink placeholder:text-ink-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral";
const labelClass = "block text-xs font-medium text-ink-muted";
const hintClass = "mt-1 text-xs leading-relaxed text-ink-muted";

export function GuestWizard({
  initialTemplateId,
  authenticated,
  authEnabled,
  resuming,
}: {
  initialTemplateId: string | null;
  authenticated: boolean;
  authEnabled: boolean;
  resuming: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<GuestDraft>(EMPTY_DRAFT);
  const [step, setStep] = useState(resuming ? STEPS.length - 1 : 0);
  const [loaded, setLoaded] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    let stored: Partial<GuestDraft> = {};
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) stored = JSON.parse(raw) as Partial<GuestDraft>;
    } catch {
      stored = {};
    }
    setDraft((current) => ({
      ...current,
      ...stored,
      ...(initialTemplateId ? { templateId: initialTemplateId } : {}),
    }));
    setLoaded(true);
  }, [initialTemplateId]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Drafts are a convenience; publishing still works.
    }
  }, [draft, loaded]);

  const occasion = getOccasion(draft.category);
  const template = getTemplateOrDefault(draft.templateId);
  const canPublish =
    draft.message.trim().length > 0 &&
    draft.password.length >= 6 &&
    (draft.title.trim().length > 0 || draft.receiverName.trim().length > 0);

  function update<K extends keyof GuestDraft>(key: K, value: GuestDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function go(delta: number) {
    setStep((current) => Math.max(0, Math.min(STEPS.length - 1, current + delta)));
  }

  async function publish() {
    if (publishing) return;
    if (!canPublish) {
      toast.error("Add a name or title, a message, and a password first.");
      return;
    }

    if (!authenticated) {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        // The in-memory draft still survives this tab.
      }
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent("/create?resume=1")}`;
      return;
    }

    setPublishing(true);
    try {
      const created = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: draft.category,
          templateId: draft.templateId,
          mode: "solo",
        }),
      });
      const createdBody = (await created.json()) as {
        ok: boolean;
        data?: { wishId?: string };
      };
      const wishId = createdBody.data?.wishId;
      if (!created.ok || !wishId) throw new Error("create_failed");

      const patch = await fetch(`/api/wishes/${wishId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: draft.category,
          templateId: draft.templateId,
          mode: "solo",
          receiverName: draft.receiverName,
          title: draft.title,
          message: draft.message,
          mediaKeys: [],
          musicId: draft.musicId,
          unlockAt: fromLocalDateTimeInput(draft.unlockAt),
        }),
      });
      if (!patch.ok) throw new Error("save_failed");

      const password = await fetch(`/api/wishes/${wishId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: draft.password, hint: draft.hint }),
      });
      if (!password.ok) throw new Error("password_failed");

      const published = await fetch(`/api/wishes/${wishId}/publish`, {
        method: "POST",
      });
      if (!published.ok) throw new Error("publish_failed");

      window.localStorage.removeItem(DRAFT_KEY);
      toast.success("Your wish is live");
      router.push(`/dashboard/wishes/${wishId}/card`);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === "password_failed"
          ? "That password needs at least 6 characters."
          : "Couldn't publish that wish. Try again.",
      );
    } finally {
      setPublishing(false);
    }
  }

  const summary = useMemo(
    () => [
      occasion?.name ?? "Wish",
      template.name,
      draft.receiverName || draft.title || "Untitled",
    ],
    [occasion?.name, template.name, draft.receiverName, draft.title],
  );

  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 lg:pt-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Create a wish
          </p>
          <h1 className="mt-2 font-serif text-4xl italic leading-tight text-ink sm:text-5xl">
            Try it before you sign up.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
            Build the whole thing here. Your draft stays in this browser until
            you publish, and you only sign in at the last step.
          </p>
        </div>
        <div className="text-sm text-ink-muted">
          {authenticated ? (
            <span className="rounded-full bg-sand px-3 py-1.5 text-xs font-medium text-ink">
              Signed in
            </span>
          ) : authEnabled ? (
            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent("/create?resume=1")}`}
              className="underline underline-offset-4 hover:text-ink"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </div>

      {resuming && loaded ? (
        <p className="mt-6 rounded-card border border-hairline bg-sand px-4 py-3 text-sm text-ink">
          Welcome back — your draft is restored. Publish when you&apos;re ready.
        </p>
      ) : null}

      <ol className="mt-8 flex flex-wrap gap-2" aria-label="Wizard steps">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setStep(index)}
              aria-current={step === index ? "step" : undefined}
              className={cn(
                "inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                step === index
                  ? "border-ink bg-ink text-canvas"
                  : index < step
                    ? "border-hairline bg-surface text-ink"
                    : "border-hairline bg-surface text-ink-muted",
              )}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        {step === 0 ? (
          <OccasionStep
            selected={draft.category}
            onSelect={(selected) => {
              setDraft((current) => ({
                ...current,
                category: selected.slug,
                templateId: selected.defaultTemplateId,
                musicId: selected.defaultMusicId,
              }));
            }}
          />
        ) : null}

        {step === 1 ? (
          <TemplateStep
            selected={draft.templateId}
            title={draft.title || draft.receiverName}
            onSelect={(selected) => update("templateId", selected.id)}
          />
        ) : null}

        {step === 2 ? (
          <div>
            <h2 className="font-serif text-3xl italic leading-tight text-ink">
              Give it the words.
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Keep it specific. The small details are what they&apos;ll remember.
            </p>

            <div className="mt-6 space-y-5 rounded-card border border-hairline bg-surface p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="guest-receiver" className={labelClass}>
                    Their name
                  </label>
                  <input
                    id="guest-receiver"
                    value={draft.receiverName}
                    onChange={(event) => update("receiverName", event.target.value.slice(0, 80))}
                    placeholder="Amma"
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="guest-title" className={labelClass}>
                    Title
                  </label>
                  <input
                    id="guest-title"
                    value={draft.title}
                    onChange={(event) => update("title", event.target.value.slice(0, 120))}
                    placeholder="Happy birthday, Amma"
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="guest-message" className={labelClass}>
                  Your message
                </label>
                <textarea
                  id="guest-message"
                  value={draft.message}
                  onChange={(event) => update("message", event.target.value.slice(0, 4000))}
                  rows={8}
                  placeholder="Write like you're talking to them."
                  className="mt-1 min-h-48 w-full rounded-card border border-hairline bg-canvas px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-muted/70"
                />
                <div className="mt-1 flex justify-between">
                  <p className={hintClass}>Line breaks are kept.</p>
                  <span className="text-xs text-ink-muted">{draft.message.length}/4000</span>
                </div>
              </div>

              <div>
                <label htmlFor="guest-unlock" className={labelClass}>
                  Open it on a certain day (optional)
                </label>
                <input
                  id="guest-unlock"
                  type="datetime-local"
                  value={draft.unlockAt}
                  onChange={(event) => update("unlockAt", event.target.value)}
                  className={`mt-1 ${inputClass} sm:max-w-xs`}
                />
              </div>

              <div>
                <span className={labelClass}>Music</span>
                <div className="mt-2">
                  <MusicPicker
                    value={draft.musicId}
                    onChange={(musicId) => update("musicId", musicId)}
                  />
                </div>
              </div>

              <p className="rounded-media bg-sand px-4 py-3 text-xs leading-relaxed text-ink-muted">
                Photos, videos and voice notes unlock after you sign in — they
                need a private place to live. Everything you&apos;ve written here
                is kept.
              </p>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h2 className="font-serif text-3xl italic leading-tight text-ink">
              Lock it.
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              The receiver never signs in. They just need this password.
            </p>

            <div className="mt-6 space-y-5 rounded-card border border-hairline bg-surface p-5">
              <div>
                <label htmlFor="guest-password" className={labelClass}>
                  Password
                </label>
                <input
                  id="guest-password"
                  type="password"
                  value={draft.password}
                  onChange={(event) => update("password", event.target.value.slice(0, 128))}
                  autoComplete="new-password"
                  className={`mt-1 ${inputClass}`}
                />
                <p className={hintClass}>At least 6 characters. Share it separately from the link.</p>
              </div>
              <div>
                <label htmlFor="guest-hint" className={labelClass}>
                  Hint (optional)
                </label>
                <input
                  id="guest-hint"
                  value={draft.hint}
                  onChange={(event) => update("hint", event.target.value.slice(0, 80))}
                  placeholder="What we call you every day"
                  className={`mt-1 ${inputClass}`}
                />
              </div>

              <div className="rounded-media border border-hairline bg-canvas px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Summary
                </p>
                <p className="mt-1 text-sm text-ink">{summary.join(" · ")}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={() => go(-1)}
          disabled={step === 0}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => go(1)}>
            Continue
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={publish}
            disabled={!canPublish || publishing}
          >
            {publishing
              ? "Publishing…"
              : authenticated
                ? "Publish wish"
                : "Sign in to publish"}
            {!authenticated ? <Lock aria-hidden="true" className="size-4" /> : null}
          </Button>
        )}
      </div>
    </main>
  );
}
