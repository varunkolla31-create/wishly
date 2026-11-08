"use client";

import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";
import { AiIdeaPanel } from "@/components/wizard/ai-idea-panel";
import { MediaUploader } from "@/components/wizard/media-uploader";
import type { DraftValues } from "@/components/wizard/types";
import { YouTubeMusicPicker } from "@/components/music/youtube-music-picker";
import { getMusicTrack } from "@/lib/catalog/music";
import {
  defaultMemoryTemplateId,
  SAMPLE_PHOTOS,
} from "@/src/components/three-memory/catalog";
import { MemoryPreview } from "@/src/components/three-memory/memory-preview";
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
  const photos = media
    .filter((item) => item.kind === "photo")
    .map((item) => item.url);
  const reelId = values.reelTemplateId || defaultMemoryTemplateId(values.category);
  const reelPhotos =
    photos.length >= 3
      ? photos.slice(0, 10)
      : [...photos, ...SAMPLE_PHOTOS].slice(0, 6);

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

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="milestoneDate" className={labelClass}>
                Count up from a special date (optional)
              </label>
              <input
                id="milestoneDate"
                type="date"
                {...form.register("milestoneDate")}
                className={`mt-1 ${inputClass}`}
              />
              <p className={hintClass}>
                The reveal page ticks live: years, days, hours, minutes,
                seconds.
              </p>
            </div>
            <div>
              <label htmlFor="milestoneLabel" className={labelClass}>
                Counter label
              </label>
              <input
                id="milestoneLabel"
                {...form.register("milestoneLabel")}
                maxLength={60}
                placeholder="Time since you brightened the world"
                className={`mt-1 ${inputClass}`}
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="secretScratchMessage" className={labelClass}>
              Secret scratch card message (optional)
            </label>
            <textarea
              id="secretScratchMessage"
              {...form.register("secretScratchMessage")}
              rows={3}
              maxLength={300}
              placeholder="A hidden message they scratch off with a finger."
              className="mt-1 w-full rounded-card border border-hairline bg-canvas px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-muted/70"
            />
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className={hintClass}>
                Hidden behind shimmering gold foil on the reveal page.
              </p>
              <span className="text-xs text-ink-muted">
                {values.secretScratchMessage.length}/300
              </span>
            </div>
            <label
              htmlFor="giftVoucherCode"
              className={`${labelClass} mt-4`}
            >
              Gift voucher code (optional)
            </label>
            <input
              id="giftVoucherCode"
              {...form.register("giftVoucherCode")}
              maxLength={80}
              placeholder="AMAZON-XXXX or COFFEE-DATE"
              className={`mt-1 ${inputClass}`}
            />
            <p className={hintClass}>
              Revealed in a gold pill after the scratch card is cleared.
            </p>
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
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium text-ink">3D memory reel</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                The reel uses your photos. Drag the preview to explore it.
              </p>
            </div>
            <Link
              href={`/studio/${reelId}`}
              className="text-xs font-medium text-coral-strong hover:text-coral-hover"
            >
              Open full studio →
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr] sm:items-start">
            <MemoryPreview
              input={{
                templateId: reelId,
                photos: reelPhotos,
                title: values.title || "A memory for you",
                receiverName: values.receiverName,
              }}
            />
            <div className="space-y-3 text-xs leading-relaxed text-ink-muted">
              <p>
                {photos.length >= 3
                  ? `${photos.length} photo${photos.length === 1 ? "" : "s"} in the reel.`
                  : `Add ${3 - photos.length} more photo${3 - photos.length === 1 ? "" : "s"} to fill it; samples are showing for now.`}
              </p>
              <p>
                The download is a silent 9:16 video for Stories, Reels and
                WhatsApp Status. No Spotify or YouTube audio is included.
              </p>
              <p>
                The receiver can open the same 3D scene and download their own
                copy after unlocking.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-hairline bg-surface p-5">
          <h2 className="text-sm font-medium text-ink">Music from YouTube</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            The Top 10 plays while they read. Pick one song — choosing another
            replaces it.
          </p>
          <div className="mt-4">
            <YouTubeMusicPicker
              value={values.music}
              legacyTrack={getMusicTrack(values.musicId)}
              onChange={(music) => {
                form.setValue("music", music, { shouldDirty: true });
                form.setValue("musicId", null, { shouldDirty: true });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
