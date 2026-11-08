"use client";

import { useRef } from "react";
import { MemoryTemplatePicker } from "@/src/components/three-memory/memory-template-picker";
import type { MemoryTemplate } from "@/src/components/three-memory/catalog";

export function TemplateStep({
  category,
  reelTemplateId,
  photos,
  onReelSelect,
  onReelConfirm,
}: {
  category: string;
  reelTemplateId: string;
  photos?: string[];
  onReelSelect: (template: MemoryTemplate) => void;
  onReelConfirm?: (template: MemoryTemplate) => void;
}) {
  const advancingRef = useRef(false);

  function handleSelect(template: MemoryTemplate) {
    onReelSelect(template);
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(pointer: coarse)").matches ||
      advancingRef.current
    ) {
      return;
    }
    advancingRef.current = true;
    window.setTimeout(() => {
      advancingRef.current = false;
    }, 600);
    onReelConfirm?.(template);
  }

  return (
    <div>
      <h2 className="font-serif text-3xl italic leading-tight text-ink">
        Pick your 3D reel.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        This is the main event: your photos become a moving 3D scene. The page
        look follows your occasion automatically.
      </p>

      <div className="mt-6 rounded-card border border-hairline bg-surface p-5">
        <MemoryTemplatePicker
          category={category}
          value={reelTemplateId}
          photos={photos}
          onChange={handleSelect}
          onConfirm={onReelConfirm}
        />
      </div>
    </div>
  );
}
