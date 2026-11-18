"use client";

/**
 * Caps how many live canvases animate at once.
 *
 * A catalog with a live preview per card is a frame-rate trap on a phone: each
 * canvas runs a full repaint on every animation frame. Live previews are only
 * mounted in modals today, but a modal can be opened from a grid and a wizard
 * step can hold one too, so the cap is enforced centrally rather than left to
 * each caller.
 */

const MAX_LIVE_CANVASES = 2;

const active = new Set<symbol>();

export function acquireCanvasSlot(): symbol | null {
  if (active.size >= MAX_LIVE_CANVASES) return null;
  const token = Symbol("canvas");
  active.add(token);
  return token;
}

export function releaseCanvasSlot(token: symbol): void {
  active.delete(token);
}

export function liveCanvasCount(): number {
  return active.size;
}

/** Test seam. */
export function resetCanvasBudget(): void {
  active.clear();
}
