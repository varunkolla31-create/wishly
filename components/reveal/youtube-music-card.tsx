"use client";

import { YouTubePlayer } from "@/components/music/youtube-player";
import type { TemplatePalette } from "@/lib/catalog/types";
import type { MusicBinding } from "@/lib/music/types";

export function YouTubeMusicCard({
  music,
  palette,
}: {
  music: MusicBinding;
  palette: TemplatePalette;
}) {
  return (
    <div
      className="mt-8 rounded-card border p-4"
      style={{
        borderColor: `${palette.muted}33`,
        backgroundColor: "rgba(0,0,0,0.18)",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: palette.muted }}
      >
        Music · YouTube
      </p>
      <h3
        className="mt-1 font-serif text-xl italic leading-tight"
        style={{ color: palette.text }}
      >
        {music.title}
      </h3>
      <p className="mt-0.5 text-xs" style={{ color: palette.muted }}>
        {music.channel || "YouTube"}
      </p>
      <div className="mt-3">
        <YouTubePlayer
          videoId={music.videoId}
          title={music.title}
          startAtSeconds={music.startAtSeconds ?? 0}
        />
      </div>
      <a
        href={music.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-xs underline underline-offset-4"
        style={{ color: palette.muted }}
      >
        Watch on YouTube
      </a>
    </div>
  );
}
