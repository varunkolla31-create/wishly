"use client";

import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { OccasionStep } from "@/components/wizard/occasion-step";
import { TemplateStep } from "@/components/wizard/template-step";
import { YouTubeMusicPicker } from "@/components/music/youtube-music-picker";
import { getMusicTrack } from "@/lib/catalog/music";
import { uploadMedia } from "@/lib/media/client";
import { usePhotoPreview } from "@/src/context/PhotoPreviewContext";
import type { MusicBinding } from "@/lib/music/types";
import {
  defaultMemoryTemplateId,
  SAMPLE_PHOTOS,
  type MemoryTemplate,
} from "@/src/components/three-memory/catalog";
import { MemoryPreview } from "@/src/components/three-memory/memory-preview";
import { Button } from "@/components/ui/button";
import { getOccasion } from "@/lib/catalog/occasions";
import { getTemplateOrDefault } from "@/lib/catalog/templates";
import { fromLocalDateTimeInput } from "@/components/wizard/types";
import { cn } from "@/lib/utils/cn";

const DRAFT_KEY = "wishly_guest_draft";
const STEP_KEY = "wishly_guest_step";
const STEPS = ["Occasion", "3D Reel", "Words", "Lock"] as const;

interface GuestDraft {
  category: string;
  templateId: string;
  receiverName: string;
  title: string;
  message: string;
  milestoneDate: string;
  milestoneLabel: string;
  secretScratchMessage: string;
  giftVoucherCode: string;
  quizQuestion: string;
  quizOption0: string;
  quizOption1: string;
  quizOption2: string;
  quizAnswerIndex: number;
  quizWrongToast: string;
  gateMode: "password" | "quiz" | "both";
  reelTemplateId: string;
  musicId: string | null;
  music: MusicBinding | null;
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
  milestoneDate: "",
  milestoneLabel: "Time since you brightened the world",
  secretScratchMessage: "",
  giftVoucherCode: "",
  quizQuestion: "",
  quizOption0: "",
  quizOption1: "",
  quizOption2: "",
  quizAnswerIndex: 0,
  quizWrongToast: "",
  gateMode: "password",
  reelTemplateId: defaultMemoryTemplateId("birthday"),
  musicId: "warm-glow",
  music: null,
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
  initialReelId,
  initialOccasion,
  authenticated,
  authEnabled,
  resuming,
}: {
  initialTemplateId: string | null;
  initialReelId?: string | null;
  initialOccasion?: string | null;
  authenticated: boolean;
  authEnabled: boolean;
  resuming: boolean;
}) {
  const router = useRouter();
  const { photos: previewPhotos, consume } = usePhotoPreview();
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
    const occasion = initialOccasion ? getOccasion(initialOccasion) : null;
    setDraft((current) => ({
      ...current,
      ...stored,
      ...(initialTemplateId ? { templateId: initialTemplateId } : {}),
      ...(initialReelId ? { reelTemplateId: initialReelId } : {}),
      ...(occasion
        ? {
            category: occasion.slug,
            templateId: occasion.defaultTemplateId,
            musicId: occasion.defaultMusicId,
            reelTemplateId: defaultMemoryTemplateId(occasion.slug),
          }
        : {}),
    }));
    setLoaded(true);
  }, [initialTemplateId, initialReelId, initialOccasion]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Drafts are a convenience; publishing still works.
    }
  }, [draft, loaded]);

  useEffect(() => {
    let saved = 0;
    try {
      const raw = window.localStorage.getItem(STEP_KEY);
      if (raw !== null) saved = Number(raw);
    } catch {
      saved = 0;
    }
    if (resuming) saved = STEPS.length - 1;
    if (Number.isFinite(saved)) {
      setStep(Math.min(STEPS.length - 1, Math.max(0, saved)));
    }
  }, [resuming]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STEP_KEY, String(step));
    } catch {
      // Drafts are a convenience; publishing still works.
    }
  }, [step, loaded]);

  const occasion = getOccasion(draft.category);
  const template = getTemplateOrDefault(draft.templateId);
  const quizReady =
    Boolean(draft.quizQuestion.trim()) &&
    [draft.quizOption0, draft.quizOption1, draft.quizOption2].every((option) =>
      option.trim(),
    ) &&
    draft.quizAnswerIndex >= 0;
  const passwordReady =
    draft.gateMode === "quiz" || /^\d{4,6}$/.test(draft.password);
  const gateReady =
    draft.gateMode === "quiz"
      ? quizReady
      : draft.gateMode === "both"
        ? passwordReady && quizReady
        : passwordReady;
  const contentReady =
    draft.message.trim().length > 0 &&
    (draft.title.trim().length > 0 || draft.receiverName.trim().length > 0);
  const canSubmit = gateReady;

  function update<K extends keyof GuestDraft>(key: K, value: GuestDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function go(delta: number) {
    setStep((current) => Math.max(0, Math.min(STEPS.length - 1, current + delta)));
  }

  async function publish() {
    if (publishing) return;
    if (!gateReady) {
      toast.error(
        draft.gateMode === "quiz"
          ? "Finish the memory quiz first."
          : "Enter a valid 4–6 digit PIN first.",
      );
      return;
    }
    if (!contentReady) {
      toast.error("Add their name or a title, and a message, first.");
      setStep(2);
      return;
    }

    if (!authenticated) {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        window.localStorage.setItem(STEP_KEY, String(step));
      } catch {
        // The in-memory draft still survives this tab.
      }
      window.location.href = `/sign-in?redirect=${encodeURIComponent("/create?resume=1")}`;
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

      const carried = consume();
      const mediaKeys: string[] = [];
      for (const dataUrl of carried.slice(0, 10)) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `photo-${mediaKeys.length + 1}.jpg`, {
            type: blob.type || "image/jpeg",
          });
          const item = await uploadMedia(wishId, "photo", file);
          mediaKeys.push(item.key);
        } catch {
          // One failed photo should not block the wish.
        }
      }

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
          milestoneDate: draft.milestoneDate
            ? new Date(draft.milestoneDate).toISOString()
            : null,
          milestoneLabel: draft.milestoneLabel.trim()
            ? draft.milestoneLabel.trim()
            : null,
          secretScratchMessage: draft.secretScratchMessage.trim()
            ? draft.secretScratchMessage.trim()
            : null,
          giftVoucherCode: draft.giftVoucherCode.trim()
            ? draft.giftVoucherCode.trim()
            : null,
          quizQuestion: draft.quizQuestion.trim() || null,
          quizOptions: quizReady
            ? [
                draft.quizOption0.trim(),
                draft.quizOption1.trim(),
                draft.quizOption2.trim(),
              ]
            : null,
          quizAnswerIndex: quizReady ? draft.quizAnswerIndex : null,
          quizWrongToast: draft.quizWrongToast.trim()
            ? draft.quizWrongToast.trim()
            : null,
          gateMode: draft.gateMode,
          reelTemplateId: draft.reelTemplateId || null,
          mediaKeys,
          musicId: draft.music ? null : draft.musicId,
          music: draft.music,
          unlockAt: fromLocalDateTimeInput(draft.unlockAt),
        }),
      });
      if (!patch.ok) throw new Error("save_failed");

      if (draft.gateMode !== "quiz") {
        const password = await fetch(`/api/wishes/${wishId}/password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: draft.password, hint: draft.hint }),
        });
        if (!password.ok) throw new Error("password_failed");
      }

      const published = await fetch(`/api/wishes/${wishId}/publish`, {
        method: "POST",
      });
      if (!published.ok) throw new Error("publish_failed");

      window.localStorage.removeItem(DRAFT_KEY);
      window.localStorage.removeItem(STEP_KEY);
      toast.success("Your wish is live");
      router.push(`/dashboard/wishes/${wishId}/card`);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === "password_failed"
          ? "Use a 4–6 digit PIN."
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
                reelTemplateId: defaultMemoryTemplateId(selected.slug),
                milestoneLabel:
                  selected.slug === "birthday"
                    ? "Time since you brightened the world"
                    : selected.slug === "love-valentine" ||
                        selected.slug === "anniversary"
                      ? "Every second since we met"
                      : `Time since ${selected.name.toLowerCase()}`,
              }));
            }}
          />
        ) : null}

        {step === 1 ? (
          <TemplateStep
            category={draft.category}
            reelTemplateId={draft.reelTemplateId}
            onReelSelect={(selected: MemoryTemplate) =>
              update("reelTemplateId", selected.id)
            }
            onReelConfirm={() => go(1)}
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="guest-milestone-date" className={labelClass}>
                    Count up from a special date (optional)
                  </label>
                  <input
                    id="guest-milestone-date"
                    type="date"
                    value={draft.milestoneDate}
                    onChange={(event) =>
                      update("milestoneDate", event.target.value)
                    }
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="guest-milestone-label" className={labelClass}>
                    Counter label
                  </label>
                  <input
                    id="guest-milestone-label"
                    value={draft.milestoneLabel}
                    onChange={(event) =>
                      update(
                        "milestoneLabel",
                        event.target.value.slice(0, 60),
                      )
                    }
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="guest-scratch" className={labelClass}>
                  Secret scratch card message (optional)
                </label>
                <textarea
                  id="guest-scratch"
                  value={draft.secretScratchMessage}
                  onChange={(event) =>
                    update(
                      "secretScratchMessage",
                      event.target.value.slice(0, 300),
                    )
                  }
                  rows={3}
                  placeholder="Something they scratch to reveal."
                  className="mt-1 w-full rounded-card border border-hairline bg-canvas px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-muted/70"
                />
                <p className={hintClass}>
                  Hidden behind shimmering gold foil on the reveal page.
                </p>
              </div>

              <div>
                <label htmlFor="guest-voucher" className={labelClass}>
                  Gift voucher code (optional)
                </label>
                <input
                  id="guest-voucher"
                  value={draft.giftVoucherCode}
                  onChange={(event) =>
                    update("giftVoucherCode", event.target.value.slice(0, 80))
                  }
                  placeholder="AMAZON-XXXX or COFFEE-DATE"
                  className={`mt-1 ${inputClass}`}
                />
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
                <span className={labelClass}>Music from YouTube</span>
                <div className="mt-2">
                  <YouTubeMusicPicker
                    value={draft.music}
                    legacyTrack={getMusicTrack(draft.musicId)}
                    onChange={(music) =>
                      setDraft((current) => ({
                        ...current,
                        music,
                        musicId: null,
                      }))
                    }
                  />
                </div>
              </div>

              <p className="rounded-media bg-sand px-4 py-3 text-xs leading-relaxed text-ink-muted">
                Photos, videos and voice notes unlock after you sign in — they
                need a private place to live. Everything you&apos;ve written here
                is kept.
              </p>

              <div className="rounded-card border border-hairline bg-canvas p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  3D memory reel preview
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[150px_1fr] sm:items-start">
                  <MemoryPreview
                    input={{
                      templateId: draft.reelTemplateId,
                      photos:
                        previewPhotos.length >= 3
                          ? previewPhotos.slice(0, 10)
                          : [...previewPhotos, ...SAMPLE_PHOTOS].slice(0, 6),
                      title: draft.title || "A memory for you",
                      receiverName: draft.receiverName,
                    }}
                  />
                  <p className="text-xs leading-relaxed text-ink-muted">
                    {previewPhotos.length >= 3
                      ? `${previewPhotos.length} photos from the gallery are ready. They upload with your wish after you sign in.`
                      : "Sample photos for now. Pick photos on the 3D reels page and they appear here automatically."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h2 className="font-serif text-3xl italic leading-tight text-ink">
              Lock it.
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              The receiver never signs in. Choose a password, a memory quiz, or
              both.
            </p>

            <div className="mt-6 space-y-5 rounded-card border border-hairline bg-surface p-5">
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["password", "Password"],
                    ["quiz", "Memory quiz"],
                    ["both", "Both"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("gateMode", value)}
                    aria-pressed={draft.gateMode === value}
                    className={cn(
                      "min-h-11 rounded-full border px-3 text-sm font-medium transition-colors",
                      draft.gateMode === value
                        ? "border-ink bg-ink text-canvas"
                        : "border-hairline bg-canvas text-ink hover:bg-hover",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {draft.gateMode !== "quiz" ? (
                <>
                  <div>
                    <label htmlFor="guest-password" className={labelClass}>
                      Password
                    </label>
                    <input
                      id="guest-password"
                      type="password"
                      value={draft.password}
                      onChange={(event) =>
                        update(
                          "password",
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="new-password"
                      maxLength={6}
                      className={`mt-1 ${inputClass}`}
                    />
                    <p className={hintClass}>
                      4–6 digits. Share it separately from the link.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="guest-hint" className={labelClass}>
                      Hint (optional)
                    </label>
                    <input
                      id="guest-hint"
                      value={draft.hint}
                      onChange={(event) =>
                        update("hint", event.target.value.slice(0, 80))
                      }
                      placeholder="What we call you every day"
                      className={`mt-1 ${inputClass}`}
                    />
                  </div>
                </>
              ) : null}

              {draft.gateMode !== "password" ? (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="guest-quiz-question" className={labelClass}>
                      Memory question
                    </label>
                    <input
                      id="guest-quiz-question"
                      value={draft.quizQuestion}
                      onChange={(event) =>
                        update("quizQuestion", event.target.value.slice(0, 140))
                      }
                      placeholder="Where did we first meet?"
                      className={`mt-1 ${inputClass}`}
                    />
                  </div>
                  {(
                    [
                      ["quizOption0", "Answer 1"],
                      ["quizOption1", "Answer 2"],
                      ["quizOption2", "Answer 3"],
                    ] as const
                  ).map(([field, placeholder], index) => (
                    <label
                      key={field}
                      className="flex items-center gap-3 rounded-full border border-hairline bg-canvas px-4 py-2"
                    >
                      <input
                        type="radio"
                        name="guest-quiz-answer"
                        checked={draft.quizAnswerIndex === index}
                        onChange={() => update("quizAnswerIndex", index)}
                        aria-label={`Correct answer is option ${index + 1}`}
                      />
                      <input
                        value={draft[field]}
                        onChange={(event) =>
                          update(field, event.target.value.slice(0, 60))
                        }
                        placeholder={placeholder}
                        className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none"
                      />
                      {draft.quizAnswerIndex === index ? (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-coral-strong">
                          Correct
                        </span>
                      ) : null}
                    </label>
                  ))}
                  <div>
                    <label htmlFor="guest-quiz-toast" className={labelClass}>
                      Funny wrong-answer message
                    </label>
                    <input
                      id="guest-quiz-toast"
                      value={draft.quizWrongToast}
                      onChange={(event) =>
                        update("quizWrongToast", event.target.value.slice(0, 120))
                      }
                      placeholder="Close! But that was the cat's name."
                      className={`mt-1 ${inputClass}`}
                    />
                  </div>
                </div>
              ) : null}

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

      {step === STEPS.length - 1 && !canSubmit ? (
        <p className="mt-6 rounded-media bg-sand px-4 py-3 text-xs leading-relaxed text-ink-muted">
          Set a valid 4–6 digit PIN (or finish the memory quiz) to enable the
          publish button.
        </p>
      ) : null}
      {step === STEPS.length - 1 && canSubmit && !contentReady ? (
        <p className="mt-6 rounded-media bg-sand px-4 py-3 text-xs leading-relaxed text-ink-muted">
          Add a name or title and a message in the Words step, then publish.
        </p>
      ) : null}

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
            disabled={!canSubmit || publishing}
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
