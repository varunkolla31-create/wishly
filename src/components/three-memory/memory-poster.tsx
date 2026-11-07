"use client";

import { useEffect, useRef } from "react";
import {
  drawMemoryFrame,
  loadMemoryImages,
  reelFonts,
  type MemoryReelInput,
} from "@/src/components/three-memory/engine";
import { SAMPLE_PHOTOS } from "@/src/components/three-memory/catalog";

export function MemoryPoster({
  input,
  className,
}: {
  input: MemoryReelInput;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const key = `${input.templateId ?? ""}|${input.photos.join("|")}|${input.title}`;

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    const sources =
      input.photos.length > 0 ? input.photos : SAMPLE_PHOTOS.slice(0, 5);
    void loadMemoryImages(sources).then((images) => {
      if (cancelled) return;
      canvas.width = 360;
      canvas.height = 640;
      context.setTransform(0.3333, 0, 0, 0.3333, 0, 0);
      context.clearRect(0, 0, 1080, 1920);
      drawMemoryFrame(context, input, images, 0.32, {}, reelFonts());
    });

    return () => {
      cancelled = true;
    };
  }, [key, input]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block aspect-[9/16] w-full rounded-card bg-[#0B1418] object-cover ${className ?? ""}`}
    />
  );
}
