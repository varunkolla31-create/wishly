"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MemoryReelCatalog } from "@/components/marketing/memory-reel-catalog";
import { MemoryWorkbench } from "@/components/studio/memory-workbench";
import { cn } from "@/lib/utils/cn";

type Tab = "catalog" | "workbench";

const TABS: { id: Tab; label: string; hint: string }[] = [
  {
    id: "catalog",
    label: "Catalog",
    hint: "Browse every rig and atmosphere",
  },
  {
    id: "workbench",
    label: "Workbench",
    hint: "Your photos, live in one scene",
  },
];

export function ReelsTabs({ initialTab }: { initialTab: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function select(next: Tab) {
    setTab(next);
    // Keep the tab in the URL so a shared link opens the same view.
    const query = new URLSearchParams(params.toString());
    query.set("tab", next);
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="3D reels views"
        className="flex flex-wrap gap-2 border-b border-hairline pb-3"
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`reels-tab-${item.id}`}
              aria-selected={active}
              aria-controls={`reels-panel-${item.id}`}
              onClick={() => select(item.id)}
              className={cn(
                "inline-flex min-h-11 flex-col items-start justify-center rounded-full px-4 text-left transition-colors",
                active
                  ? "bg-ink text-canvas"
                  : "border border-hairline bg-surface text-ink hover:bg-hover",
              )}
            >
              <span className="text-sm font-medium">{item.label}</span>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-[0.1em]",
                  active ? "text-canvas/70" : "text-ink-muted",
                )}
              >
                {item.hint}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`reels-panel-${tab}`}
        aria-labelledby={`reels-tab-${tab}`}
        className="mt-8"
      >
        {tab === "catalog" ? <MemoryReelCatalog /> : <MemoryWorkbench />}
      </div>
    </div>
  );
}
