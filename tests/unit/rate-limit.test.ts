import { beforeEach, describe, expect, it } from "vitest";
import {
  advance,
  cooldownFor,
  decide,
  MAX_ATTEMPTS,
  MemoryAttemptStore,
  WINDOW_MS,
} from "@/lib/security/attempt-store";
import { resetAttemptStore } from "@/lib/security/attempt-store-pg";
import {
  attemptKeys,
  gateUnlock,
  recordUnlockFailure,
  clearUnlockFailures,
  isDemoWish,
} from "@/lib/security/unlock-guard";

const start = 1_700_000_000_000;

describe("attempt ledger", () => {
  beforeEach(() => {
    resetAttemptStore();
  });

  it("allows attempts below the threshold", () => {
    let record = null;
    for (let attempt = 0; attempt < MAX_ATTEMPTS - 1; attempt += 1) {
      record = advance(record, start + attempt);
      expect(decide(record, start + attempt).allowed).toBe(true);
    }
  });

  it("locks after the threshold with a positive cooldown", () => {
    let record = null;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      record = advance(record, start);
    }

    const decision = decide(record, start + 1_000);
    expect(decision.allowed).toBe(false);
    expect(decision.retryAfterMs).toBeGreaterThan(0);
  });

  it("opens again after the cooldown", () => {
    let record = null;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      record = advance(record, start);
    }

    expect(decide(record, start + cooldownFor(1) + 1).allowed).toBe(true);
  });

  it("escalates the cooldown with each strike, up to the cap", () => {
    expect(cooldownFor(1)).toBe(60_000);
    expect(cooldownFor(2)).toBe(120_000);
    expect(cooldownFor(3)).toBe(240_000);
    expect(cooldownFor(10)).toBe(15 * 60_000);
  });

  it("resets the window after it elapses", () => {
    let record = advance(null, start);
    record = advance(record, start + 10);
    expect(record.failures).toBe(2);

    const later = advance(record, start + WINDOW_MS + 1);
    expect(later.failures).toBe(1);
  });

  it("keeps keys independent", async () => {
    const store = new MemoryAttemptStore();
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const next = advance(await store.read("a:1"), start);
      await store.write("a:1", next);
    }

    expect(decide(await store.read("b:2"), start).allowed).toBe(true);
  });
});

describe("unlock guard", () => {
  beforeEach(() => {
    resetAttemptStore();
  });

  it("builds a wish key and an IP key, hashing the address", () => {
    const keys = attemptKeys("wish_abc", "203.0.113.9");
    expect(keys).toHaveLength(2);
    expect(keys[0]).toMatch(/^wish_abc:/);
    expect(keys[1]).toMatch(/^ip-scope:/);
    // The raw address must never appear in a key.
    expect(keys.join(" ")).not.toContain("203.0.113.9");
  });

  it("recognises the permanent demos", () => {
    expect(isDemoWish("demo-midnight")).toBe(true);
    expect(isDemoWish("wish_123")).toBe(false);
  });

  it("locks the wish after five failures for the same IP", async () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      await recordUnlockFailure("wish_lock", "198.51.100.7", start);
    }

    const gate = await gateUnlock("wish_lock", "198.51.100.7", start + 1_000);
    expect(gate.allowed).toBe(false);
    expect(gate.retryAfterMs).toBeGreaterThan(0);
  });

  it("locks the IP across different wishes", async () => {
    // Five failures spread across five wishes must still trip the IP bucket.
    for (let index = 0; index < MAX_ATTEMPTS; index += 1) {
      await recordUnlockFailure(`wish_${index}`, "198.51.100.8", start);
    }

    const gate = await gateUnlock("wish_fresh", "198.51.100.8", start + 1_000);
    expect(gate.allowed).toBe(false);
  });

  it("does not penalise a different IP against a locked wish", async () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      await recordUnlockFailure("wish_same", "198.51.100.9", start);
    }

    const gate = await gateUnlock("wish_same", "203.0.113.44", start + 1_000);
    expect(gate.allowed).toBe(true);
  });

  it("never blocks a demo wish", async () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS * 2; attempt += 1) {
      await recordUnlockFailure("demo-amma", "198.51.100.10", start);
    }

    const gate = await gateUnlock("demo-amma", "198.51.100.10", start + 1_000);
    expect(gate.allowed).toBe(true);
  });

  it("clears both buckets after a correct password", async () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS - 1; attempt += 1) {
      await recordUnlockFailure("wish_clear", "198.51.100.11", start);
    }

    const keys = attemptKeys("wish_clear", "198.51.100.11");
    await clearUnlockFailures(keys);

    for (let attempt = 0; attempt < MAX_ATTEMPTS - 1; attempt += 1) {
      await recordUnlockFailure("wish_clear", "198.51.100.11", start);
    }

    const gate = await gateUnlock("wish_clear", "198.51.100.11", start + 10);
    expect(gate.allowed).toBe(true);
  });
});
