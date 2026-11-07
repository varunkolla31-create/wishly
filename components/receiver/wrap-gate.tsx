"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ReplyForm } from "@/components/receiver/reply-form";
import { RevealExperience } from "@/components/reveal/reveal-experience";
import { DownloadReelButton } from "@/src/components/three-memory/download-reel-button";
import { MemoryPreview } from "@/src/components/three-memory/memory-preview";
import {
  defaultMemoryTemplateId,
  SAMPLE_PHOTOS,
} from "@/src/components/three-memory/catalog";
import { Button } from "@/components/ui/button";
import { getMusicTrack } from "@/lib/catalog/music";
import { getTemplateOrDefault } from "@/lib/catalog/templates";
import { t } from "@/lib/i18n";
import type { PublicWishContent } from "@/lib/wishes/public";

export function WrapGate({ content }: { content: PublicWishContent }) {
  const [unwrapped, setUnwrapped] = useState(false);
  const reduceMotion = useReducedMotion();
  const template = getTemplateOrDefault(content.templateId);
  const music = getMusicTrack(content.musicId);
  const palette = template.palette;
  const reelPhotos = content.media
    .filter((item) => item.kind === "photo")
    .map((item) => item.url);
  const reelInput = {
    templateId: content.reelTemplateId ?? defaultMemoryTemplateId(content.category),
    photos: reelPhotos.length >= 3 ? reelPhotos : SAMPLE_PHOTOS,
    title: content.title,
    receiverName: content.receiverName,
  };

  useEffect(() => {
    if (!unwrapped || reduceMotion || template.confetti === "none") return;

    let active = true;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (!active) return;
      confetti({
        particleCount: 110,
        spread: 74,
        startVelocity: 34,
        origin: { y: 0.62 },
        colors: [palette.accent, "#D6C283", "#FFFFFF"],
        disableForReducedMotion: true,
      });
    });

    return () => {
      active = false;
    };
  }, [unwrapped, reduceMotion, template, palette.accent]);

  if (unwrapped) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 1 }}
      >
        <RevealExperience
          content={{
            receiverName: content.receiverName,
            title: content.title,
            message: content.message,
            bonusNote: content.bonusNote,
            template,
            music,
            youtubeMusic: content.music,
            media: content.media,
            contributions: content.contributions,
          }}
        >
          <section className="mt-12">
            <p
              className="text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: palette.muted }}
            >
              3D memory reel
            </p>
            <h2
              className="mt-2 font-serif text-3xl italic leading-tight sm:text-4xl"
              style={{ color: palette.text }}
            >
              Move through the memory.
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-start">
              <MemoryPreview input={reelInput} />
              <div className="rounded-card bg-black/35 p-4">
                <DownloadReelButton input={reelInput} />
              </div>
            </div>
          </section>

          <ReplyForm wishId={content.id} palette={palette} />
          <p
            className="mt-8 text-center text-xs"
            style={{ color: palette.muted }}
          >
            <Link
              href={`/report?wish=${content.id}`}
              className="underline underline-offset-4"
            >
              Report this page
            </Link>
            <span aria-hidden="true"> · </span>
            Made with Wishly
          </p>
        </RevealExperience>
      </motion.div>
    );
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-canvas px-6 py-12 text-center text-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(55% 40% at 50% 40%, rgba(214,194,131,0.16) 0%, transparent 70%)",
        }}
      />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {t("reveal.overline")}
        </p>

        <div className="relative mx-auto mt-8 size-32">
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-coral to-coral-hover shadow-glow" />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 bg-gold/90"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 bg-gold/90"
          />
          <div
            aria-hidden="true"
            className="absolute -top-3 left-1/2 size-8 -translate-x-1/2 rotate-45 rounded-sm border-2 border-gold bg-coral"
          />
        </div>

        <h1 className="mt-12 font-serif text-4xl italic leading-[1.05] text-ink sm:text-5xl">
          {t("reveal.heading", { name: content.receiverName || "you" })}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
          {t("reveal.subheading")}
        </p>

        <Button size="lg" className="mt-8" onClick={() => setUnwrapped(true)}>
          {t("reveal.action")}
        </Button>

        <p className="mt-12 text-xs text-ink-muted">{t("common.madeWith")}</p>
      </div>
    </main>
  );
}
