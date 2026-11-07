"use client";

import { Check, ImagePlus, Mic, Video } from "lucide-react";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadMediaTo } from "@/lib/media/contributor-client";
import type { MediaKind } from "@/lib/media/validate";
import { cn } from "@/lib/utils/cn";

type Kind = MediaKind | "text";

const KINDS: { id: Kind; label: string; icon: typeof ImagePlus }[] = [
  { id: "photo", label: "A photo", icon: ImagePlus },
  { id: "video", label: "A short video", icon: Video },
  { id: "voice", label: "A voice note", icon: Mic },
  { id: "text", label: "A few words", icon: Check },
];

const accept: Record<MediaKind, string> = {
  photo: "image/jpeg,image/png,image/webp,image/avif",
  video: "video/mp4,video/webm,video/quicktime",
  voice: "audio/webm,audio/ogg,audio/mpeg,audio/mp4,audio/wav",
};

export function ContributorForm({
  token,
  receiverName,
  occasionName,
}: {
  token: string;
  receiverName: string;
  occasionName: string;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Kind>("photo");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const who = receiverName || "them";

  function chooseFile(next: File | null) {
    setFile(next);
    setPreviewUrl(next && kind === "photo" ? URL.createObjectURL(next) : null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || uploading) return;

    if (!name.trim()) {
      toast.error("Add your name first.");
      return;
    }
    if (kind === "text" && !text.trim()) {
      toast.error("Write a few words first.");
      return;
    }
    if (kind !== "text" && !file) {
      toast.error("Pick what you want to share.");
      return;
    }

    setSending(true);
    try {
      let mediaKey: string | undefined;

      if (kind !== "text" && file) {
        setUploading(true);
        mediaKey = await uploadMediaTo(token, kind, file);
        setUploading(false);
      }

      const response = await fetch(`/api/c/${token}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contributorName: name.trim(),
          type: kind,
          mediaKey,
          text: kind === "text" ? text.trim() : undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(payload?.error?.message ?? "That didn't send.");
      }

      setSent(true);
    } catch (caught) {
      setUploading(false);
      toast.error(
        caught instanceof Error ? caught.message : "That didn't send.",
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-card border border-hairline bg-surface p-8 text-center shadow-soft">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-sand">
          <Check aria-hidden="true" className="size-5 text-success" />
        </span>
        <h2 className="mt-4 font-serif text-3xl italic text-ink">Thank you.</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
          Your memory is with the person making this. They&apos;ll approve it
          before {who} sees anything.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => {
            setSent(false);
            setText("");
            setFile(null);
            setPreviewUrl(null);
          }}
        >
          Add another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-card border border-hairline bg-surface p-6 shadow-soft sm:p-8"
    >
      <h1 className="font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
        Add to {who}&apos;s {occasionName.toLowerCase()} page.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        No account needed. Add a photo, a short video, a voice note, or a few
        words.
      </p>

      <div className="mt-7 space-y-6">
        <div>
          <label
            htmlFor="contributor-name"
            className="text-xs font-medium text-ink-muted"
          >
            Your name
          </label>
          <input
            id="contributor-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            autoComplete="name"
            className="mt-1 min-h-12 w-full rounded-full border border-hairline bg-canvas px-5 text-base text-ink"
          />
        </div>

        <fieldset>
          <legend className="text-xs font-medium text-ink-muted">
            What are you sharing?
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {KINDS.map((option) => {
              const Icon = option.icon;
              const active = kind === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setKind(option.id);
                    chooseFile(null);
                  }}
                  className={cn(
                    "inline-flex min-h-12 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors",
                    active
                      ? "border-ink bg-ink text-canvas"
                      : "border-hairline bg-canvas text-ink hover:bg-hover",
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {kind === "text" ? (
          <div>
            <label
              htmlFor="contributor-text"
              className="text-xs font-medium text-ink-muted"
            >
              Your words
            </label>
            <textarea
              id="contributor-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              maxLength={500}
              className="mt-1 w-full rounded-media border border-hairline bg-canvas p-4 text-base leading-relaxed text-ink"
            />
            <p className="mt-1 text-xs text-ink-muted">
              {500 - text.length} characters left
            </p>
          </div>
        ) : (
          <div>
            <label className="text-xs font-medium text-ink-muted">
              {kind === "photo"
                ? "Your photo"
                : kind === "video"
                  ? "Your video"
                  : "Your recording"}
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-hairline bg-canvas px-5 text-sm font-medium text-ink transition-colors hover:bg-hover">
                Choose a file
                <input
                  type="file"
                  accept={accept[kind]}
                  onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
              {file ? (
                <span className="text-xs text-ink-muted">{file.name}</span>
              ) : null}
            </div>
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Your photo preview"
                width={320}
                height={320}
                unoptimized
                className="mt-3 size-40 rounded-media border border-hairline object-cover"
              />
            ) : null}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={sending || uploading}
        >
          {uploading ? "Uploading…" : sending ? "Sending…" : "Send it"}
        </Button>
        <p className="text-center text-xs text-ink-muted">
          The person who made this page reviews everything first.
        </p>
      </div>
    </form>
  );
}
