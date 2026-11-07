export interface DemoWishData {
  id: string;
  receiverName: string;
  title: string;
  message: string;
  templateId: string;
  category: string;
  musicId: string;
  password: string;
  hint: string;
}

/**
 * Permanent, database-free demos. The receiver flow is exercised entirely in
 * the browser; the passwords are intentionally public.
 */
export const DEMO_WISHES: DemoWishData[] = [
  {
    id: "demo-love",
    receiverName: "you",
    title: "For you, always",
    message:
      "I kept trying to find a way to say this that didn't sound like a card.\n\nSo: I like the way you say my name when you're half asleep. I like that you leave a light on when I'm late. I like the ordinary Tuesdays more than I like most celebrations.\n\nThis page has a password because some things should be opened slowly. The word is on the front, and you've known it for years.\n\nAlways.",
    templateId: "romantic-rose",
    category: "love-valentine",
    musicId: "slow-guitar",
    password: "always",
    hint: "The word on the front of this card",
  },
  {
    id: "demo-amma",
    receiverName: "Amma",
    title: "Happy birthday, Amma",
    message:
      "Every morning of my childhood had the same soundtrack: the pressure cooker, the radio, and you, humming something slightly off-key.\n\nYou taught me how to fold a sari, how to make rasam when nothing feels right, and how to be brave without announcing it. I notice all of it now.\n\nI hope this year is gentle with you. I hope you take the afternoon nap. I hope you let us spoil you for once.\n\nHappy birthday. We call you Amma every single day, so that seemed like a good password.",
    templateId: "golden-hour",
    category: "birthday",
    musicId: "warm-glow",
    password: "amma",
    hint: "What we call you every day",
  },
  {
    id: "demo-midnight",
    receiverName: "you",
    title: "See you at midnight",
    message:
      "The year was loud. We made it through anyway.\n\nThank you for the night we missed the last train and walked home talking. Thank you for the message you sent when you didn't know I needed it. Thank you for staying.\n\nLet's do it again next year: the small dinners, the terrible jokes, the good music, the people we love.\n\nSee you at midnight.",
    templateId: "midnight-glow",
    category: "new-year",
    musicId: "night-sky",
    password: "midnight",
    hint: "When the clock strikes 12",
  },
];

const DEMO_MAP = new Map(DEMO_WISHES.map((wish) => [wish.id, wish]));

export function getDemoWish(id: string): DemoWishData | null {
  return DEMO_MAP.get(id) ?? null;
}
