"use client";

import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { PublicWishMeta } from "@/lib/wishes/public";

const RADIUS = 104;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function LockScreen({ wish }: { wish: PublicWishMeta }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const shakeControls = useAnimation();

  const target = wish.unlockAt ? Date.parse(wish.unlockAt) : null;
  const [now, setNow] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    if (target === null) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(
      () => setCooldown((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    const key = `wishly:view:${wish.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void fetch(`/api/w/${wish.id}/view`, { method: "POST" });
  }, [wish.id]);

  const remaining =
    target !== null && now !== null ? Math.max(0, target - now) : 0;
  const waiting = remaining > 0;
  const progress = Math.min(password.length / 12, 1);

  function shake() {
    if (reduceMotion) return;
    void shakeControls.start({
      x: [0, -9, 9, -6, 6, 0],
      transition: { duration: 0.4 },
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || waiting || submitting || cooldown > 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/w/${wish.id}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push(`/w/${wish.id}/reveal`);
        router.refresh();
        return;
      }

      if (response.status === 429) {
        const retry = Number(response.headers.get("retry-after") ?? "60");
        setCooldown(Number.isFinite(retry) && retry > 0 ? retry : 60);
        setError("Too many tries. Wait a moment, then try again.");
        shake();
        return;
      }

      if (response.status === 403) {
        setError("This wish still has a little time left.");
        return;
      }

      setAttempts((value) => value + 1);
      setError("That password didn't match. Try again.");
      shake();
    } catch {
      setError("Something went wrong. Try once more.");
    } finally {
      setSubmitting(false);
    }
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          A wish for
        </p>
        <p className="mt-1 font-serif text-2xl italic text-gold">
          {wish.receiverName || "you"}
        </p>

        <div className="relative mx-auto mt-8 size-60 sm:size-72">
          <svg
            viewBox="0 0 240 240"
            className="size-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="120"
              cy="120"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-hairline"
            />
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
            {waiting ? (
              <>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Opens in
                </span>
                <span className="font-mono text-xl text-ink">
                  {formatRemaining(remaining)}
                </span>
              </>
            ) : (
              <>
                <Lock aria-hidden="true" className="size-6 text-gold" />
                <span className="text-xs text-ink-muted">Locked</span>
              </>
            )}
          </div>
        </div>

        <h1 className="mt-8 font-serif text-4xl italic leading-[1.05] text-ink sm:text-5xl">
          Someone made something for you.
        </h1>

        {wish.hint ? (
          <p className="mt-3 text-sm text-ink-muted">Hint: {wish.hint}</p>
        ) : null}

        <motion.form
          animate={shakeControls}
          onSubmit={submit}
          className="mt-8 space-y-3 text-left"
        >
          <label htmlFor="wish-password" className="sr-only">
            Password
          </label>
          <div className="relative">
            <input
              id="wish-password"
              type={visible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="off"
              maxLength={128}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "unlock-error" : undefined}
              placeholder="Enter the password"
              className="min-h-14 w-full rounded-full border border-hairline bg-surface px-5 pr-14 text-base text-ink placeholder:text-ink-muted/70"
            />
            <button
              type="button"
              onClick={() => setVisible((value) => !value)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute right-1 top-1 flex size-12 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-hover hover:text-ink"
            >
              {visible ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>

          {error ? (
            <p id="unlock-error" role="alert" className="text-sm text-error">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={
              !password || waiting || submitting || cooldown > 0
            }
          >
            {cooldown > 0
              ? `Try again in ${cooldown}s`
              : submitting
                ? "Unlocking…"
                : "Unlock"}
          </Button>

          {attempts >= 3 && cooldown === 0 ? (
            <p className="text-center text-xs text-ink-muted">
              A few wrong tries will trigger a short cooldown.
            </p>
          ) : null}
        </motion.form>

        <p className="mt-8 text-xs text-ink-muted">
          <Link
            href={`/report?wish=${wish.id}`}
            className="underline underline-offset-4 transition-colors hover:text-ink"
          >
            Report this page
          </Link>
          <span aria-hidden="true"> · </span>
          Made with Wishly
        </p>
      </div>
    </main>
  );
}
