"use client";

import { Check, Copy, Printer, Share2, Video } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DownloadCardButton } from "@/components/keepsake/download-card-button";
import { Button, ButtonLink } from "@/components/ui/button";

const shareClass =
  "inline-flex min-h-12 items-center gap-2 rounded-full border border-hairline bg-canvas px-5 text-sm font-medium text-ink transition-colors hover:bg-hover";

export function PublishSuccess({
  wishId,
  title,
  password,
  occasionName,
  hint,
}: {
  wishId: string;
  title: string;
  password: string | null;
  occasionName?: string | null;
  hint?: string | null;
}) {
  const [origin, setOrigin] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState<"link" | "password" | null>(null);

  useEffect(() => {
    const base = window.location.origin;
    setOrigin(base);

    void import("qrcode")
      .then(({ toDataURL }) =>
        toDataURL(`${base}/w/${wishId}`, {
          margin: 1,
          width: 480,
          color: { dark: "#1C1B1A", light: "#FFFFFF" },
        }),
      )
      .then(setQr)
      .catch(() => setQr(null));
  }, [wishId]);

  const url = origin ? `${origin}/w/${wishId}` : "";
  const shareTitle = title || "A wish for you";

  async function copy(value: string, which: "link" | "password") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      toast.success("Copied");
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Couldn't copy that.");
    }
  }

  async function share() {
    const text = password
      ? `${shareTitle} — ${url}\nPassword: ${password}`
      : `${shareTitle} — ${url}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, text, url });
        return;
      } catch {
        return;
      }
    }

    await copy(url, "link");
  }

  const shareText = password
    ? `${shareTitle} — ${url}\nPassword: ${password}`
    : `${shareTitle} — ${url}`;

  return (
    <main className="mx-auto max-w-2xl px-1 py-2 sm:px-0">
      <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-ink">
          <Check aria-hidden="true" className="size-3.5 text-success" />
          Published
        </span>

        <h1 className="mt-4 font-serif text-4xl italic leading-tight text-ink">
          It&apos;s live.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Send the link and the password separately. That little bit of friction
          is the point.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="published-link"
              className="text-xs font-medium text-ink-muted"
            >
              Link
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="published-link"
                readOnly
                value={url}
                onFocus={(event) => event.currentTarget.select()}
                className="min-h-12 min-w-0 flex-1 rounded-full border border-hairline bg-canvas px-4 text-sm text-ink"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => copy(url, "link")}
                disabled={!url}
              >
                {copied === "link" ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <Copy aria-hidden="true" className="size-4" />
                )}
                Copy
              </Button>
            </div>
          </div>

          <div>
            <label
              htmlFor="published-password"
              className="text-xs font-medium text-ink-muted"
            >
              Password
            </label>
            {password ? (
              <>
                <div className="mt-1 flex gap-2">
                  <input
                    id="published-password"
                    readOnly
                    value={password}
                    onFocus={(event) => event.currentTarget.select()}
                    className="min-h-12 min-w-0 flex-1 rounded-full border border-hairline bg-canvas px-4 text-sm text-ink"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copy(password, "password")}
                  >
                    {copied === "password" ? (
                      <Check aria-hidden="true" className="size-4" />
                    ) : (
                      <Copy aria-hidden="true" className="size-4" />
                    )}
                    Copy
                  </Button>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Send this in a different message from the link.
                </p>
              </>
            ) : (
              <p className="mt-1 rounded-media bg-sand px-4 py-3 text-xs text-ink-muted">
                Your password is set. Share the one you chose — we can&apos;t
                read it back.
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className={shareClass}
          >
            WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareTitle)}`}
            target="_blank"
            rel="noreferrer"
            className={shareClass}
          >
            Telegram
          </a>
          <button type="button" onClick={share} className={shareClass}>
            <Share2 aria-hidden="true" className="size-4" />
            Share
          </button>
          <a
            href={`/dashboard/wishes/${wishId}/card`}
            className={shareClass}
          >
            <Printer aria-hidden="true" className="size-4" />
            Print card
          </a>
          <DownloadCardButton
            title={shareTitle}
            occasionName={occasionName}
            url={url}
            qrDataUrl={qr ?? ""}
            hint={hint}
            filename={`wishly-card-${wishId}.png`}
            label="Download card"
          />
          <a
            href="/studio"
            target="_blank"
            rel="noreferrer"
            className={shareClass}
          >
            <Video aria-hidden="true" className="size-4" />
            Make a 3D reel
          </a>
        </div>

        <div className="mt-8 flex items-center gap-4 rounded-media border border-hairline p-4">
          {qr ? (
            <Image
              src={qr}
              alt="QR code for the wish link"
              width={120}
              height={120}
              unoptimized
              className="rounded-media border border-hairline"
            />
          ) : (
            <div className="size-[120px] animate-pulse rounded-media bg-sand" />
          )}
          <div>
            <p className="text-sm font-medium text-ink">Scan to open</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Works from a printed card or another phone. The password is still
              required.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard">Back to dashboard</ButtonLink>
          <ButtonLink
            href={`/dashboard/wishes/${wishId}/edit`}
            variant="outline"
          >
            Keep editing
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
