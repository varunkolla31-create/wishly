"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { BirthdayCandle } from "@/components/reveal/birthday-candle";
import { RevealExperience } from "@/components/reveal/reveal-experience";
import { getMusicTrack } from "@/lib/catalog/music";
import { getTemplateOrDefault } from "@/lib/catalog/templates";
import {
  guestPayloadFromHash,
  loadGuestWish,
  type GuestWishPayload,
} from "@/lib/demo/guest-wish";

export function GuestWishPage({ guestId }: { guestId: string }) {
  const [payload, setPayload] = useState<GuestWishPayload | null | undefined>(
    undefined,
  );
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const fromHash = guestPayloadFromHash(window.location.hash);
    setPayload(fromHash ?? loadGuestWish(guestId));
  }, [guestId]);

  const template = payload ? getTemplateOrDefault(payload.templateId) : null;
  const music = payload ? getMusicTrack(payload.musicId) : null;
  const palette = template?.palette;

  const fireConfetti = useCallback(() => {
    if (reduceMotion || template?.confetti === "none") return;
    void import("canvas-confetti").then(({ default: confetti }) => {
      confetti({
        particleCount: 120,
        spread: 76,
        startVelocity: 34,
        origin: { y: 0.62 },
        colors: [palette?.accent ?? "#D6C283", "#D6C283", "#FFFFFF"],
        disableForReducedMotion: true,
      });
    });
  }, [reduceMotion, template?.confetti, palette?.accent]);

  if (payload === undefined) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas px-6 text-sm text-ink-muted">
        Opening this wish…
      </main>
    );
  }

  if (!payload || !template) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-canvas px-6 text-center text-ink">
        <p className="font-serif text-3xl italic">This instant wish isn&apos;t here.</p>
        <p className="max-w-sm text-sm text-ink-muted">
          Ask the sender for the full link. Guest wishes carry their story in
          the URL, so a trimmed link won&apos;t open.
        </p>
        <Link href="/create" className="text-sm underline underline-offset-4">
          Create one instead
        </Link>
      </main>
    );
  }

  const isBirthday = payload.category === "birthday";
  const isHeart =
    payload.category === "love-valentine" ||
    payload.category === "anniversary" ||
    payload.id.includes("midnight");

  return (
    <div>
      <div className="flex justify-center pt-5">
        <span className="rounded-full border border-hairline bg-canvas px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Guest wish · no account needed
        </span>
      </div>

      {isBirthday ? (
        <section
          className="mx-auto mt-6 max-w-2xl rounded-card border p-6 text-center"
          style={{
            borderColor: `${template.palette.muted}33`,
            backgroundColor: template.palette.surface,
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: template.palette.muted }}
          >
            Before you read
          </p>
          <h2
            className="mt-2 font-serif text-3xl italic leading-tight"
            style={{ color: template.palette.text }}
          >
            Make a wish.
          </h2>
          <div className="mt-4">
            <BirthdayCandle onBlown={fireConfetti} />
          </div>
        </section>
      ) : null}

      <RevealExperience
        content={{
          receiverName: payload.receiverName,
          title: payload.title,
          message: payload.message,
          milestoneDate: payload.milestoneDate,
          milestoneLabel: payload.milestoneLabel,
          heartbeat: isHeart,
          secretScratchMessage: payload.secretScratchMessage,
          giftVoucherCode: payload.giftVoucherCode,
          template,
          music,
          youtubeMusic: payload.music,
          autoPlayMusic: true,
          media: [],
          contributions: [],
        }}
      >
        <div className="mt-12 rounded-card border border-hairline bg-canvas/80 p-5 text-center text-sm text-ink-muted">
          This is a guest wish, carried entirely in its link.{" "}
          <Link href="/create" className="underline underline-offset-4">
            Make your own
          </Link>
        </div>
      </RevealExperience>
    </div>
  );
}
