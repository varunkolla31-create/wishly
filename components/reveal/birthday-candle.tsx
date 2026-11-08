"use client";

import { Mic, Wind } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function BirthdayCandle({ onBlown }: { onBlown: () => void }) {
  const [listening, setListening] = useState(false);
  const [out, setOut] = useState(false);
  const [message, setMessage] = useState("");
  const cleanupRef = useRef<(() => void) | null>(null);
  const doneRef = useRef(false);

  useEffect(
    () => () => {
      cleanupRef.current?.();
    },
    [],
  );

  function extinguish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setOut(true);
    setMessage("Candle out. Making a wish…");
    window.setTimeout(onBlown, 700);
  }

  async function listenForBlow() {
    if (listening || out) return;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage("Blowing isn't supported here — tap the flame instead.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) {
        stream.getTracks().forEach((track) => track.stop());
        setMessage("Blowing isn't supported here — tap the flame instead.");
        return;
      }

      const context = new AudioContextClass();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      const samples = new Float32Array(analyser.fftSize);
      let frame = 0;
      let stopped = false;

      const stop = () => {
        stopped = true;
        window.cancelAnimationFrame(frame);
        stream.getTracks().forEach((track) => track.stop());
        void context.close().catch(() => undefined);
        cleanupRef.current = null;
      };
      cleanupRef.current = stop;

      const tick = () => {
        if (stopped) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let index = 0; index < data.length; index += 1) {
          const value = ((data[index] ?? 128) - 128) / 128;
          sum += value * value;
        }
        samples[0] = Math.sqrt(sum / data.length);
        if ((samples[0] ?? 0) > 0.11) {
          stop();
          window.setTimeout(extinguish, 160);
          return;
        }
        frame = window.requestAnimationFrame(tick);
      };

      setListening(true);
      setMessage("Listening… blow gently toward the mic.");
      tick();
    } catch {
      setListening(false);
      setMessage("Microphone access was blocked. Tap the flame instead.");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={extinguish}
        aria-label="Blow out the birthday candle"
        className="group relative mx-auto flex h-64 w-40 items-end justify-center focus-visible:outline-none"
      >
        <span
          aria-hidden="true"
          className={`absolute left-1/2 top-10 size-16 -translate-x-1/2 rounded-full transition-all duration-700 ${
            out
              ? "scale-50 opacity-0"
              : "animate-pulse opacity-100 group-hover:scale-110"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(255,246,196,0.98) 0%, rgba(255,180,80,0.55) 42%, rgba(255,140,40,0) 72%)",
            filter: "drop-shadow(0 0 26px rgba(255,180,80,0.7))",
          }}
        />
        {out ? (
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-16 h-16 w-1 -translate-x-1/2 rounded-full bg-white/20 blur-sm"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[92px] h-5 w-3 -translate-x-1/2 rounded-full bg-[#2A2114]"
          />
        )}
        <span className="relative mb-2 h-40 w-14 rounded-t-2xl rounded-b-md bg-gradient-to-b from-[#FFF9EC] to-[#E7D6B8] shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <span className="absolute inset-y-0 left-2 w-2 rounded-full bg-white/50" />
        </span>
        <span className="absolute bottom-0 h-3 w-36 rounded-full bg-black/20 blur-sm" />
      </button>

      <p
        role="status"
        aria-live="polite"
        className="mt-4 text-center text-sm text-ink-muted"
      >
        {message || "Tap the flame, or let them blow it out."}
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={listenForBlow}
          disabled={listening || out}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-hairline bg-surface px-4 text-xs font-medium text-ink transition-colors hover:bg-hover disabled:opacity-50"
        >
          <Mic aria-hidden="true" className="size-3.5" />
          {listening ? "Listening…" : "Use my microphone"}
        </button>
        <button
          type="button"
          onClick={extinguish}
          disabled={out}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-hairline bg-surface px-4 text-xs font-medium text-ink transition-colors hover:bg-hover disabled:opacity-50"
        >
          <Wind aria-hidden="true" className="size-3.5" />
          Blow it out
        </button>
      </div>
    </div>
  );
}
