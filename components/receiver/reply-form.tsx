"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import type { TemplatePalette } from "@/lib/catalog/types";

const REACTIONS = ["❤️", "🥳", "🥹", "🙏", "✨"] as const;

export function ReplyForm({
  wishId,
  palette,
}: {
  wishId: string;
  palette: TemplatePalette;
}) {
  const storageKey = `wishly_reply_sent_${wishId}`;
  const [emoji, setEmoji] = useState<string>("❤️");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(storageKey) === "1") setSent(true);
    } catch {
      // Session storage is a convenience.
    }
  }, [storageKey]);

  async function send() {
    if (sending) return;
    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/w/${wishId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim() || "Thank you!",
          emoji,
        }),
      });

      if (!response.ok) throw new Error("reply_failed");
      try {
        window.sessionStorage.setItem(storageKey, "1");
      } catch {
        // Still show the confirmation for this view.
      }
      setSent(true);
    } catch {
      setError("That didn't send. Try once more.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <section
        aria-live="polite"
        className="relative mt-12 overflow-hidden rounded-card border p-6 text-center"
        style={{
          borderColor: palette.muted,
          backgroundColor: palette.surface,
          color: palette.text,
        }}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.span
              key={index}
              className="absolute text-2xl"
              style={{ left: `${10 + index * 15}%`, bottom: 0 }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -150 - (index % 3) * 26, opacity: [0, 1, 0] }}
              transition={{
                duration: 2.2,
                delay: index * 0.18,
                repeat: Infinity,
                repeatDelay: 1.6,
                ease: "easeOut",
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>

        <div className="relative">
          <span
            className="mx-auto flex size-14 items-center justify-center rounded-full"
            style={{ backgroundColor: palette.accent, color: palette.background }}
          >
            <Check aria-hidden="true" className="size-7" />
          </span>
          <p aria-hidden="true" className="mt-3 text-3xl">
            {emoji}
          </p>
          <h2 className="mt-2 font-serif text-2xl italic">Sent with love!</h2>
          <p className="mt-1 text-sm" style={{ color: palette.muted }}>
            They&apos;ll see it in their replies inbox.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mt-12 rounded-card border p-5"
      style={{
        borderColor: palette.muted,
        backgroundColor: palette.surface,
        color: palette.text,
      }}
    >
      <h2 className="font-serif text-2xl italic">Say Thanks</h2>
      <p className="mt-1 text-sm" style={{ color: palette.muted }}>
        Send a quick reaction, a note, or both. No account needed.
      </p>

      <div
        role="group"
        aria-label="Pick a reaction"
        className="mt-4 flex flex-wrap gap-2"
      >
        {REACTIONS.map((reaction) => (
          <button
            key={reaction}
            type="button"
            onClick={() => setEmoji(reaction)}
            aria-pressed={emoji === reaction}
            aria-label={`React with ${reaction}`}
            className="flex size-12 items-center justify-center rounded-full text-2xl transition-transform hover:scale-105"
            style={{
              border: `1px solid ${palette.muted}`,
              backgroundColor:
                emoji === reaction ? palette.accent : "transparent",
            }}
          >
            <span aria-hidden="true">{reaction}</span>
          </button>
        ))}
      </div>

      <label htmlFor="reply-message" className="sr-only">
        Your thank-you note
      </label>
      <textarea
        id="reply-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Send a note back to the sender…"
        className="mt-4 w-full rounded-media border p-3 text-sm leading-relaxed"
        style={{
          borderColor: palette.muted,
          backgroundColor: palette.background,
          color: palette.text,
        }}
      />

      {error ? (
        <p role="alert" className="mt-2 text-sm" style={{ color: "#F3727F" }}>
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={send}
        disabled={sending}
        className="mt-3 min-h-12 rounded-full px-6 text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ backgroundColor: palette.accent, color: palette.background }}
      >
        {sending ? "Sending…" : "Send Thanks"}
      </button>
      <p className="mt-2 text-[11px]" style={{ color: palette.muted }}>
        One thank-you per visit. The reaction alone is enough.
      </p>
    </section>
  );
}
