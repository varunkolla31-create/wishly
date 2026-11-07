"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ContentStep } from "@/components/wizard/content-step";
import { CollectStep } from "@/components/wizard/collect-step";
import { OccasionStep } from "@/components/wizard/occasion-step";
import { PasswordStep } from "@/components/wizard/password-step";
import { PreviewStep } from "@/components/wizard/preview-step";
import { PublishSuccess } from "@/components/wizard/publish-success";
import { TemplateStep } from "@/components/wizard/template-step";
import { WizardStepper } from "@/components/wizard/stepper";
import {
  fromLocalDateTimeInput,
  toLocalDateTimeInput,
  WIZARD_STEPS,
  type DraftValues,
} from "@/components/wizard/types";
import { Button } from "@/components/ui/button";
import { getOccasion } from "@/lib/catalog/occasions";
import { defaultMemoryTemplateId } from "@/src/components/three-memory/catalog";
import type { MediaItem } from "@/lib/media/types";
import type { SenderWish } from "@/lib/repos/dto";

const STEPS = WIZARD_STEPS;

function initialValues(wish: SenderWish): DraftValues {
  return {
    category: wish.category,
    templateId: wish.templateId,
    mode: wish.mode,
    receiverName: wish.receiverName,
    title: wish.title,
    message: wish.message,
    bonusNote: wish.bonusNote ?? "",
    reelTemplateId: wish.reelTemplateId ?? defaultMemoryTemplateId(wish.category),
    mediaKeys: wish.mediaKeys,
    musicId: wish.musicId,
    unlockAt: toLocalDateTimeInput(wish.unlockAt),
  };
}

function toPatch(values: DraftValues) {
  return {
    category: values.category,
    templateId: values.templateId,
    mode: values.mode,
    receiverName: values.receiverName,
    title: values.title,
    message: values.message,
    bonusNote: values.bonusNote.trim() ? values.bonusNote.trim() : null,
    reelTemplateId: values.reelTemplateId || null,
    mediaKeys: values.mediaKeys,
    musicId: values.musicId,
    unlockAt: fromLocalDateTimeInput(values.unlockAt),
  };
}

type SaveState = "saved" | "saving" | "error";

