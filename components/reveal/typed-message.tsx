"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function TypedMessage({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setIndex(text.length);
      return;
    }

    setIndex(0);
    if (!text) return;

    const timer = window.setInterval(() => {
      setIndex((current) => {
        if (current >= text.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 2;
      });
    }, 24);

    return () => window.clearInterval(timer);
  }, [text, reduceMotion]);

  const visible = text.slice(0, index);
  const complete = index >= text.length;

  return (
    <div className={className}>
      <p
        aria-hidden="true"
        className="whitespace-pre-line text-lg leading-relaxed"
      >
        {visible}
        {complete ? null : (
          <span className="ml-0.5 inline-block h-5 w-px animate-pulse bg-current align-middle" />
        )}
      </p>
      <p className="sr-only">{text}</p>
      {complete ? null : (
        <button
          type="button"
          onClick={() => setIndex(text.length)}
          className="mt-4 text-xs underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100"
        >
          Show the whole message
        </button>
      )}
    </div>
  );
}
