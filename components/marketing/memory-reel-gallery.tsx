"use client";

import { MemoryTemplateCard } from "@/src/components/three-memory/memory-template-card";
import { MEMORY_TEMPLATES } from "@/src/components/three-memory/catalog";
import { usePhotoPreview } from "@/src/context/PhotoPreviewContext";

export function MemoryReelGallery() {
  const { photos } = usePhotoPreview();

  return (
    <div>
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        120 reels · 8 rigs × 15 atmosphere presets · your photos, live
      </p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {MEMORY_TEMPLATES.map((template) => (
          <MemoryTemplateCard
            key={template.id}
            template={template}
            photos={photos}
          />
        ))}
      </div>
    </div>
  );
}