export function WishWizard({
  wish,
  initialMedia,
  initialStep,
  groupEnabled,
}: {
  wish: SenderWish;
  initialMedia: MediaItem[];
  initialStep: number;
  groupEnabled: boolean;
}) {
  const [stepIndex, setStepIndex] = useState(
    Math.max(0, Math.min(STEPS.length - 1, initialStep)),
  );
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [hasPassword, setHasPassword] = useState(wish.hasPassword);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [contributorToken, setContributorToken] = useState(
    wish.contributorToken,
  );

  const form = useForm<DraftValues>({ defaultValues: initialValues(wish) });
  const values = form.watch();

  const lastSaved = useRef(JSON.stringify(toPatch(initialValues(wish))));
  const saveSequence = useRef(0);

  useEffect(() => {
    const patch = toPatch(values);
    const serialized = JSON.stringify(patch);
    if (serialized === lastSaved.current) return;

    const timer = window.setTimeout(() => {
      const sequence = ++saveSequence.current;
      setSaveState("saving");

      void fetch(`/api/wishes/${wish.wishId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: serialized,
      })
        .then((response) => {
          if (!response.ok) throw new Error("save_failed");
          if (sequence === saveSequence.current) {
            lastSaved.current = serialized;
            setSaveState("saved");
          }
          return response.json() as Promise<{
            data?: { contributorToken?: string | null };
          }>;
        })
        .then((payload) => {
          if (payload?.data && "contributorToken" in payload.data) {
            setContributorToken(payload.data.contributorToken ?? null);
          }
        })
        .catch(() => {
          if (sequence === saveSequence.current) setSaveState("error");
        });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [values, wish.wishId]);

  async function flushDraft() {
    const patch = toPatch(form.getValues());
    const serialized = JSON.stringify(patch);
    if (serialized === lastSaved.current) return;

    const sequence = ++saveSequence.current;
    setSaveState("saving");

    const response = await fetch(`/api/wishes/${wish.wishId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: serialized,
    });

    if (!response.ok) {
      if (sequence === saveSequence.current) setSaveState("error");
      throw new Error("save_failed");
    }

    if (sequence === saveSequence.current) {
      lastSaved.current = serialized;
      setSaveState("saved");
    }
  }

  async function publish() {
    if (publishing) return;
    setPublishing(true);

    try {
      await flushDraft();

      const response = await fetch(`/api/wishes/${wish.wishId}/publish`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json()) as {
          error?: { message?: string };
        };
        throw new Error(payload.error?.message ?? "Couldn't publish that wish.");
      }

      setPublished(true);
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Couldn't publish that wish.",
      );
    } finally {
      setPublishing(false);
    }
  }

  function goTo(index: number) {
    const next = Math.max(0, Math.min(STEPS.length - 1, index));
    setStepIndex(next);
    window.history.replaceState(null, "", `?step=${next + 1}`);
  }

  function addMedia(item: MediaItem) {
    setMedia((current) =>
      current.some((existing) => existing.key === item.key)
        ? current
        : [...current, item],
    );
    const keys = form.getValues("mediaKeys");
    if (!keys.includes(item.key)) {
      form.setValue("mediaKeys", [...keys, item.key], { shouldDirty: true });
    }
  }

  function removeMedia(key: string) {
    setMedia((current) => current.filter((item) => item.key !== key));
    form.setValue(
      "mediaKeys",
      form.getValues("mediaKeys").filter((item) => item !== key),
      { shouldDirty: true },
    );
  }

  const occasion = getOccasion(values.category);
  const canPublish =
    values.message.trim().length > 0 &&
    hasPassword &&
    (values.title.trim().length > 0 || values.receiverName.trim().length > 0);
  const saveLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "error"
        ? "Couldn't save"
        : "Saved";

  if (published) {
    return (
      <PublishSuccess
        wishId={wish.wishId}
        title={values.title || values.receiverName}
        password={savedPassword}
        occasionName={occasion?.name}
        hint={wish.passwordHint}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-2 truncate font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
            {values.title || wish.title || "A new wish"}
          </h1>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            {occasion?.name ?? "Wish"} ·{" "}
            {wish.status === "published" ? "Published" : "Draft"}
          </p>
        </div>
        <span
          role="status"
          aria-live="polite"
          className="pt-1 text-xs text-ink-muted"
        >
          {saveLabel}
        </span>
      </div>

      <div className="mt-6 border-y border-hairline py-2">
        <WizardStepper steps={[...STEPS]} current={stepIndex} onSelect={goTo} />
      </div>

      <div className="mt-8">
        {stepIndex === 0 ? (
          <OccasionStep
            selected={values.category}
            onSelect={(selected) => {
              form.setValue("category", selected.slug, { shouldDirty: true });
              form.setValue("templateId", selected.defaultTemplateId, {
                shouldDirty: true,
              });
              form.setValue("musicId", selected.defaultMusicId, {
                shouldDirty: true,
              });
              form.setValue(
                "reelTemplateId",
                defaultMemoryTemplateId(selected.slug),
                { shouldDirty: true },
              );
            }}
          />
        ) : null}

        {stepIndex === 1 ? (
          <TemplateStep
            selected={values.templateId}
            category={values.category}
            reelTemplateId={values.reelTemplateId}
            title={values.title || values.receiverName}
            onSelect={(template) =>
              form.setValue("templateId", template.id, { shouldDirty: true })
            }
            onReelSelect={(template) =>
              form.setValue("reelTemplateId", template.id, {
                shouldDirty: true,
              })
            }
          />
        ) : null}

        {stepIndex === 2 ? (
          <ContentStep
            form={form}
            wishId={wish.wishId}
            media={media}
            onAddMedia={addMedia}
            onRemoveMedia={removeMedia}
          />
        ) : null}

        {stepIndex === 3 ? (
          <CollectStep
            wishId={wish.wishId}
            mode={values.mode}
            contributorToken={contributorToken}
            groupEnabled={groupEnabled}
            onChange={(mode) =>
              form.setValue("mode", mode, { shouldDirty: true })
            }
          />
        ) : null}

        {stepIndex === 4 ? (
          <PasswordStep
            wishId={wish.wishId}
            hasPassword={hasPassword}
            initialHint={wish.passwordHint}
            onSaved={(password) => {
              setHasPassword(true);
              setSavedPassword(password);
            }}
          />
        ) : null}

        {stepIndex === 5 ? <PreviewStep values={values} media={media} /> : null}
      </div>

      {stepIndex === STEPS.length - 1 && !canPublish ? (
        <p className="mt-6 text-xs text-ink-muted">
          Add a name, a message, and a password before publishing.
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between border-t border-hairline pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={() => goTo(stepIndex - 1)}
          disabled={stepIndex === 0}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back
        </Button>

        {stepIndex === STEPS.length - 1 ? (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Dashboard
            </Link>
            <Button
              type="button"
              onClick={publish}
              disabled={!canPublish || publishing}
            >
              {publishing ? "Publishing…" : "Publish wish"}
            </Button>
          </div>
        ) : (
          <Button type="button" onClick={() => goTo(stepIndex + 1)}>
            Continue
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
