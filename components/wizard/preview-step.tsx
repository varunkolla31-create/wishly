"use client";

import { Video } from "lucide-react";
import { RevealExperience } from "@/components/reveal/reveal-experience";
import { defaultMemoryTemplateId } from "@/src/components/three-memory/catalog";
import type { DraftValues } from "@/components/wizard/types";
import { getMusicTrack } from "@/lib/catalog/music";
import { getTemplateOrDefault } from "@/lib/catalog/templates";
import type { MediaItem } from "@/lib/media/types";

export function PreviewStep({
  values,
  media,
}: {
  values: DraftValues;
  media: MediaItem[];
}) {
  const template = getTemplateOrDefault(values.templateId);
  const music = getMusicTrack(values.musicId);
  const visibleMedia = media.filter((item) =>
    values.mediaKeys.includes(item.key),
  );

  return (
    <div>
      <h2 className="font-serif text-3xl italic leading-tight text-ink">
        Exactly what they&apos;ll see.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        This is the page after unlocking. Before that, they only see the lock
        screen and your hint.
      </p>

      <div className="mt-6 overflow-hidden rounded-card border border-hairline shadow-soft">
        <RevealExperience
          className="min-h-[560px] sm:min-h-[680px]"
          content={{
            receiverName: values.receiverName,
            title: values.title,
            message: values.message,
            bonusNote: values.bonusNote,
            template,
            music,
            media: visibleMedia,
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-hairline bg-surface p-4">
        <p className="text-sm text-ink-muted">
          Want this in motion? Build a short video with the same look.
        </p>
        <a
          href={`/studio/${defaultMemoryTemplateId(values.category)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
        >
          <Video aria-hidden="true" className="size-4" />
          Create a 3D reel
        </a>
      </div>
    </div>
  );
}
