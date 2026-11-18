import { afterEach, describe, expect, it, vi } from "vitest";
import { reelCapability } from "@/src/components/three-memory/engine";

/**
 * Container negotiation decides whether an exported reel plays in WhatsApp and
 * Instagram. MP4 is the only format that works everywhere, so the order of
 * preference and the `degraded` flag matter.
 */

const original = globalThis.MediaRecorder;

function stubMediaRecorder(supported: string[]) {
  class FakeRecorder {
    static isTypeSupported(type: string) {
      return supported.some((candidate) => type === candidate);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).MediaRecorder = FakeRecorder;
}

afterEach(() => {
  if (original) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).MediaRecorder = original;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).MediaRecorder;
  }
  vi.restoreAllMocks();
});

describe("reel container negotiation", () => {
  it("prefers MP4 when the browser supports it", () => {
    stubMediaRecorder(["video/mp4;codecs=avc1.42E01E"]);
    const capability = reelCapability();

    expect(capability?.container).toBe("mp4");
    expect(capability?.degraded).toBe(false);
    expect(capability?.mime).toContain("mp4");
  });

  it("accepts a plain MP4 container when codec-specific is unsupported", () => {
    stubMediaRecorder(["video/mp4"]);
    const capability = reelCapability();

    expect(capability?.container).toBe("mp4");
    expect(capability?.degraded).toBe(false);
  });

  it("falls back to WebM and marks the export degraded", () => {
    stubMediaRecorder(["video/webm;codecs=vp9", "video/webm"]);
    const capability = reelCapability();

    expect(capability?.container).toBe("webm");
    expect(capability?.degraded).toBe(true);
  });

  it("orders VP9 ahead of VP8", () => {
    stubMediaRecorder(["video/webm;codecs=vp9", "video/webm;codecs=vp8"]);
    expect(reelCapability()?.mime).toBe("video/webm;codecs=vp9");
  });

  it("returns null when nothing is supported", () => {
    stubMediaRecorder([]);
    expect(reelCapability()).toBeNull();
  });

  it("returns null when MediaRecorder does not exist at all", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).MediaRecorder;
    expect(reelCapability()).toBeNull();
  });

  it("survives isTypeSupported throwing", () => {
    class ThrowingRecorder {
      static isTypeSupported() {
        throw new Error("nope");
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).MediaRecorder = ThrowingRecorder;
    expect(reelCapability()).toBeNull();
  });
});
