"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CopyWishLink({
  wishId,
  className,
}: {
  wishId: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/w/${wishId}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const area = document.createElement("textarea");
        area.value = url;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }

      setCopied(true);
      toast.success("Wish link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy wish link"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20 ${className ?? ""}`}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
      {copied ? "Link copied" : "Copy wish link"}
    </button>
  );
}
