"use client";

import { estimatePasswordStrength } from "@/lib/security/password-strength";
import { MIN_PASSWORD_LENGTH } from "@/lib/security/password-policy";
import { cn } from "@/lib/utils/cn";

const SEGMENT_COLORS = [
  "bg-ink-muted",
  "bg-error",
  "bg-warning",
  "bg-success",
  "bg-success",
] as const;

export function StrengthMeter({ password }: { password: string }) {
  const strength = estimatePasswordStrength(password);
  const filled = password ? Math.max(1, strength.score) : 0;

  return (
    <div>
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              segment < filled
                ? SEGMENT_COLORS[strength.score]
                : "bg-hairline",
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-ink-muted" role="status">
        {password
          ? `${strength.label}${strength.hints[0] ? ` · ${strength.hints[0]}` : ""}`
          : `Use at least ${MIN_PASSWORD_LENGTH} characters.`}
      </p>
    </div>
  );
}
