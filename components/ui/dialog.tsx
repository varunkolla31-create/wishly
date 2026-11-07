"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-card border border-hairline bg-surface p-6 text-ink shadow-soft backdrop:bg-black/50"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-base font-medium text-ink">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="-mr-2 -mt-2 flex size-12 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-hover hover:text-ink"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </dialog>
  );
}
