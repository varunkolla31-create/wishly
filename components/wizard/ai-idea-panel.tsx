"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { OccasionTone } from "@/lib/catalog/types";

export function AiIdeaPanel({
  category,
  tone,
  onPick,
}: {
  category: string;
  tone: OccasionTone;
  onPick: (idea: string) => void;
}) {
  const [relationship, setRelationship] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, relationship }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        data?: { ideas?: string[] };
        error?: { message?: string };
      };

      if (!response.ok || !payload.data?.ideas) {
        throw new Error(payload.error?.message ?? "Couldn't think of anything.");
      }

      setIdeas(payload.data.ideas);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Couldn't think of anything right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-card border border-hairline bg-surface p-5">
      <div className="flex items-center gap-2">
        <Sparkles aria-hidden="true" className="size-4 text-coral-strong" />
        <h3 className="text-sm font-medium text-ink">
          Need a starting point?
        </h3>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
        Tell us who it&apos;s for and we&apos;ll suggest a few openers.
        {tone === "calm" ? " Kept gentle for this occasion." : ""}
      </p>

      <label
        htmlFor="ai-relationship"
        className="mt-4 block text-xs font-medium text-ink-muted"
      >
        Who is this for?
      </label>
      <input
        id="ai-relationship"
        value={relationship}
        onChange={(event) => setRelationship(event.target.value)}
        placeholder="my sister, an old friend"
        maxLength={80}
        className="mt-1 min-h-12 w-full rounded-full border border-hairline bg-canvas px-4 text-sm text-ink placeholder:text-ink-muted/70"
      />

      <Button
        type="button"
        variant="outline"
        onClick={generate}
        disabled={loading}
        className="mt-3 w-full"
      >
        {loading ? "Thinking…" : "Give me an idea"}
      </Button>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-error">
          {error}
        </p>
      ) : null}

      {ideas.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {ideas.map((idea) => (
            <li key={idea}>
              <button
                type="button"
                onClick={() => onPick(idea)}
                className="w-full rounded-media border border-hairline bg-canvas px-3 py-2.5 text-left text-sm leading-relaxed text-ink transition-colors hover:bg-hover"
              >
                {idea}
                <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-coral-strong">
                  Add to message
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
