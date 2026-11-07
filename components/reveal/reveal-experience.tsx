"use client";

import Image from "next/image";
import { MusicMiniPlayer } from "@/components/reveal/music-mini-player";
import { TypedMessage } from "@/components/reveal/typed-message";
import type {
  MusicTrack,
  PhotoLayout,
  TemplateDefinition,
} from "@/lib/catalog/types";
import type { MediaItem } from "@/lib/media/types";
import { cn } from "@/lib/utils/cn";

export interface RevealContent {
  receiverName: string;
  title: string;
  message: string;
  template: TemplateDefinition;
  music: MusicTrack | null;
  media: MediaItem[];
}

function Gallery({
  media,
  layout,
}: {
  media: MediaItem[];
  layout: PhotoLayout;
}) {
  const photos = media.filter((item) => item.kind === "photo");
  const videos = media.filter((item) => item.kind === "video");
  const voices = media.filter((item) => item.kind === "voice");

  if (media.length === 0) return null;

  return (
    <div className="mt-10 space-y-6">
      {photos.length > 0 ? (
        <div
          className={cn(
            "grid gap-3",
            layout === "stack" ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          {photos.map((photo, index) => (
            <div
              key={photo.key}
              className={cn(
                "overflow-hidden rounded-media",
                layout !== "stack" && "aspect-[4/5]",
                layout === "collage" && index === 0 && "col-span-2",
              )}
            >
              <Image
                src={photo.url}
                alt={`Photo ${index + 1}`}
                width={900}
                height={1100}
                unoptimized
                className={cn(
                  "w-full",
                  layout === "stack" ? "h-auto" : "h-full object-cover",
                )}
              />
            </div>
          ))}
        </div>
      ) : null}

      {videos.map((video) => (
        <video
          key={video.key}
          src={video.url}
          controls
          playsInline
          preload="metadata"
          className="w-full rounded-media border border-black/10"
        />
      ))}

      {voices.map((voice, index) => (
        <div
          key={voice.key}
          className="rounded-media border border-current/15 p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-60">
            Voice note {voices.length > 1 ? index + 1 : ""}
          </p>
          <audio src={voice.url} controls preload="metadata" className="mt-2 w-full">
            Your browser does not support audio playback.
          </audio>
        </div>
      ))}
    </div>
  );
}

export function RevealExperience({
  content,
  className,
  children,
}: {
  content: RevealContent;
  className?: string;
  children?: React.ReactNode;
}) {
  const { template, music, media } = content;
  const { palette } = template;

  return (
    <div
      className={cn("relative flex flex-col overflow-hidden", className)}
      style={{ backgroundColor: palette.background, color: palette.text }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(120% 80% at 50% 0%, ${palette.surface} 0%, transparent 62%)`,
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <p
          className="text-xs font-semibold uppercase tracking-[0.12em]"
          style={{ color: palette.muted }}
        >
          {content.receiverName ? `For ${content.receiverName}` : "For you"}
        </p>

        <h1
          className={cn(
            "mt-3 text-4xl leading-[1.05] sm:text-6xl",
            template.titleStyle === "serif"
              ? "font-serif italic"
              : "font-sans font-semibold tracking-tight",
          )}
          style={{ color: palette.text }}
        >
          {content.title || "A little something"}
        </h1>

        <span
          aria-hidden="true"
          className="mt-4 block h-1 w-12 rounded-full"
          style={{ backgroundColor: palette.accent }}
        />

        <TypedMessage
          text={content.message || "Your message will appear here."}
          className="mt-8"
        />

        <Gallery media={media} layout={template.photoLayout} />

        {children}
      </div>

      {music ? <MusicMiniPlayer track={music} palette={palette} /> : null}
    </div>
  );
}
