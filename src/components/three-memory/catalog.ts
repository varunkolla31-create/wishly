export type MemoryRigId =
  | "3d-polaroid-clothesline"
  | "3d-vinyl-turntable"
  | "3d-sky-lanterns"
  | "3d-museum-corridor"
  | "3d-gift-box-explosion"
  | "3d-film-reel-projector"
  | "3d-scrapbook-flipbook"
  | "3d-candle-sanctuary";

export type AtmosphereId =
  | "classic"
  | "midnight-gold"
  | "rose-quartz"
  | "sea-glass"
  | "terracotta"
  | "neon-noir"
  | "pastel-cloud"
  | "forest-ember"
  | "champagne"
  | "monochrome"
  | "carnival"
  | "vintage-film"
  | "aurora"
  | "sandalwood"
  | "frost";

export type MemoryTemplateId = MemoryRigId | `${MemoryRigId}--${AtmosphereId}`;

export interface MemoryTemplate {
  id: MemoryTemplateId;
  /** The physical 3D rig that renders the scene. */
  rig: MemoryRigId;
  /** The colour/lighting preset layered on the rig. */
  preset: AtmosphereId;
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

const samples = (...indexes: number[]) =>
  indexes.map((index) => SAMPLE_PHOTOS[index] ?? SAMPLE_PHOTOS[0] ?? "");

interface MemoryRig {
  id: MemoryRigId;
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  tone: "fun" | "calm";
  samplePhotos: string[];
}

const MEMORY_RIGS: MemoryRig[] = [
  {
    id: "3d-polaroid-clothesline",
    name: "3D Polaroid Clothesline",
    tagline: "Fairy lights, pegs, and the good years.",
    description:
      "Two strings of warm fairy lights hold your photos as Polaroids on a dark bedroom wall at midnight. Each print hangs from a wooden peg and swings gently in place.",
    categories: [
      "birthday",
      "friendship",
      "baby-shower-newborn",
      "farewell-retirement",
      "mothers-fathers-day",
      "thank-you",
    ],
    tone: "fun",
    samplePhotos: samples(0, 1, 2, 3, 4),
  },
  {
    id: "3d-vinyl-turntable",
    name: "3D Vinyl Turntable",
    tagline: "Your people, in orbit around one song.",
    description:
      "A matte-black record spins at the centre with a gold label while your photos circle it as 3D album sleeves, with warm reflections on the floor.",
    categories: ["love-valentine", "anniversary", "wedding-engagement"],
    tone: "fun",
    samplePhotos: samples(5, 0, 3, 2, 1),
  },
  {
    id: "3d-sky-lanterns",
    name: "3D Sky Lanterns",
    tagline: "Warm light, rising into the night.",
    description:
      "Four-sided paper lanterns carry your photos as they drift upward under a sky of stars and gold bokeh, each face lit by the candle inside.",
    categories: ["diwali", "pongal", "eid", "christmas", "holi", "new-year"],
    tone: "fun",
    samplePhotos: samples(4, 5, 1, 2, 0),
  },
  {
    id: "3d-museum-corridor",
    name: "3D Museum Corridor",
    tagline: "A quiet gallery, lit just for them.",
    description:
      "Walk a sunlit corridor of arched frames, each memory under its own warm spotlight, ending at your letter on the back wall.",
    categories: [
      "thank-you",
      "graduation",
      "mothers-fathers-day",
      "farewell-retirement",
      "wedding-engagement",
    ],
    tone: "fun",
    samplePhotos: samples(1, 3, 5, 0, 2),
  },
  {
    id: "3d-gift-box-explosion",
    name: "3D Gift Box",
    tagline: "Unwrap it and the photos rise.",
    description:
      "A ribbon-wrapped cube unfolds when the scene opens, its walls folding flat as tiered photo cards and a cake rise out of the box.",
    categories: ["birthday", "wedding-engagement", "baby-shower-newborn"],
    tone: "fun",
    samplePhotos: samples(2, 4, 0, 5, 3),
  },
  {
    id: "3d-film-reel-projector",
    name: "3D Film Reel Projector",
    tagline: "A flickering reel of your best frames.",
    description:
      "A warm projector beam cuts through a dark theatre while your photos run through a sprocketed 35mm film strip, frame by frame.",
    categories: [
      "birthday",
      "friendship",
      "graduation",
      "new-year",
      "farewell-retirement",
      "thank-you",
    ],
    tone: "fun",
    samplePhotos: samples(3, 0, 4, 1, 5),
  },
  {
    id: "3d-scrapbook-flipbook",
    name: "3D Scrapbook Flipbook",
    tagline: "Tape, margins and pages that turn.",
    description:
      "An open scrapbook on a sunlit desk: photos taped at happy angles, washi strips, handwritten captions and pages that flip as the scene plays.",
    categories: [
      "friendship",
      "mothers-fathers-day",
      "thank-you",
      "graduation",
      "baby-shower-newborn",
      "anniversary",
    ],
    tone: "fun",
    samplePhotos: samples(2, 4, 0, 5, 3),
  },
  {
    id: "3d-candle-sanctuary",
    name: "3D Candle Sanctuary",
    tagline: "Still water, candlelight, no noise.",
    description:
      "Photos float above a dark mirror of water, lit by a breathing candle and reflected below. Built for the quiet days.",
    categories: ["get-well-soon", "sorry", "remembrance"],
    tone: "calm",
    samplePhotos: samples(3, 5, 2, 1, 4),
  },
];

interface Atmosphere {
  id: AtmosphereId;
  name: string;
  tagline: string;
  description: string;
  accent: string;
  background: string;
  tone: "fun" | "calm";
}

const ATMOSPHERES: Atmosphere[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "Warm gold and honest light.",
    description: "Tuned warm: champagne highlights and soft shadow.",
    accent: "#D6C283",
    background: "#0D0B12",
    tone: "fun",
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    tagline: "Black tie, gold dust.",
    description: "Tuned midnight: deep black with gold dust and low highlights.",
    accent: "#E3C27C",
    background: "#0A0A12",
    tone: "fun",
  },
  {
    id: "rose-quartz",
    name: "Rose Quartz",
    tagline: "Soft pink, warm skin tones.",
    description: "Tuned rose: blush light and a gentle rose-gold rim.",
    accent: "#E8A2B8",
    background: "#2A1A22",
    tone: "fun",
  },
  {
    id: "sea-glass",
    name: "Sea Glass",
    tagline: "Cool green, quiet water.",
    description: "Tuned sea glass: cool green light and soft aqua shadow.",
    accent: "#8FC7C0",
    background: "#0B1A1C",
    tone: "calm",
  },
  {
    id: "terracotta",
    name: "Terracotta",
    tagline: "Sun-baked clay and spice.",
    description: "Tuned terracotta: clay warmth and a dry, sunlit sky.",
    accent: "#D98A66",
    background: "#1E120C",
    tone: "fun",
  },
  {
    id: "neon-noir",
    name: "Neon Noir",
    tagline: "Midnight with a pink neon rim.",
    description: "Tuned neon: black room, hot pink rim light, film smoke.",
    accent: "#FF4D8D",
    background: "#0A0710",
    tone: "fun",
  },
  {
    id: "pastel-cloud",
    name: "Pastel Cloud",
    tagline: "Low-contrast, soft-focus pastel.",
    description: "Tuned pastel: floated contrast and candy light.",
    accent: "#F3C6D8",
    background: "#FDF6F2",
    tone: "calm",
  },
  {
    id: "forest-ember",
    name: "Forest Ember",
    tagline: "Moss, bark and a low fire.",
    description: "Tuned forest: moss green, bark brown, ember glow.",
    accent: "#9FBF7F",
    background: "#0F1A12",
    tone: "fun",
  },
  {
    id: "champagne",
    name: "Champagne",
    tagline: "Cream, gold and oyster.",
    description: "Tuned champagne: cream lift, oyster shadow, fine gold.",
    accent: "#E6D3A3",
    background: "#17130D",
    tone: "fun",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    tagline: "Black, white, nothing else.",
    description: "Tuned mono: silver light, hard shadow, no colour noise.",
    accent: "#CFCFCF",
    background: "#111111",
    tone: "calm",
  },
  {
    id: "carnival",
    name: "Carnival",
    tagline: "Confetti, marigold, big top.",
    description: "Tuned carnival: marigold light and saturated confetti.",
    accent: "#FFB347",
    background: "#1C0F1A",
    tone: "fun",
  },
  {
    id: "vintage-film",
    name: "Vintage Film",
    tagline: "Faded 35mm with warm grain.",
    description: "Tuned vintage: faded stock, warm grain, soft halation.",
    accent: "#C9A46A",
    background: "#1A1510",
    tone: "fun",
  },
  {
    id: "aurora",
    name: "Aurora",
    tagline: "Green-violet night sky.",
    description: "Tuned aurora: green-violet sky and a cold horizon.",
    accent: "#7FE0C4",
    background: "#0A1020",
    tone: "fun",
  },
  {
    id: "sandalwood",
    name: "Sandalwood",
    tagline: "Sandal, cinnamon, temple light.",
    description: "Tuned sandalwood: cinnamon warmth and temple gold.",
    accent: "#C8A27A",
    background: "#1A120B",
    tone: "fun",
  },
  {
    id: "frost",
    name: "Frost",
    tagline: "Pale blue, clean winter light.",
    description: "Tuned frost: pale blue light and a clean, quiet edge.",
    accent: "#B8D8EA",
    background: "#0C1418",
    tone: "calm",
  },
];

