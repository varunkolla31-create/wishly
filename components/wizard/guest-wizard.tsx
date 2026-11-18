"use client";

import { ArrowLeft, ArrowRight, CalendarClock, Lock, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { OccasionStep } from "@/components/wizard/occasion-step";
import { TemplateStep } from "@/components/wizard/template-step";
import { GuestMediaUploader } from "@/components/wizard/guest-media-uploader";
import { ReceiverPreview } from "@/components/wizard/receiver-preview";
import { useGuestMedia } from "@/components/wizard/use-guest-media";
import { PublishSuccess } from "@/components/wizard/publish-success";
import { YouTubeMusicPicker } from "@/components/music/youtube-music-picker";
import { WriteWithAi } from "@/components/wizard/write-with-ai";
import { getMusicTrack } from "@/lib/catalog/music";
import { uploadAnonymousMedia } from "@/lib/media/anonymous-client";
import { uploadMedia } from "@/lib/media/client";
import { usePhotoPreview } from "@/src/context/PhotoPreviewContext";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  isAcceptableNewPassword,
} from "@/lib/security/password-policy";
import type { MusicBinding } from "@/lib/music/types";
import {
  defaultMemoryTemplateId,
  getMemoryTemplate,
  type MemoryTemplate,
} from "@/src/components/three-memory/catalog";
import { MemoryPreview } from "@/src/components/three-memory/memory-preview";
import { Button } from "@/components/ui/button";
import { getOccasion } from "@/lib/catalog/occasions";
import { getTemplateOrDefault } from "@/lib/catalog/templates";
import { fromLocalDateTimeInput } from "@/components/wizard/types";
import { cn } from "@/lib/utils/cn";

const DRAFT_KEY = "wishly_guest_draft_v2";
const STEP_KEY = "wishly_guest_step_v2";
/**
 * Occasion → Words → Photos → 3D Reel → Lock.
 *
 * Words comes before Photos so the photos step can show the title and receiver
 * beside the reel preview, and the reel step last so it reflects the final
 * words. The keys are versioned because a draft saved under the old order would
 * otherwise resume on a different step.
 */
