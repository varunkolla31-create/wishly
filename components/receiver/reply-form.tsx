"use client";

import { useState } from "react";
import type { TemplatePalette } from "@/lib/catalog/types";

const REACTIONS = ["❤️", "🥹", "💛", "🎉", "🙏", "😊"] as const;

export function ReplyForm({
  wishId,
  palette,
}: {
  wishId: string;
  palette: TemplatePalette;
}) {
  const [emoji, setEmoji] = useState<string>("💛");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!message.trim() || sending) return;
    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/w/${wishId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), emoji }),
      });

      if (!response.ok) throw new Error("reply_failed");
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
        className="mt-12 rounded-card border p-6 text-center"
        style={{
          borderColor: palette.muted,
          backgroundColor: palette.surface,
          color: palette.text,
        }}
      >
        <p aria-hidden="true" className="text-3xl">
          {emoji}
        </p>
        <h2 className="mt-2 font-serif text-2xl italic">Sent.</h2>
        <p className="mt-1 text-sm" style={{ color: palette.muted }}>
          They&apos;ll see it in their replies inbox.
        </p>
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
      <h2 className="font-serif text-2xl italic">Send something back</h2>
      <p className="mt-1 text-sm" style={{ color: palette.muted }}>
        A thank-you, a reaction, anything. It goes to the person who made this.
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
            className="flex size-11 items-center justify-center rounded-full text-xl transition-transform hover:scale-105"
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
        Your reply
      </label>
      <textarea
        id="reply-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Say something kind…"
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
        disabled={!message.trim() || sending}
        className="mt-3 min-h-12 rounded-full px-6 text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ backgroundColor: palette.accent, color: palette.background }}
      >
        {sending ? "Sending…" : "Send reply"}
      </button>
    </section>
  );
}
