"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ContentStep } from "@/components/wizard/content-step";
import { OccasionStep } from "@/components/wizard/occasion-step";
import { PasswordStep } from "@/components/wizard/password-step";
import { PreviewStep } from "@/components/wizard/preview-step";
import { TemplateStep } from "@/components/wizard/template-step";
import { WizardStepper } from "@/components/wizard/stepper";
import {
  fromLocalDateTimeInput,
  toLocalDateTimeInput,
  WIZARD_STEPS,
  type DraftValues,
} from "@/components/wizard/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { getOccasion } from "@/lib/catalog/occasions";
import type { MediaItem } from "@/lib/media/types";
import type { SenderWish } from "@/lib/repos/dto";

const STEPS = WIZARD_STEPS;

function initialValues(wish: SenderWish): DraftValues {
  return {
    category: wish.category,
    templateId: wish.templateId,
    receiverName: wish.receiverName,
    title: wish.title,
    message: wish.message,
    mediaKeys: wish.mediaKeys,
    musicId: wish.musicId,
    unlockAt: toLocalDateTimeInput(wish.unlockAt),
  };
}

function toPatch(values: DraftValues) {
  return {
    category: values.category,
    templateId: values.templateId,
    receiverName: values.receiverName,
    title: values.title,
    message: values.message,
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
}: {
  wish: SenderWish;
  initialMedia: MediaItem[];
  initialStep: number;
}) {
  const [stepIndex, setStepIndex] = useState(
    Math.max(0, Math.min(STEPS.length - 1, initialStep)),
  );
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [hasPassword, setHasPassword] = useState(wish.hasPassword);
  const [saveState, setSaveState] = useState<SaveState>("saved");

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
        })
        .catch(() => {
          if (sequence === saveSequence.current) setSaveState("error");
        });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [values, wish.wishId]);

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
  const saveLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "error"
        ? "Couldn't save"
        : "Saved";

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
            {occasion?.name ?? "Wish"} · Draft
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
            }}
          />
        ) : null}

        {stepIndex === 1 ? (
          <TemplateStep
            selected={values.templateId}
            title={values.title || values.receiverName}
            onSelect={(template) =>
              form.setValue("templateId", template.id, { shouldDirty: true })
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
          <PasswordStep
            wishId={wish.wishId}
            hasPassword={hasPassword}
            initialHint={wish.passwordHint}
            onSaved={() => setHasPassword(true)}
          />
        ) : null}

        {stepIndex === 4 ? <PreviewStep values={values} media={media} /> : null}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-hairline pt-5">
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
          <ButtonLink href="/dashboard" variant="outline">
            Back to dashboard
          </ButtonLink>
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
