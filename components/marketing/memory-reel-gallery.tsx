"use client";

import { useState } from "react";
import { MemoryTemplateCard } from "@/src/components/three-memory/memory-template-card";
import { MEMORY_TEMPLATES } from "@/src/components/three-memory/catalog";
import { usePhotoPreview } from "@/src/context/PhotoPreviewContext";

const PAGE_SIZE = 12;

export function MemoryReelGallery() {
  const { photos } = usePhotoPreview();
  const [visible, setVisible] = useState(PAGE_SIZE);

  const shown = MEMORY_TEMPLATES.slice(0, visible);
  const remaining = MEMORY_TEMPLATES.length - shown.length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          120 reels · 8 rigs × 15 atmosphere presets · your photos, live
        </p>
        <p className="text-xs text-ink-muted">
          {shown.length} of {MEMORY_TEMPLATES.length}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {shown.map((template) => (
          <MemoryTemplateCard
            key={template.id}
            template={template}
            photos={photos}
          />
        ))}
      </div>

      {remaining > 0 ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisible((value) =>
                Math.min(value + PAGE_SIZE, MEMORY_TEMPLATES.length),
              )
            }
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-hairline bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-hover"
          >
            Load 12 More Reels
            <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] text-ink-muted">
              {remaining} left
            </span>
          </button>
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-ink-muted">
          All 120 reels loaded.
        </p>
      )}
    </div>
  );
}
