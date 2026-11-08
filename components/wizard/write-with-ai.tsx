"use client";

import { Check, RefreshCw, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

const TONES = [
  { id: "romantic", label: "💖 Romantic" },
  { id: "emotional", label: "🥹 Emotional" },
  { id: "funny", label: "😂 Funny" },
  { id: "poetic", label: "✨ Poetic" },
  { id: "warm", label: "🎉 Warm" },
] as const;

type Tone = (typeof TONES)[number]["id"];
type LengthAction = "shorter" | "longer";

interface GenerateResponse {
  ok: boolean;
  data?: { messages?: string[] };
  error?: { message?: string };
}

export function WriteWithAi({
  occasion,
  recipientName,
  onUse,
}: {
  occasion: string;
  recipientName: string;
  onUse: (message: string) => void;
}) {
  const onUseRef = useRef(onUse);
  const typingRef = useRef<number | null>(null);

  const [open, setOpen] = useState(false);
  const [promptHint, setPromptHint] = useState("");
  const [sender, setSender] = useState("");
  const [tone, setTone] = useState<Tone>("warm");
  const [messages, setMessages] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [used, setUsed] = useState(false);

  onUseRef.current = onUse;

  useEffect(
    () => () => {
      if (typingRef.current) window.clearInterval(typingRef.current);
    },
    [],
  );

  async function generate(action: "new" | LengthAction = "new") {
    if (loading) return;
    setLoading(true);
    setError(null);
    setUsed(false);

    try {
      const baseMessage = messages[selected];
      const response = await fetch("/api/generate-wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          recipientName: recipientName.trim(),
          senderName: sender.trim(),
          promptHint: promptHint.trim(),
          tone,
          ...(action !== "new" && baseMessage
            ? { length: action, baseMessage }
            : {}),
        }),
      });

      const body = (await response.json()) as GenerateResponse;
      if (!response.ok || !body.ok || !body.data?.messages?.length) {
        throw new Error(
          body.error?.message ?? "The writing assistant is busy. Try again.",
        );
      }

      setMessages(body.data.messages);
      setSelected(0);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "The writing assistant is busy. Try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function useSelected() {
    const text = messages[selected]?.trim();
    if (!text) return;

    if (typingRef.current) window.clearInterval(typingRef.current);
    const started = performance.now();
    const duration = Math.min(1800, Math.max(500, text.length * 12));

    onUseRef.current("");
    typingRef.current = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / duration);
      const count = Math.max(1, Math.round(text.length * progress));
      onUseRef.current(text.slice(0, count));

      if (progress >= 1) {
        if (typingRef.current) window.clearInterval(typingRef.current);
        typingRef.current = null;
        onUseRef.current(text);
        setUsed(true);
      }
    }, 24);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group inline-flex min-h-10 items-center gap-2 rounded-full bg-gradient-to-r from-coral to-[#A51444] px-4 text-xs font-semibold text-white shadow-[0_8px_28px_rgba(255,56,92,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(255,56,92,0.36)]"
      >
        <Sparkles aria-hidden="true" className="size-3.5" />
        Help me write (AI)
      </button>

      {open ? (
        <div className="mt-3 overflow-hidden rounded-card border border-coral/20 bg-gradient-to-br from-[#FFF9F2] via-surface to-sand p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-coral-strong">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Write with AI
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Tell it the details. It writes three options you can edit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI assistant"
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-hover hover:text-ink"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <label htmlFor="ai-prompt" className="sr-only">
            Tell AI about the wish
          </label>
          <textarea
            id="ai-prompt"
            value={promptHint}
            onChange={(event) => setPromptHint(event.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Tell AI who this is for or share a memory (e.g., 'To my love on our 2nd anniversary')..."
            className="mt-3 w-full rounded-media border border-hairline bg-canvas px-3 py-2.5 text-xs leading-relaxed text-ink placeholder:text-ink-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          />

          <input
            value={sender}
            onChange={(event) => setSender(event.target.value)}
            maxLength={80}
            aria-label="From who"
            placeholder="From who? (optional)"
            className="mt-2 min-h-10 w-full rounded-full border border-hairline bg-canvas px-3 text-xs text-ink placeholder:text-ink-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {TONES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTone(option.id)}
                aria-pressed={tone === option.id}
                className={cn(
                  "min-h-8 rounded-full border px-2.5 text-[11px] font-medium transition-colors",
                  tone === option.id
                    ? "border-coral bg-coral text-white"
                    : "border-hairline bg-canvas text-ink hover:bg-hover",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => generate("new")}
            disabled={loading}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-xs font-semibold text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles aria-hidden="true" className="size-3.5" />
            {loading ? "Writing…" : "Write it for me"}
          </button>

          {loading ? (
            <div className="mt-3">
              <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                <Sparkles
                  aria-hidden="true"
                  className="size-3.5 animate-pulse text-coral-strong"
                />
                Writing something special for {recipientName.trim() || "them"}…
              </p>
              <div className="mt-2 h-16 animate-pulse rounded-media bg-sand" />
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="mt-3 text-xs text-error">
              {error}
            </p>
          ) : null}

          {messages.length > 0 && !loading ? (
            <div className="mt-3 rounded-media border border-hairline bg-canvas/80 p-3">
              <p className="whitespace-pre-line font-serif text-sm italic leading-relaxed text-ink">
                {messages[selected]}
              </p>

              {messages.length > 1 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {messages.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelected(index);
                        setUsed(false);
                      }}
                      aria-pressed={selected === index}
                      className={cn(
                        "min-h-7 rounded-full border px-2.5 text-[10px] font-semibold transition-colors",
                        selected === index
                          ? "border-ink bg-ink text-canvas"
                          : "border-hairline bg-surface text-ink-muted hover:bg-hover",
                      )}
                    >
                      Option {index + 1}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={useSelected}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-coral px-3 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Check aria-hidden="true" className="size-3.5" />
                  Use this message
                </button>
                <button
                  type="button"
                  onClick={() => generate("new")}
                  disabled={loading}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-hairline bg-canvas px-3 text-[11px] font-medium text-ink transition-colors hover:bg-hover disabled:opacity-50"
                >
                  <RefreshCw aria-hidden="true" className="size-3.5" />
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={() => generate("shorter")}
                  disabled={loading}
                  className="min-h-9 rounded-full border border-hairline bg-canvas px-3 text-[11px] font-medium text-ink transition-colors hover:bg-hover disabled:opacity-50"
                >
                  Make it shorter
                </button>
                <button
                  type="button"
                  onClick={() => generate("longer")}
                  disabled={loading}
                  className="min-h-9 rounded-full border border-hairline bg-canvas px-3 text-[11px] font-medium text-ink transition-colors hover:bg-hover disabled:opacity-50"
                >
                  Make it longer
                </button>
              </div>

              {used ? (
                <p role="status" className="mt-2 text-[11px] text-ink-muted">
                  Added to your message. You can edit it above.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
