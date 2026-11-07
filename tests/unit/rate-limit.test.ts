import { beforeEach, describe, expect, it } from "vitest";
import {
  checkRateLimit,
  clearRateLimit,
  MAX_ATTEMPTS,
  recordFailure,
  resetRateLimiter,
} from "@/lib/security/rate-limit";

describe("unlock rate limiting", () => {
  const key = "203.0.113.5:wish_abc123";
  const start = 1_700_000_000_000;

  beforeEach(() => {
    resetRateLimiter();
  });

  it("allows attempts below the threshold", () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS - 1; attempt += 1) {
      const decision = recordFailure(key, start + attempt);
      expect(decision.allowed).toBe(true);
    }
  });

  it("locks after the threshold and reports a cooldown", () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      recordFailure(key, start);
    }

    const locked = checkRateLimit(key, start + 1_000);
    expect(locked.allowed).toBe(false);
    expect(locked.retryAfterMs).toBeGreaterThan(0);
  });

  it("opens again after the cooldown", () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      recordFailure(key, start);
    }

    expect(checkRateLimit(key, start + 60_001).allowed).toBe(true);
  });

  it("keeps keys independent and clears on success", () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      recordFailure(key, start);
    }

    expect(checkRateLimit("other-key", start).allowed).toBe(true);

    clearRateLimit(key);
    expect(checkRateLimit(key, start).allowed).toBe(true);
  });
});
