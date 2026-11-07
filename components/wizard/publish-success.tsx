"use client";

import { Check, Copy, Printer, Share2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/button";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[character] ?? character;
  });
}

const shareClass =
  "inline-flex min-h-12 items-center gap-2 rounded-full border border-hairline bg-canvas px-5 text-sm font-medium text-ink transition-colors hover:bg-hover";

export function PublishSuccess({
  wishId,
  title,
  password,
}: {
  wishId: string;
  title: string;
  password: string | null;
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

  function printCard() {
    if (!qr) {
      toast.error("The QR code isn't ready yet.");
      return;
    }

    const win = window.open("", "_blank", "width=760,height=980");
    if (!win) {
      toast.error("Allow pop-ups to print the card.");
      return;
    }

    const safeTitle = escapeHtml(shareTitle);
    const safeUrl = escapeHtml(url);
    const passwordRow = password
      ? `<p class="password"><span>Password</span><strong>${escapeHtml(password)}</strong></p>`
      : `<p class="password"><span>Password</span><strong>the one you set</strong></p>`;

    win.document.write(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${safeTitle} · Wishly</title>
<style>
  @page { size: A5 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, Arial, sans-serif; color: #1C1B1A; display: flex; justify-content: center; }
  .card { width: 120mm; border: 1px solid #EBE5DA; border-radius: 24px; padding: 16mm 12mm; text-align: center; }
  .mark { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #6B6762; }
  .dot { width: 8px; height: 8px; border-radius: 999px; background: #FF385C; }
  h1 { font-family: Georgia, serif; font-style: italic; font-size: 30px; line-height: 1.1; margin: 18px 0 6px; }
  p { margin: 0; color: #6B6762; font-size: 13px; line-height: 1.5; }
  img { width: 62mm; height: 62mm; margin: 18px auto 10px; display: block; border: 1px solid #EBE5DA; border-radius: 12px; }
  .url { font-size: 11px; word-break: break-all; }
  .password { margin-top: 14px; padding: 10px 14px; border-radius: 999px; background: #F7F1E8; }
  .password span { display: block; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; }
  .password strong { display: block; margin-top: 2px; color: #1C1B1A; font-size: 15px; }
</style>
</head>
<body>
  <div class="card">
    <span class="mark"><span class="dot"></span>Wishly</span>
    <h1>${safeTitle}</h1>
    <p>Scan to open your wish.</p>
    <img src="${qr}" alt="QR code" />
    <p class="url">${safeUrl}</p>
    ${passwordRow}
    <p style="margin-top:14px;">Open the link, then enter the password.</p>
  </div>
</body>
</html>`);
    win.document.close();
    win.focus();
    win.setTimeout(() => win.print(), 250);
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
          <button type="button" onClick={printCard} className={shareClass}>
            <Printer aria-hidden="true" className="size-4" />
            Print card
          </button>
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
