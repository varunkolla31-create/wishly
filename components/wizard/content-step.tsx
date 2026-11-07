"use client";

import type { UseFormReturn } from "react-hook-form";
import { AiIdeaPanel } from "@/components/wizard/ai-idea-panel";
import { MediaUploader } from "@/components/wizard/media-uploader";
import { MusicPicker } from "@/components/wizard/music-picker";
import type { DraftValues } from "@/components/wizard/types";
import { getOccasion } from "@/lib/catalog/occasions";
import type { MediaItem } from "@/lib/media/types";

const inputClass =
  "min-h-12 w-full rounded-full border border-hairline bg-canvas px-4 text-sm text-ink placeholder:text-ink-muted/70";

const labelClass = "block text-xs font-medium text-ink-muted";
const hintClass = "mt-1 text-xs leading-relaxed text-ink-muted";

interface ContentStepProps {
  form: UseFormReturn<DraftValues>;
  wishId: string;
  media: MediaItem[];
  onAddMedia: (item: MediaItem) => void;
  onRemoveMedia: (key: string) => void;
}

export function ContentStep({
  form,
  wishId,
  media,
  onAddMedia,
  onRemoveMedia,
}: ContentStepProps) {
  const values = form.watch();
  const occasion = getOccasion(values.category);
  const tone = occasion?.tone ?? "fun";

  function appendIdea(idea: string) {
    const current = form.getValues("message").trim();
    form.setValue("message", current ? `${current}\n\n${idea}` : idea, {
      shouldDirty: true,
    });
  }

  return (
    <div>
      <h2 className="font-serif text-3xl italic leading-tight text-ink">
        Give it the words.
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        Keep it specific. The small details are what they&apos;ll remember.
      </p>

      <div className="mt-6 space-y-6">
        <div className="rounded-card border border-hairline bg-surface p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="receiverName" className={labelClass}>
                Their name
              </label>
              <input
                id="receiverName"
                {...form.register("receiverName")}
                maxLength={80}
                placeholder="Amma"
                className={`mt-1 ${inputClass}`}
              />
              <p className={hintClass}>Shown on the lock screen.</p>
            </div>
            <div>
              <label htmlFor="title" className={labelClass}>
                Title
              </label>
              <input
                id="title"
                {...form.register("title")}
                maxLength={120}
                placeholder="Happy birthday, Amma"
                className={`mt-1 ${inputClass}`}
              />
              <p className={hintClass}>The first line after they unlock.</p>
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="message" className={labelClass}>
              Your message
            </label>
            <div className="mt-1 grid gap-4 lg:grid-cols-[1fr_320px]">
              <div>
                <textarea
                  id="message"
                  {...form.register("message")}
                  rows={8}
                  maxLength={4000}
                  placeholder="Write like you're talking to them."
                  className="min-h-48 w-full rounded-card border border-hairline bg-canvas px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-muted/70"
                />
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className={hintClass}>Line breaks are kept.</p>
                  <span className="text-xs text-ink-muted">
                    {values.message.length}/4000
                  </span>
                </div>
              </div>
              <AiIdeaPanel
                category={values.category}
                tone={tone}
                onPick={appendIdea}
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="unlockAt" className={labelClass}>
              Open it on a certain day (optional)
            </label>
            <input
              id="unlockAt"
              type="datetime-local"
              {...form.register("unlockAt")}
              className={`mt-1 ${inputClass} sm:max-w-xs`}
            />
            <p className={hintClass}>
              Before this time they&apos;ll see a countdown inside the lock ring.
            </p>
          </div>
        </div>

        <div className="rounded-card border border-hairline bg-surface p-5">
          <h2 className="text-sm font-medium text-ink">Photos, video, voice</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Nothing is public. These stay behind the password.
          </p>
          <div className="mt-5">
            <MediaUploader
              wishId={wishId}
              media={media}
              onAdd={onAddMedia}
              onRemove={onRemoveMedia}
            />
          </div>
        </div>

        <div className="rounded-card border border-hairline bg-surface p-5">
          <h2 className="text-sm font-medium text-ink">Music</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            A looping track that plays while they read.
          </p>
          <div className="mt-4">
            <MusicPicker
              value={values.musicId}
              onChange={(musicId) =>
                form.setValue("musicId", musicId, { shouldDirty: true })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
