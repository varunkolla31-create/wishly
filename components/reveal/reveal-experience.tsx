"use client";

import { MemoryWall } from "@/components/reveal/memory-wall";
import { MilestoneCounter } from "@/components/reveal/milestone-counter";
import { MusicMiniPlayer } from "@/components/reveal/music-mini-player";
import { RevealGallery } from "@/components/reveal/reveal-gallery";
import { ScratchCard } from "@/components/reveal/scratch-card";
import { TypedMessage } from "@/components/reveal/typed-message";
import { YouTubeBackgroundPlayer } from "@/components/reveal/youtube-background-player";
import type {
  MusicTrack,
  TemplateDefinition,
} from "@/lib/catalog/types";
import type { MediaItem } from "@/lib/media/types";
import type { MusicBinding } from "@/lib/music/types";
import type { PublicContribution } from "@/lib/wishes/public";
import { cn } from "@/lib/utils/cn";

export interface RevealContent {
  receiverName: string;
  title: string;
  message: string;
  bonusNote?: string | null;
  milestoneDate?: string | null;
  milestoneLabel?: string | null;
  secretScratchMessage?: string | null;
  giftVoucherCode?: string | null;
  template: TemplateDefinition;
  music: MusicTrack | null;
  youtubeMusic?: MusicBinding | null;
  autoPlayMusic?: boolean;
  media: MediaItem[];
  contributions?: PublicContribution[];
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
  const midnight = template.id === "midnight-glow";
  const scratchMessage =
    content.secretScratchMessage?.trim() || content.bonusNote?.trim() || null;

  const letter = (
    <>
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

      {content.milestoneDate ? (
        <MilestoneCounter
          date={content.milestoneDate}
          label={content.milestoneLabel}
          palette={palette}
        />
      ) : null}

      <TypedMessage
        text={content.message || "Your message will appear here."}
        className="mt-8"
      />
    </>
  );

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

      {midnight ? (
        <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-5 pb-28 pt-12 sm:px-8 sm:pt-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <div className="lg:sticky lg:top-10 lg:self-start">{letter}</div>
            <RevealGallery media={media} template={template} />
          </div>
          {scratchMessage ? (
            <ScratchCard
              message={scratchMessage}
              voucherCode={content.giftVoucherCode}
              palette={palette}
            />
          ) : null}
          <MemoryWall
            contributions={content.contributions ?? []}
            palette={palette}
          />
          {children}
        </div>
      ) : (
        <div className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-5 pb-28 pt-12 sm:px-8 sm:pt-16">
          {letter}
          <RevealGallery media={media} template={template} />
          {scratchMessage ? (
            <ScratchCard
              message={scratchMessage}
              voucherCode={content.giftVoucherCode}
              palette={palette}
            />
          ) : null}
          <MemoryWall
            contributions={content.contributions ?? []}
            palette={palette}
          />
          {children}
        </div>
      )}

      {content.youtubeMusic ? (
        <YouTubeBackgroundPlayer
          music={content.youtubeMusic}
          autoPlay={content.autoPlayMusic}
        />
      ) : music ? (
        <MusicMiniPlayer track={music} />
      ) : null}
    </div>
  );
}
