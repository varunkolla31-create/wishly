"use client";

import {
  memoryTemplatesForCategory,
  type MemoryTemplate,
} from "@/src/components/three-memory/catalog";
import { MemoryCardArt } from "@/src/components/three-memory/memory-card-art";
import { usePhotoPreview } from "@/src/context/PhotoPreviewContext";
import { cn } from "@/lib/utils/cn";

export function MemoryTemplatePicker({
  category,
  value,
  photos,
  onChange,
  onConfirm,
}: {
  category: string;
  value: string;
  photos?: string[];
  onChange: (template: MemoryTemplate) => void;
  /** Double-click a reel to select it and move on. */
  onConfirm?: (template: MemoryTemplate) => void;
}) {
  const options = memoryTemplatesForCategory(category);
  const { photos: galleryPhotos } = usePhotoPreview();
  const previewPhotos =
    photos && photos.length > 0
      ? photos
      : galleryPhotos.length > 0
        ? galleryPhotos
        : undefined;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-ink">3D memory reel</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Made for {category.replaceAll("-", " ")}. Tap a reel to add your
            photos and videos. On desktop, double-click or press Continue to
            select it and move on.
          </p>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((template) => {
          const active = template.id === value;
          return (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => onChange(template)}
                onDoubleClick={() => {
                  if (window.matchMedia("(pointer: coarse)").matches) return;
                  onChange(template);
                  onConfirm?.(template);
                }}
                aria-pressed={active}
                title="Select this reel"
                className={cn(
                  "block w-full rounded-card p-1 text-left transition",
                  active
                    ? "bg-canvas ring-2 ring-coral"
                    : "hover:bg-hover focus-visible:bg-hover",
                )}
              >
                <MemoryCardArt
                  template={template}
                  photos={previewPhotos}
                />
                <span className="mt-2 block px-1 text-xs font-medium text-ink">
                  {template.name}
                </span>
                <span className="mt-0.5 block px-1 text-[11px] leading-snug text-ink-muted">
                  {template.tagline}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
