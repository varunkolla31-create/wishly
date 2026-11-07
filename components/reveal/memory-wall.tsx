"use client";

import Image from "next/image";
import type { TemplatePalette } from "@/lib/catalog/types";
import { t } from "@/lib/i18n";
import type { PublicContribution } from "@/lib/wishes/public";
import { cn } from "@/lib/utils/cn";

function Tile({
  item,
  palette,
}: {
  item: PublicContribution;
  palette: TemplatePalette;
}) {
  const media = item.media;

  return (
    <figure
      className="break-inside-avoid overflow-hidden rounded-media border"
      style={{
        borderColor: palette.muted,
        backgroundColor: palette.surface,
      }}
    >
      {media && media.kind === "photo" ? (
        <Image
          src={media.url}
          alt={`From ${item.contributorName}`}
          width={700}
          height={700}
          unoptimized
          className="w-full object-cover"
        />
      ) : null}

      {media && media.kind === "video" ? (
        <video
          src={media.url}
          controls
          playsInline
          preload="metadata"
          className="w-full"
        />
      ) : null}

      {media && media.kind === "voice" ? (
        <div className="p-4">
          <audio
            src={media.url}
            controls
            preload="metadata"
            className="w-full"
          />
        </div>
      ) : null}

      {item.text ? (
        <blockquote
          className={cn(
            "px-4 text-sm leading-relaxed",
            media ? "py-3" : "py-5",
          )}
          style={{ color: palette.text }}
        >
          {item.text}
        </blockquote>
      ) : null}

      <figcaption
        className="border-t px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ borderColor: palette.muted, color: palette.muted }}
      >
        {item.contributorName}
      </figcaption>
    </figure>
  );
}

export function MemoryWall({
  contributions,
  palette,
}: {
  contributions: PublicContribution[];
  palette: TemplatePalette;
}) {
  if (contributions.length === 0) return null;

  return (
    <section className="mt-12">
      <p
        className="text-xs font-semibold uppercase tracking-[0.12em]"
        style={{ color: palette.muted }}
      >
        {t("reveal.fromEveryone")}
      </p>
      <h2
        className="mt-2 font-serif text-3xl italic leading-tight sm:text-4xl"
        style={{ color: palette.text }}
      >
        {t("reveal.memoryTitle")}
      </h2>

      <div className="mt-5 columns-1 gap-3 sm:columns-2">
        {contributions.map((item) => (
          <div key={item.contributionId} className="mb-3">
            <Tile item={item} palette={palette} />
          </div>
        ))}
      </div>
    </section>
  );
}
