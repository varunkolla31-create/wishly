"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface WizardStep {
  id: string;
  label: string;
}

export function WizardStepper({
  steps,
  current,
  onSelect,
}: {
  steps: WizardStep[];
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="flex items-center gap-0.5 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const state =
          index === current
            ? "current"
            : index < current
              ? "complete"
              : "upcoming";

        return (
          <li key={step.id} className="flex shrink-0 items-center">
            {index > 0 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "mx-0.5 h-px w-3 sm:w-6",
                  index <= current ? "bg-ink" : "bg-hairline",
                )}
              />
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-current={index === current ? "step" : undefined}
              className="flex min-h-12 items-center gap-2 rounded-full px-1.5 py-2"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  state === "current" && "bg-coral-strong text-white",
                  state === "complete" && "bg-ink text-canvas",
                  state === "upcoming" &&
                    "border border-hairline text-ink-muted",
                )}
              >
                {state === "complete" ? (
                  <Check aria-hidden="true" className="size-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  state === "upcoming" ? "text-ink-muted" : "text-ink",
                )}
              >
                {step.label}
              </span>
              <span className="sr-only sm:hidden">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
