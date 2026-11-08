"use client";

import { motion } from "framer-motion";

export function Equalizer({
  playing,
  color = "#1DB954",
  className,
}: {
  playing: boolean;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`flex h-4 items-end gap-0.5 ${className ?? ""}`}
      aria-hidden="true"
    >
      {[6, 12, 8, 14].map((height, index) => (
        <motion.span
          key={index}
          className="w-1 rounded-full"
          style={{ height, backgroundColor: color, transformOrigin: "bottom" }}
          animate={playing ? { scaleY: [0.35, 1, 0.55] } : { scaleY: 0.3 }}
          transition={
            playing
              ? {
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: index * 0.08,
                  ease: "easeInOut",
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
}
