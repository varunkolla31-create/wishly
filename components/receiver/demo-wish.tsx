"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
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
import type { DemoWishData } from "@/lib/demo/wishes";

const RADIUS = 104;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DemoWish({ wish }: { wish: DemoWishData }) {
  const reduceMotion = useReducedMotion();
  const template = getTemplateOrDefault(wish.templateId);
  const music = getMusicTrack(wish.musicId);
  const palette = template.palette;

  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const progress = Math.min(password.length / 12, 1);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.trim().toLowerCase() !== wish.password) {
      setError(true);
      return;
    }

    setUnlocked(true);
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
  }

  if (unlocked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.9 }}
      >
        <RevealExperience
          content={{
            receiverName: wish.receiverName,
            title: wish.title,
            message: wish.message,
            bonusNote: wish.bonusNote,
            template,
            music,
            media: [],
            contributions: [],
          }}
        >
          <div
            className="mt-12 rounded-card border p-6 text-center"
            style={{ borderColor: `${palette.muted}33` }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: palette.muted }}
            >
              Live demo
            </p>
            <p className="mt-2 text-sm" style={{ color: palette.muted }}>
              This page is permanent and needs no account. Make one for someone
              who would keep it.
            </p>
            <Link
              href="/create"
              className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-medium text-white"
              style={{ backgroundColor: palette.accent }}
            >
              Create your own
            </Link>
          </div>

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
              <MemoryPreview
                input={{
                  templateId: defaultMemoryTemplateId(wish.category),
                  photos: SAMPLE_PHOTOS,
                  title: wish.title,
                  receiverName: wish.receiverName,
                }}
              />
              <div className="rounded-card bg-black/35 p-4">
                <p className="mb-3 text-xs leading-relaxed text-white/70">
                  This demo uses sample photos. A real wish uses the sender&apos;s
                  photos and downloads the same silent 9:16 reel.
                </p>
                <DownloadReelButton
                  input={{
                    templateId: defaultMemoryTemplateId(wish.category),
                    photos: SAMPLE_PHOTOS,
                    title: wish.title,
                    receiverName: wish.receiverName,
                  }}
                />
              </div>
            </div>
          </section>
        </RevealExperience>
      </motion.div>
    );
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-canvas px-5 py-12 text-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 45% at 50% 38%, rgba(214,194,131,0.14) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Live demo
        </span>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          A wish for you
        </p>
        <p className="mt-1 font-serif text-2xl italic text-gold">
          {wish.receiverName}
        </p>

        <div className="relative mx-auto mt-8 size-60 sm:size-72">
          <svg viewBox="0 0 240 240" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="120" cy="120" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="2" className="text-hairline" />
            <circle
              cx="120"
              cy="120"
              r={RADIUS}
              fill="none"
              stroke="#D6C283"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              style={{
                transition: "stroke-dashoffset 300ms ease-out",
                filter: "drop-shadow(0 0 14px rgba(214,194,131,0.45))",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <Lock aria-hidden="true" className="size-6 text-gold" />
            <span className="text-xs text-ink-muted">Locked</span>
          </div>
        </div>

        <h1 className="mt-8 font-serif text-4xl italic leading-[1.05] text-ink sm:text-5xl">
          This one is just for you.
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Hint: {wish.hint}
        </p>
        <button
          type="button"
          onClick={() => {
            setPassword(wish.password);
            setError(false);
            requestAnimationFrame(() => {
              document.getElementById("demo-password")?.focus();
            });
          }}
          className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-4 text-xs font-medium text-ink transition-colors hover:bg-gold/25"
        >
          <Sparkles aria-hidden="true" className="size-3.5 text-gold" />
          Demo mode: Click to auto-fill password (&apos;{wish.password}&apos;)
        </button>

        <form onSubmit={submit} className="mt-8 space-y-3 text-left">
          <label htmlFor="demo-password" className="sr-only">
            Password
          </label>
          <div className="relative">
            <input
              id="demo-password"
              type={visible ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(false);
              }}
              autoComplete="off"
              maxLength={128}
              aria-invalid={error}
              placeholder="Enter the password"
              className="min-h-14 w-full rounded-full border border-hairline bg-surface px-5 pr-14 text-base text-ink placeholder:text-ink-muted/70"
            />
            <button
              type="button"
              onClick={() => setVisible((value) => !value)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute right-1 top-1 flex size-12 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-hover hover:text-ink"
            >
              {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
            </button>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-error">
              That word didn&apos;t match. The hint is above.
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={!password}>
            Unlock the wish
          </Button>
        </form>

        <p className="mt-8 text-xs text-ink-muted">
          A permanent Wishly demo.{" "}
          <Link href="/create" className="underline underline-offset-4 hover:text-ink">
            Make one for someone
          </Link>
        </p>
      </div>
    </main>
  );
}
