import { beforeEach, describe, expect, it } from "vitest";
import {
  acquireCanvasSlot,
  liveCanvasCount,
  releaseCanvasSlot,
  resetCanvasBudget,
} from "@/src/components/three-memory/canvas-budget";

describe("live canvas budget", () => {
  beforeEach(() => {
    resetCanvasBudget();
  });

  it("allows two live canvases at once", () => {
    const first = acquireCanvasSlot();
    const second = acquireCanvasSlot();

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(liveCanvasCount()).toBe(2);
    // Each holder gets a distinct token so releases cannot cross over.
    expect(first).not.toBe(second);
  });

  it("refuses a third canvas while two are running", () => {
    acquireCanvasSlot();
    acquireCanvasSlot();

    expect(acquireCanvasSlot()).toBeNull();
    expect(liveCanvasCount()).toBe(2);
  });

  it("frees the slot when a canvas unmounts", () => {
    const first = acquireCanvasSlot();
    const second = acquireCanvasSlot();
    if (!first || !second) throw new Error("Expected two slots.");

    releaseCanvasSlot(first);
    expect(liveCanvasCount()).toBe(1);

    const third = acquireCanvasSlot();
    expect(third).not.toBeNull();
    expect(liveCanvasCount()).toBe(2);
  });

  it("ignores a duplicate release", () => {
    const token = acquireCanvasSlot();
    if (!token) throw new Error("Expected a slot.");

    releaseCanvasSlot(token);
    releaseCanvasSlot(token);
    releaseCanvasSlot(token);

    expect(liveCanvasCount()).toBe(0);
  });

  it("never goes negative", () => {
    releaseCanvasSlot(Symbol("never-acquired"));
    expect(liveCanvasCount()).toBe(0);
  });
});
