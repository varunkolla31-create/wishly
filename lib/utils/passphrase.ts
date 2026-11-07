const WORDS = [
  "amber",
  "breeze",
  "candle",
  "clover",
  "coral",
  "daisy",
  "dawn",
  "ember",
  "fable",
  "feather",
  "fern",
  "fig",
  "glow",
  "harbor",
  "honey",
  "ivory",
  "jasmine",
  "lantern",
  "lilac",
  "linen",
  "marigold",
  "meadow",
  "mint",
  "moon",
  "olive",
  "orchid",
  "peach",
  "pebble",
  "plum",
  "river",
  "saffron",
  "seashell",
  "silk",
  "sparrow",
  "sunset",
  "thistle",
  "tulip",
  "velvet",
  "willow",
  "wren",
] as const;

function randomInt(max: number): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return (buffer[0] ?? 0) % max;
}

function randomWord(): string {
  const word = WORDS[randomInt(WORDS.length)];
  if (!word) throw new Error("Word list is empty.");
  return word;
}

export function generatePassphrase(): string {
  const words = [randomWord(), randomWord(), randomWord()];
  const number = String(randomInt(90) + 10);
  return `${words.join("-")}-${number}`;
}
