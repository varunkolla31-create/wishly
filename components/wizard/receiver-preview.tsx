"use client";

import { Eye, EyeOff, Lock, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { RevealExperience } from "@/components/reveal/reveal-experience";
import { Button } from "@/components/ui/button";
import { getMusicTrack } from "@/lib/catalog/music";
import { getTemplateOrDefault } from "@/lib/catalog/templates";
import type { MediaItem } from "@/lib/media/types";
import type { MusicBinding } from "@/lib/music/types";
import { cn } from "@/lib/utils/cn";

export interface ReceiverPreviewProps {
  receiverName: string;
  title: string;
  message: string;
  templateId: string;
  musicId: string | null;
  music: MusicBinding | null;
  milestoneDate?: string | null;
  milestoneLabel?: string | null;
  secretScratchMessage?: string | null;
  giftVoucherCode?: string | null;
  heartbeat?: boolean;
  unlockAt?: string | null;
  hint?: string | null;
  gateMode?: "password" | "quiz" | "both";
  quizQuestion?: string;
  quizOptions?: string[];
  media: MediaItem[];
}

function countdownParts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function toIso(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function ReceiverPreview(props: ReceiverPreviewProps) {
  const {
    receiverName,
    title,
    message,
    templateId,
    musicId,
    music,
    milestoneDate,
    milestoneLabel,
    secretScratchMessage,
    giftVoucherCode,
    heartbeat,
    unlockAt,
    hint,
    gateMode = "password",
    quizQuestion,
    quizOptions,
    media,
  } = props;

  const [tab, setTab] = useState<"lock" | "reveal">("lock");
  const [skipCountdown, setSkipCountdown] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const target = unlockAt ? Date.parse(unlockAt) : null;
  const waiting =
    !skipCountdown &&
    target !== null &&
    !Number.isNaN(target) &&
    target > now;

  useEffect(() => {
    if (!waiting) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [waiting]);

  const template = getTemplateOrDefault(templateId);
  const track = musicId ? getMusicTrack(musicId) : null;

  const content = useMemo(
    () => ({
      receiverName,
      title,
      message,
      milestoneDate: toIso(milestoneDate),
      milestoneLabel: milestoneLabel ?? null,
      secretScratchMessage: secretScratchMessage ?? null,
      giftVoucherCode: giftVoucherCode ?? null,
      heartbeat,
      template,
      music: track,
      youtubeMusic: music,
      autoPlayMusic: false,
      media,
    }),
    [
      receiverName,
      title,
      message,
      milestoneDate,
      milestoneLabel,
      secretScratchMessage,
      giftVoucherCode,
      heartbeat,
      template,
      track,
      music,
      media,
    ],
  );

  const parts = countdownParts((target ?? now) - now);
  const needsPassword = gateMode !== "quiz";

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (needsPassword && password.trim().length === 0) return;
    setTab("reveal");
  }

  const tabs = [
    { id: "lock" as const, label: "Lock screen" },
    { id: "reveal" as const, label: "Opened view" },
  ];

  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-canvas">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface px-4 py-3">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          <Sparkles aria-hidden="true" className="size-3.5 text-gold" />
          Receiver preview · nothing is published
        </p>
        <div className="flex gap-1.5">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              className={cn(
                "min-h-8 rounded-full border px-3 text-[11px] font-medium transition-colors",
                tab === item.id
                  ? "border-ink bg-ink text-canvas"
                  : "border-hairline bg-canvas text-ink-muted hover:bg-hover hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "lock" ? (
        <div className="flex flex-col items-center px-5 py-10 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            A private wish, unlocked
          </p>
          <p className="mt-1 font-serif text-2xl italic text-gold">
            {receiverName || "you"}
          </p>

          {waiting ? (
            <>
              <p className="mt-8 font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
                Not yet.
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                This wish opens on{" "}
                <strong className="font-medium text-ink">
                  {new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "long",
                    timeStyle: "short",
                  }).format(new Date(target ?? now))}
                </strong>
                .
              </p>
              <div
                className="mt-6 grid w-full max-w-sm grid-cols-4 gap-2"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {[
                  ["Days", parts.days],
                  ["Hours", parts.hours],
                  ["Min", parts.minutes],
                  ["Sec", parts.seconds],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-card border border-hairline bg-surface px-2 py-3"
                  >
                    <span className="block font-mono text-2xl leading-none text-ink">
                      {String(value).padStart(2, "0")}
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSkipCountdown(true)}
                className="mt-5 text-xs font-medium text-coral-strong underline underline-offset-4 hover:text-coral-hover"
              >
                Skip to the password screen
              </button>
            </>
          ) : (
            <>
              <div className="relative mt-6 flex size-24 items-center justify-center rounded-full border border-hairline bg-surface">
                <Lock aria-hidden="true" className="size-7 text-gold" />
              </div>
              <h3 className="mt-5 font-serif text-3xl italic leading-tight text-ink">
                A wish for you.
              </h3>
              {hint ? (
                <p className="mt-2 text-sm text-ink-muted">Hint: {hint}</p>
              ) : null}

              {gateMode !== "password" && quizQuestion ? (
                <div className="mt-5 w-full max-w-sm space-y-2 text-left">
                  <p className="text-sm font-medium text-ink">{quizQuestion}</p>
                  {(quizOptions ?? []).map((option, index) => (
                    <div
                      key={`${option}-${index}`}
                      className="min-h-10 rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-ink"
                    >
                      {option || `Answer ${index + 1}`}
                    </div>
                  ))}
                </div>
              ) : null}

              <form onSubmit={unlock} className="mt-5 w-full max-w-sm space-y-3">
                {needsPassword ? (
                  <div className="relative">
                    <label htmlFor="preview-password" className="sr-only">
                      Preview password
                    </label>
                    <input
                      id="preview-password"
                      type={visible ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      maxLength={128}
                      placeholder="Type any password to preview"
                      className="min-h-12 w-full rounded-full border border-hairline bg-surface px-5 pr-14 text-sm text-ink placeholder:text-ink-muted/70"
                    />
                    <button
                      type="button"
                      onClick={() => setVisible((value) => !value)}
                      aria-label={visible ? "Hide password" : "Show password"}
                      className="absolute right-1 top-1 flex size-10 items-center justify-center rounded-full text-ink-muted hover:bg-hover hover:text-ink"
                    >
                      {visible ? (
                        <EyeOff aria-hidden="true" className="size-4" />
                      ) : (
                        <Eye aria-hidden="true" className="size-4" />
                      )}
                    </button>
                  </div>
                ) : null}
                <Button type="submit" className="w-full" size="lg">
                  Open preview
                </Button>
              </form>
              <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
                The real page validates the saved password or quiz answer. This
                preview accepts anything so you can check the transition.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center justify-between gap-3 border-b border-hairline bg-surface px-4 py-2 text-[11px] text-ink-muted">
            <span>Unlocked view · music and 3D play as configured</span>
            <button
              type="button"
              onClick={() => setTab("lock")}
              className="font-medium text-ink underline underline-offset-4"
            >
              Back to lock
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto sm:max-h-[640px]">
            <RevealExperience
              className="min-h-[560px]"
              content={content}
            />
          </div>
        </div>
      )}
    </div>
  );
}
