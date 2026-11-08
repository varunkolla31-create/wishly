"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ReplyForm } from "@/components/receiver/reply-form";
import { BirthdayCandle } from "@/components/reveal/birthday-candle";
import { CopyWishLink } from "@/components/reveal/copy-wish-link";
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
  const [replayCandle, setReplayCandle] = useState(false);
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

  const fireConfetti = useCallback(() => {
    if (reduceMotion || template.confetti === "none") return;
    void import("canvas-confetti").then(({ default: confetti }) => {
      confetti({
        particleCount: 110,
        spread: 74,
        startVelocity: 34,
        origin: { y: 0.62 },
        colors: [palette.accent, "#D6C283", "#FFFFFF"],
        disableForReducedMotion: true,
      });
    });
  }, [reduceMotion, template.confetti, palette.accent]);

  useEffect(() => {
    if (!unwrapped) return;
    fireConfetti();
  }, [unwrapped, fireConfetti]);

  if (unwrapped) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 1 }}
      >
        {content.category === "birthday" ? (
          <>
            <button
              type="button"
              onClick={() => setReplayCandle(true)}
              className="fixed bottom-4 left-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-canvas/95 px-4 text-xs font-medium text-ink shadow-lg backdrop-blur transition-colors hover:bg-hover"
            >
              <Sparkles aria-hidden="true" className="size-3.5 text-gold" />
              Replay candle
            </button>

            {replayCandle ? (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/70 p-4"
                role="presentation"
                onClick={() => setReplayCandle(false)}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Replay the birthday candle"
                  className="relative w-full max-w-md rounded-card bg-canvas p-6 text-center shadow-2xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setReplayCandle(false)}
                    aria-label="Close candle replay"
                    className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-hover hover:text-ink"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    One more wish
                  </p>
                  <h2 className="mt-2 font-serif text-3xl italic text-ink">
                    Blow it out again.
                  </h2>
                  <BirthdayCandle
                    onBlown={() => {
                      fireConfetti();
                      setReplayCandle(false);
                    }}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        <RevealExperience
          content={{
            receiverName: content.receiverName,
            title: content.title,
            message: content.message,
            bonusNote: content.bonusNote,
            milestoneDate: content.milestoneDate,
            milestoneLabel: content.milestoneLabel,
            secretScratchMessage: content.secretScratchMessage,
            giftVoucherCode: content.giftVoucherCode,
            template,
            music,
            youtubeMusic: content.music,
            autoPlayMusic: true,
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
                <div className="flex flex-wrap items-start gap-2">
                  <div className="min-w-[210px] flex-1">
                    <DownloadReelButton input={reelInput} />
                  </div>
                  <CopyWishLink wishId={content.id} />
                </div>
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

        {content.category === "birthday" ? (
          <div className="mt-8">
            <BirthdayCandle onBlown={() => setUnwrapped(true)} />
            <button
              type="button"
              onClick={() => setUnwrapped(true)}
              className="mx-auto mt-2 block text-xs text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              Skip the candle
            </button>
          </div>
        ) : (
          <Button size="lg" className="mt-8" onClick={() => setUnwrapped(true)}>
            {t("reveal.action")}
          </Button>
        )}

        <p className="mt-12 text-xs text-ink-muted">{t("common.madeWith")}</p>
      </div>
    </main>
  );
}
