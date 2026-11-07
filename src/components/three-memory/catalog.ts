export type MemoryTemplateId =
  | "3d-tunnel"
  | "3d-cylinder-ring"
  | "3d-polaroid-deck"
  | "3d-lantern-float"
  | "3d-editorial-museum"
  | "3d-calm-reflection";

export interface MemoryTemplate {
  id: MemoryTemplateId;
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  accent: string;
  background: string;
  tone: "fun" | "calm";
  samplePhotos: string[];
}

export const SAMPLE_PHOTOS = [
  "/three-memory/sample-1.svg",
  "/three-memory/sample-2.svg",
  "/three-memory/sample-3.svg",
  "/three-memory/sample-4.svg",
  "/three-memory/sample-5.svg",
  "/three-memory/sample-6.svg",
];

const samples = (...indexes: number[]) => indexes.map((index) => SAMPLE_PHOTOS[index] ?? SAMPLE_PHOTOS[0] ?? "");

export const MEMORY_TEMPLATES: MemoryTemplate[] = [
  {
    id: "3d-tunnel",
    name: "3D Time Tunnel",
    tagline: "Fly forward through the years.",
    description:
      "Photos hang at staggered depths while gold and coral starlight streams past. The camera flies through the memories and lands on your headline.",
    categories: ["birthday", "friendship", "graduation", "new-year", "farewell-retirement", "thank-you"],
    accent: "#FF385C",
    background: "#0D0B12",
    tone: "fun",
    samplePhotos: samples(0, 1, 2, 3, 4),
  },
  {
    id: "3d-cylinder-ring",
    name: "3D Orbit Carousel",
    tagline: "The people you love, in orbit.",
    description:
      "A 360° ring of photographs circles a glowing champagne heart on a dark cinema floor, with soft reflections underneath.",
    categories: ["anniversary", "love-valentine", "wedding-engagement", "mothers-fathers-day"],
    accent: "#D6C283",
    background: "#121212",
    tone: "fun",
    samplePhotos: samples(5, 0, 3, 2, 1),
  },
  {
    id: "3d-polaroid-deck",
    name: "3D Polaroid Deck",
    tagline: "Thick frames, soft springs, confetti.",
    description:
      "Vintage Polaroids deal themselves into the air with springy tilts, handwritten captions and a warm burst of confetti.",
    categories: ["birthday", "baby-shower-newborn", "mothers-fathers-day", "christmas", "friendship"],
    accent: "#C96F86",
    background: "#FDF6F2",
    tone: "fun",
    samplePhotos: samples(2, 4, 0, 5, 3),
  },
  {
    id: "3d-lantern-float",
    name: "3D Golden Lanterns",
    tagline: "Warm light, drifting upward.",
    description:
      "Your photographs glow inside floating lantern frames while golden bokeh and festival shimmer rise through the frame.",
    categories: ["diwali", "pongal", "eid", "christmas", "holi", "new-year"],
    accent: "#D6C283",
    background: "#1A120B",
    tone: "fun",
    samplePhotos: samples(4, 5, 1, 2, 0),
  },
  {
    id: "3d-editorial-museum",
    name: "3D Memory Museum",
    tagline: "A quiet gallery of your people.",
    description:
      "A warm-sand corridor with arched museum frames and a moving specular glare as the camera pans from memory to memory.",
    categories: ["thank-you", "farewell-retirement", "graduation", "friendship", "wedding-engagement"],
    accent: "#1C1B1A",
    background: "#F7F1E8",
    tone: "fun",
    samplePhotos: samples(1, 3, 5, 0, 2),
  },
  {
    id: "3d-calm-reflection",
    name: "3D Serene Reflection",
    tagline: "Slow water, candlelight, no noise.",
    description:
      "Photographs float over a still dark mirror with a breathing gold glow and patient typography. Built for the quiet days.",
    categories: ["get-well-soon", "sorry", "remembrance", "farewell-retirement"],
    accent: "#D6C283",
    background: "#0B1418",
    tone: "calm",
    samplePhotos: samples(3, 5, 2, 1, 4),
  },
];

const MEMORY_MAP = new Map(MEMORY_TEMPLATES.map((template) => [template.id, template]));

export function getMemoryTemplate(id: string): MemoryTemplate | null {
  return MEMORY_MAP.get(id as MemoryTemplateId) ?? null;
}

export function memoryTemplatesForCategory(category: string): MemoryTemplate[] {
  const matches = MEMORY_TEMPLATES.filter((template) =>
    template.categories.includes(category),
  );
  return matches.length > 0 ? matches : MEMORY_TEMPLATES;
}

export function defaultMemoryTemplateId(category: string): MemoryTemplateId {
  return memoryTemplatesForCategory(category)[0]?.id ?? "3d-tunnel";
}
