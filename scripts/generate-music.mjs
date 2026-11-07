import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 22050;
const SECONDS = 16;
const FADE_SECONDS = 1.5;

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputDir = path.join(projectRoot, "public", "music");

/**
 * Royalty-free ambient loops synthesized from sine partials, so the bundled
 * music library ships without any third-party audio licensing.
 */
const TRACKS = [
  {
    file: "warm-glow.wav",
    notes: [261.63, 329.63, 392.0, 523.25],
    gain: 0.13,
    tremolo: 0.18,
    brightness: 0.3,
  },
  {
    file: "night-sky.wav",
    notes: [220.0, 261.63, 329.63, 440.0],
    gain: 0.11,
    tremolo: 0.1,
    brightness: 0.18,
  },
  {
    file: "gentle-morning.wav",
    notes: [349.23, 440.0, 523.25, 698.46],
    gain: 0.11,
    tremolo: 0.22,
    brightness: 0.38,
  },
  {
    file: "soft-bells.wav",
    notes: [587.33, 739.99, 880.0, 1174.66],
    gain: 0.08,
    tremolo: 0.3,
    brightness: 0.55,
  },
  {
    file: "acoustic-glow.wav",
    notes: [196.0, 246.94, 293.66, 392.0],
    gain: 0.12,
    tremolo: 0.2,
    brightness: 0.35,
  },
  {
    file: "ambient-air.wav",
    notes: [174.61, 220.0, 261.63, 349.23],
    gain: 0.08,
    tremolo: 0.06,
    brightness: 0.25,
  },
  {
    file: "bright-pop.wav",
    notes: [293.66, 369.99, 440.0, 587.33],
    gain: 0.12,
    tremolo: 0.32,
    brightness: 0.6,
  },
  {
    file: "slow-guitar.wav",
    notes: [196.0, 220.0, 293.66, 329.63],
    gain: 0.11,
    tremolo: 0.16,
    brightness: 0.4,
  },
];

function quantizeFrequency(frequency, loopSeconds) {
  const step = 1 / loopSeconds;
  return Math.max(step, Math.round(frequency / step) * step);
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

function synthesize(track) {
  const frames = SAMPLE_RATE * SECONDS;
  const samples = new Float32Array(frames);
  const loopsPerCycle = 2;

  const partials = track.notes.flatMap((note) => {
    const fundamental = quantizeFrequency(note, SECONDS);
    const list = [
      { frequency: fundamental, amplitude: 1 },
      { frequency: quantizeFrequency(note * 2, SECONDS), amplitude: track.brightness * 0.3 },
      { frequency: quantizeFrequency(note * 3, SECONDS), amplitude: track.brightness * 0.12 },
    ];
    return list.map((partial) => ({
      frequency: partial.frequency,
      amplitude: (track.gain * partial.amplitude) / track.notes.length,
    }));
  });

  for (let index = 0; index < frames; index += 1) {
    const t = index / SAMPLE_RATE;
    const fade = smoothstep(
      Math.min(1, t / FADE_SECONDS, (SECONDS - t) / FADE_SECONDS),
    );
    const pulse = 0.5 - 0.5 * Math.cos((2 * Math.PI * loopsPerCycle * t) / SECONDS);

    let sample = 0;
    for (const partial of partials) {
      sample +=
        partial.amplitude * Math.sin(2 * Math.PI * partial.frequency * t);
    }

    const tremolo = 1 - track.tremolo + track.tremolo * pulse;
    samples[index] = sample * tremolo * fade;
  }

  return samples;
}

function encodeWav(samples) {
  const dataBytes = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);

  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataBytes, 40);

  let offset = 44;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.round(clamped * 32767), offset);
    offset += 2;
  }

  return buffer;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const ifMissing = process.argv.includes("--if-missing");
  await mkdir(outputDir, { recursive: true });

  for (const track of TRACKS) {
    const target = path.join(outputDir, track.file);
    if (ifMissing && (await exists(target))) continue;

    await writeFile(target, encodeWav(synthesize(track)));
    console.log(`generated public/music/${track.file}`);
  }
}

await main();