export const MEMORY_TEMPLATES: MemoryTemplate[] = MEMORY_RIGS.flatMap((rig) =>
  ATMOSPHERES.map((preset) => ({
    id: `${rig.id}--${preset.id}` as MemoryTemplateId,
    rig: rig.id,
    preset: preset.id,
    name: `${rig.name} · ${preset.name}`,
    tagline: preset.tagline,
    description: `${rig.description} ${preset.description}`,
    categories: rig.categories,
    accent: preset.accent,
    background: preset.background,
    tone: rig.tone === "calm" ? "calm" : preset.tone,
    samplePhotos: rig.samplePhotos,
  })),
);

const MEMORY_MAP = new Map<string, MemoryTemplate>(
  MEMORY_TEMPLATES.map((template) => [template.id, template]),
);

const RIG_IDS = new Set<string>(MEMORY_RIGS.map((rig) => rig.id));

/** Ids from the original catalog (and the brief's names) still resolve. */
const LEGACY_MEMORY_TEMPLATE_ALIASES: Record<string, MemoryRigId> = {
  "3d-tunnel": "3d-polaroid-clothesline",
  "3d-cylinder-ring": "3d-vinyl-turntable",
  "3d-polaroid-deck": "3d-polaroid-clothesline",
  "3d-lantern-float": "3d-sky-lanterns",
  "3d-editorial-museum": "3d-museum-corridor",
  "3d-calm-reflection": "3d-candle-sanctuary",
  "3d-gift-box-burst": "3d-gift-box-explosion",
  "polaroid-clothesline": "3d-polaroid-clothesline",
  "vinyl-turntable": "3d-vinyl-turntable",
  "sky-lanterns": "3d-sky-lanterns",
  "museum-corridor": "3d-museum-corridor",
  "gift-box-burst": "3d-gift-box-explosion",
  "film-reel-projector": "3d-film-reel-projector",
  "scrapbook-flipbook": "3d-scrapbook-flipbook",
  "candle-sanctuary": "3d-candle-sanctuary",
};