const STEPS = ["Occasion", "Words", "Photos", "3D Reel", "Lock"] as const;

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
  const { photos: previewPhotos, hasUploads, consume } = usePhotoPreview();
  const guestMedia = useGuestMedia();
  const [draft, setDraft] = useState<GuestDraft>(EMPTY_DRAFT);
  const [step, setStep] = useState(resuming ? STEPS.length - 1 : 0);
  const [showPreview, setShowPreview] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<{
    wishId: string;
    title: string;
    password: string | null;
    occasionName: string | null;
    hint: string | null;
    shareUrl?: string;
    manageUrl?: string;
    expiresAt?: string | null;
    guest?: boolean;
  } | null>(null);

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
  const selectedReel = getMemoryTemplate(draft.reelTemplateId);
  const guestPhotos = guestMedia.media
    .filter((item) => item.kind === "photo")
    .map((item) => item.url);
  const guestVideoFrames = guestMedia.media
    .filter((item) => item.kind === "video" && item.poster)
    .map((item) => item.poster as string);
  const reelSources = [
    ...guestPhotos,
    ...guestVideoFrames,
    ...(hasUploads ? previewPhotos : []),
  ];
  const reelPhotos = reelSources.slice(0, 10);
  const quizReady =
    Boolean(draft.quizQuestion.trim()) &&
    [draft.quizOption0, draft.quizOption1, draft.quizOption2].every((option) =>
      option.trim(),
    ) &&
    draft.quizAnswerIndex >= 0;
  const passwordReady =
    draft.gateMode === "quiz" || isAcceptableNewPassword(draft.password);
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
          : `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters first.`,
      );
      return;
    }
    if (!contentReady) {
      toast.error("Add their name or a title, and a message, first.");
      // Words is step 1 in the current order.
      setStep(1);
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

    if (!guestMedia.ready) {
      toast.error("Still loading your photos and videos. Try again in a second.");
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

      const mediaKeys: string[] = [];
      let failedMedia = 0;

      for (const item of guestMedia.media) {
        try {
          const uploaded = await uploadMedia(wishId, item.kind, item.file);
          mediaKeys.push(uploaded.key);

          if (item.kind === "video" && item.poster) {
            try {
              const posterBlob = await (await fetch(item.poster)).blob();
              const posterFile = new File(
                [posterBlob],
                `video-frame-${mediaKeys.length}.jpg`,
                { type: "image/jpeg" },
              );
              const poster = await uploadMedia(wishId, "photo", posterFile);
              mediaKeys.push(poster.key);
            } catch {
              failedMedia += 1;
            }
          }
        } catch {
          failedMedia += 1;
        }
      }

      const carried = consume();
      const guestPhotoCount =
        guestMedia.media.filter((item) => item.kind === "photo").length +
        guestMedia.media.filter(
          (item) => item.kind === "video" && item.poster,
        ).length;

      for (const dataUrl of carried.slice(
        0,
        Math.max(0, 10 - guestPhotoCount),
      )) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `photo-${mediaKeys.length + 1}.jpg`, {
            type: blob.type || "image/jpeg",
          });
          const item = await uploadMedia(wishId, "photo", file);
          mediaKeys.push(item.key);
        } catch {
          failedMedia += 1;
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
      if (failedMedia > 0) {
        toast.error(
          "Your wish is live, but some photos or videos couldn't upload.",
        );
      } else {
        toast.success("Your wish is live");
      }
      await guestMedia.clear();
      setPublished({
        wishId,
        title:
          draft.title.trim() || draft.receiverName.trim() || "A wish for you",
        password: draft.gateMode === "quiz" ? null : draft.password,
        occasionName: occasion?.name ?? null,
        hint: draft.hint.trim() || null,
      });
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === "password_failed"
          ? `Use at least ${MIN_PASSWORD_LENGTH} characters, and avoid an easy-to-guess one.`
          : "Couldn't publish that wish. Try again.",
      );
    } finally {
      setPublishing(false);
    }
  }

  /**
   * Publishes without an account. The wish is a real server record, not a URL
   * fragment: the manage token authorises uploads and the final publish, and
   * only its hash is stored so the creator is the only one who can come back.
   */
  async function guestPublish() {
    if (!gateReady) {
      toast.error(
        draft.gateMode === "quiz"
          ? "Finish the memory quiz first."
          : `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters first.`,
      );
      return;
    }
    if (!contentReady) {
      toast.error("Add their name or a title, and a message, first.");
      // Words is step 1 in the current order.
      setStep(1);
      return;
    }
    if (!guestMedia.ready) {
      toast.error("Still loading your photos and videos. Try again in a second.");
      return;
    }
    if (publishing) return;

    setPublishing(true);
    try {
      const createdResponse = await fetch("/api/wishes/anonymous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: draft.category,
          templateId: draft.templateId,
          receiverName: draft.receiverName,
          title: draft.title.trim() || draft.receiverName.trim(),
        }),
      });
      const createdBody = (await createdResponse.json()) as {
        ok: boolean;
        data?: { manageToken?: string };
        error?: { message?: string };
      };
      const manageToken = createdBody.data?.manageToken;
      if (!createdResponse.ok || !manageToken) {
        throw new Error(
          createdBody.error?.message ?? "Couldn't start that wish.",
        );
      }

      const mediaKeys: string[] = [];
      let failedMedia = 0;

      for (const item of guestMedia.media) {
        try {
          mediaKeys.push(
            await uploadAnonymousMedia(manageToken, item.kind, item.file),
          );

          if (item.kind === "video" && item.poster) {
            try {
              const posterBlob = await (await fetch(item.poster)).blob();
              const posterFile = new File(
                [posterBlob],
                `video-frame-${mediaKeys.length}.jpg`,
                { type: "image/jpeg" },
              );
              mediaKeys.push(
                await uploadAnonymousMedia(manageToken, "photo", posterFile),
              );
            } catch {
              failedMedia += 1;
            }
          }
        } catch {
          failedMedia += 1;
        }
      }

      const publishResponse = await fetch(
        `/api/wishes/anonymous/${manageToken}/publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: draft.message,
            title: draft.title.trim() || undefined,
            mediaKeys,
            reelTemplateId: draft.reelTemplateId || null,
            musicId: draft.music ? null : draft.musicId,
            hint: draft.hint.trim() || null,
            password: draft.password,
          }),
        },
      );

      const publishBody = (await publishResponse.json()) as {
        ok: boolean;
        data?: {
          wishId: string;
          shareUrl: string;
          manageUrl: string;
          expiresAt: string | null;
        };
        error?: { message?: string };
      };

      if (!publishResponse.ok || !publishBody.data) {
        throw new Error(
          publishBody.error?.message ?? "Couldn't publish that wish.",
        );
      }

      try {
        window.localStorage.removeItem(DRAFT_KEY);
        window.localStorage.removeItem(STEP_KEY);
      } catch {
        // Nothing to clear.
      }

      if (failedMedia > 0) {
        toast.error(
          "Your wish is live, but some photos or videos couldn't upload.",
        );
      } else {
        toast.success("Your wish is live");
      }
      await guestMedia.clear();

      setPublished({
        wishId: publishBody.data.wishId,
        title:
          draft.title.trim() || draft.receiverName.trim() || "A wish for you",
        password: draft.gateMode === "quiz" ? null : draft.password,
        occasionName: occasion?.name ?? null,
        hint: draft.hint.trim() || null,
        shareUrl: publishBody.data.shareUrl,
        manageUrl: publishBody.data.manageUrl,
        expiresAt: publishBody.data.expiresAt,
      });
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
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

  if (published) {
    return <PublishSuccess {...published} />;
  }

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
            Build the whole thing here. Publish instantly with a link — no
            sign-in needed — or sign in to save it to your dashboard.
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

        {step === 3 ? (
          <TemplateStep
            category={draft.category}
            reelTemplateId={draft.reelTemplateId}
            photos={reelPhotos}
            onReelSelect={(selected: MemoryTemplate) =>
              update("reelTemplateId", selected.id)
            }
            onReelConfirm={() => go(1)}
          />
        ) : null}

        {step === 2 ? (
          <div>
            <h2 className="font-serif text-3xl italic leading-tight text-ink">
              Add photos or videos.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
              Put your memories inside{" "}
              <span className="font-medium text-ink">
                {selectedReel?.name ?? "your 3D reel"}
              </span>
              . Photos and short videos both work — a video&apos;s first frame
              plays in the 3D scene, and the full video opens on the reveal
              page.
            </p>
            <p className="mt-2 max-w-xl rounded-media bg-sand px-3 py-2 text-xs leading-relaxed text-ink">
              Your photos are uploaded to Wishly&apos;s servers when you
              publish, so the receiver can open the wish anywhere. Until then
              they stay in this browser.
            </p>

            <div className="mt-6 rounded-card border border-hairline bg-surface p-5">
              <GuestMediaUploader
                media={guestMedia.media}
                busy={guestMedia.busy}
                ready={guestMedia.ready}
                onAdd={guestMedia.addFiles}
                onRemove={guestMedia.remove}
                maxPhotos={guestMedia.maxPhotos}
                maxVideos={guestMedia.maxVideos}
              />
            </div>

            <div className="mt-6 rounded-card border border-hairline bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-sm font-medium text-ink">
                    3D reel preview
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    Drag the scene to move through it.
                  </p>
                </div>
                <Link
                  href={`/studio/${draft.reelTemplateId}`}
                  className="text-xs font-medium text-coral-strong hover:text-coral-hover"
                >
                  Open full studio →
                </Link>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[170px_1fr] sm:items-start">
                {reelPhotos.length > 0 ? (
                  <MemoryPreview
                    input={{
                      templateId: draft.reelTemplateId,
                      photos: reelPhotos,
                      title: draft.title || "A memory for you",
                      receiverName: draft.receiverName,
                    }}
                  />
                ) : (
                  <div className="flex aspect-[9/16] w-full items-center justify-center rounded-card border border-dashed border-hairline bg-[#0B1418] p-4 text-center text-xs leading-relaxed text-white/60">
                    Add a photo or video to see your reel.
                  </div>
                )}
                <div className="space-y-2 text-xs leading-relaxed text-ink-muted">
                  <p>
                    {reelPhotos.length > 0
                      ? `${reelPhotos.length} ${reelPhotos.length === 1 ? "memory" : "memories"} in the reel.`
                      : "Your uploaded photos and video frames will appear here."}
                  </p>
                  <p>
                    Everything stays private. Photos, videos and frames upload
                    after you sign in to publish.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
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
                <div className="mt-1">
                  <WriteWithAi
                    occasion={draft.category}
                    recipientName={draft.receiverName}
                    onUse={(message) =>
                      update("message", message.slice(0, 4000))
                    }
                  />
                </div>
                <textarea
                  id="guest-message"
                  value={draft.message}
                  onChange={(event) => update("message", event.target.value.slice(0, 4000))}
                  rows={8}
                  placeholder="Write like you're talking to them."
                  className="mt-2 min-h-48 w-full rounded-card border border-hairline bg-canvas px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-muted/70"
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
                <span className={labelClass}>Music</span>
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
            </div>
          </div>
        ) : null}

        {step === 4 ? (
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
                          event.target.value.slice(0, MAX_PASSWORD_LENGTH),
                        )
                      }
                      autoComplete="new-password"
                      maxLength={MAX_PASSWORD_LENGTH}
                      className={`mt-1 ${inputClass}`}
                    />
                    <p className={hintClass}>
                      At least {MIN_PASSWORD_LENGTH} characters — a PIN or a
                      couple of words both work. Share it separately from the
                      link.
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

              <div className="rounded-card border border-hairline bg-canvas p-4">
                <div className="flex items-center gap-2">
                  <CalendarClock
                    aria-hidden="true"
                    className="size-4 text-coral-strong"
                  />
                  <label htmlFor="guest-unlock" className={labelClass}>
                    Open it on a certain day (optional)
                  </label>
                </div>
                <input
                  id="guest-unlock"
                  type="datetime-local"
                  value={draft.unlockAt}
                  onChange={(event) => update("unlockAt", event.target.value)}
                  className={`mt-2 ${inputClass} sm:max-w-xs`}
                />
                <p className={hintClass}>
                  Before this time the receiver sees a styled countdown instead
                  of the password box. Leave it empty to open immediately.
                </p>
              </div>

              <div className="rounded-card border border-hairline bg-canvas p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-md">
                    <h3 className="flex items-center gap-2 text-sm font-medium text-ink">
                      <MonitorPlay
                        aria-hidden="true"
                        className="size-4 text-coral-strong"
                      />
                      Preview as receiver
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                      Test the countdown, password screen and the full 3D /
                      music reveal before publishing.
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
                      receiverName={draft.receiverName}
                      title={draft.title}
                      message={draft.message}
                      templateId={draft.templateId}
                      musicId={draft.musicId}
                      music={draft.music}
                      milestoneDate={draft.milestoneDate}
                      milestoneLabel={draft.milestoneLabel}
                      secretScratchMessage={draft.secretScratchMessage}
                      giftVoucherCode={draft.giftVoucherCode}
                      heartbeat={
                        draft.category === "love-valentine" ||
                        draft.category === "anniversary"
                      }
                      unlockAt={draft.unlockAt}
                      hint={draft.hint}
                      gateMode={draft.gateMode}
                      quizQuestion={draft.quizQuestion}
                      quizOptions={[
                        draft.quizOption0,
                        draft.quizOption1,
                        draft.quizOption2,
                      ]}
                      media={guestMedia.media.map((item) => ({
                        key: item.id,
                        url: item.url,
                        kind: item.kind,
                      }))}
                    />
                  </div>
                ) : null}
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

      {step === STEPS.length - 1 && !canSubmit ? (
        <p className="mt-6 rounded-media bg-sand px-4 py-3 text-xs leading-relaxed text-ink-muted">
          Set a password of at least {MIN_PASSWORD_LENGTH} characters (or finish
          the memory quiz) to enable the publish button.
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
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={publish}
              disabled={!canSubmit || publishing}
            >
              {publishing
                ? "Publishing…"
                : authenticated
                  ? "Publish wish"
                  : "Sign in to publish"}
              {!authenticated ? (
                <Lock aria-hidden="true" className="size-4" />
              ) : null}
            </Button>
            <Button
              type="button"
              onClick={guestPublish}
              disabled={!canSubmit || publishing}
              className="disabled:bg-sand disabled:text-ink-muted disabled:opacity-100"
            >
              {publishing
                ? "Publishing…"
                : "Publish without signing in"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
