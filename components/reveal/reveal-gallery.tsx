"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { VoiceNote } from "@/components/reveal/voice-note";
import type { TemplateDefinition } from "@/lib/catalog/types";
import type { MediaItem } from "@/lib/media/types";
import { duckMusic } from "@/lib/media/duck";
import { cn } from "@/lib/utils/cn";

function PhotoImage({ item, index }: { item: MediaItem; index: number }) {
  return (
    <Image
      src={item.url}
      alt={`Photo ${index + 1}`}
      width={900}
      height={1100}
      unoptimized
      className="h-full w-full object-cover"
    />
  );
}

function ParallaxPhoto({
  item,
  index,
  className,
}: {
  item: MediaItem;
  index: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const direction = index % 2 === 0 ? 1 : -1;
  const y = useTransform(scrollYProgress, [0, 1], [22 * direction, -22 * direction]);

  return (
    <motion.div
      ref={ref}
      style={{ y: reduce ? 0 : y }}
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("overflow-hidden rounded-media bg-black/10", className)}
    >
      <PhotoImage item={item} index={index} />
    </motion.div>
  );
}

function PolaroidPhoto({
  item,
  index,
}: {
  item: MediaItem;
  index: number;
}) {
  const reduce = useReducedMotion();
  const tilt = index % 2 === 0 ? -2 : 2;

  return (
    <motion.figure
      initial={reduce ? false : { opacity: 0, rotate: tilt, y: 26 }}
      whileInView={{ opacity: 1, rotate: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
      className="bg-white p-3 pb-12 shadow-soft"
    >
      <div className="aspect-[4/5] overflow-hidden bg-black/5">
        <PhotoImage item={item} index={index} />
      </div>
      <figcaption className="mt-3 text-center font-serif text-sm italic text-[#3B2A2F]">
        remember this
      </figcaption>
    </motion.figure>
  );
}

function MidnightPhoto({ item, index }: { item: MediaItem; index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-media bg-[#181818] p-2 shadow-[0_0_48px_rgba(214,194,131,0.25)]"
    >
      <div className="aspect-[4/5] overflow-hidden rounded-[12px]">
        <PhotoImage item={item} index={index} />
      </div>
    </motion.div>
  );
}

function TimelineGallery({
  photos,
}: {
  photos: MediaItem[];
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 55%"],
  });
  const beam = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="relative mt-10 pl-10">
      <span
        aria-hidden="true"
        className="absolute left-3 top-0 h-full w-0.5 bg-[#D6C283]/20"
      />
      <motion.span
        aria-hidden="true"
        className="absolute left-3 top-0 w-0.5 origin-top bg-[#D6C283]"
        style={{ height: reduce ? "100%" : beam }}
      />
      {photos.map((photo, index) => (
        <motion.div
          key={photo.key}
          initial={reduce ? false : { opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-6 last:mb-0"
        >
          <span
            aria-hidden="true"
            className="absolute -left-[31px] top-5 size-3 rounded-full border-2 border-[#FFF7E8] bg-[#D6C283]"
          />
          <div className="overflow-hidden rounded-media">
            <PhotoImage item={photo} index={index} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function DefaultGallery({
  photos,
  layout,
}: {
  photos: MediaItem[];
  layout: TemplateDefinition["photoLayout"];
}) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn(
        "mt-10 grid gap-3",
        layout === "stack" ? "grid-cols-1" : "grid-cols-2",
      )}
    >
      {photos.map((photo, index) => (
        <motion.div
          key={photo.key}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "overflow-hidden rounded-media",
            layout !== "stack" && "aspect-[4/5]",
            layout === "collage" && index === 0 && "col-span-2",
          )}
        >
          <Image
            src={photo.url}
            alt={`Photo ${index + 1}`}
            width={900}
            height={1100}
            unoptimized
            className={cn("w-full", layout === "stack" ? "h-auto" : "h-full object-cover")}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function RevealGallery({
  media,
  template,
}: {
  media: MediaItem[];
  template: TemplateDefinition;
}) {
  const reduce = useReducedMotion();
  const photos = media.filter((item) => item.kind === "photo");
  const videos = media.filter((item) => item.kind === "video");
  const voices = media.filter((item) => item.kind === "voice");

  if (media.length === 0) return null;

  return (
    <div className="space-y-6">
      {photos.length > 0 && template.id === "clean-white" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <ParallaxPhoto
              key={photo.key}
              item={photo}
              index={index}
              className={index % 2 === 1 ? "sm:translate-y-10" : undefined}
            />
          ))}
        </div>
      ) : null}

      {photos.length > 0 && template.id === "soft-pastel" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <PolaroidPhoto key={photo.key} item={photo} index={index} />
          ))}
        </div>
      ) : null}

      {photos.length > 0 && template.id === "midnight-glow" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <MidnightPhoto key={photo.key} item={photo} index={index} />
          ))}
        </div>
      ) : null}

      {photos.length > 0 && template.id === "golden-hour" ? (
        <TimelineGallery photos={photos} />
      ) : null}

      {photos.length > 0 &&
      !["clean-white", "soft-pastel", "midnight-glow", "golden-hour"].includes(
        template.id,
      ) ? (
        <DefaultGallery photos={photos} layout={template.photoLayout} />
      ) : null}

      {videos.map((video) => (
        <motion.video
          key={video.key}
          src={video.url}
          controls
          playsInline
          preload="metadata"
          onPlay={duckMusic}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="w-full rounded-media border border-black/10"
        />
      ))}

      {voices.map((voice) => (
        <VoiceNote
          key={voice.key}
          src={voice.url}
          accent={template.palette.accent}
          textColor={template.palette.text}
          mutedColor={template.palette.muted}
        />
      ))}
    </div>
  );
}