export const MEMORY_RIGS_PUBLIC = MEMORY_RIGS.map((rig) => ({
  id: rig.id,
  name: rig.name,
  tone: rig.tone,
}));

export const MEMORY_ATMOSPHERES_PUBLIC = ATMOSPHERES.map((preset) => ({
  id: preset.id,
  name: preset.name,
}));

export function getMemoryTemplate(id: string): MemoryTemplate | null {
  const direct = MEMORY_MAP.get(id);
  if (direct) return direct;

  const alias = LEGACY_MEMORY_TEMPLATE_ALIASES[id] ?? id;
  if (!RIG_IDS.has(alias)) return null;

  return (
    MEMORY_MAP.get(`${alias}--classic`) ??
    MEMORY_TEMPLATES.find((template) => template.rig === alias) ??
    null
  );
}

export function memoryTemplatesForCategory(category: string): MemoryTemplate[] {
  const matches = MEMORY_TEMPLATES.filter((template) =>
    template.categories.includes(category),
  );
  return matches.length > 0 ? matches : MEMORY_TEMPLATES;
}

export function defaultMemoryTemplateId(category: string): MemoryTemplateId {
  return (
    memoryTemplatesForCategory(category)[0]?.id ??
    "3d-polaroid-clothesline--classic"
  );
}
