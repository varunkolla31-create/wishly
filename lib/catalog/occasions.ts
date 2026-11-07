import type { Occasion } from "@/lib/catalog/types";

export const OCCASIONS: Occasion[] = [
  {
    slug: "birthday",
    name: "Birthday",
    tone: "fun",
    icon: "cake",
    defaultTemplateId: "confetti-pop",
    defaultMusicId: "warm-glow",
    blurb:
      "Candles, inside jokes, and the photos only you two would pick. Build a birthday page they unlock like a gift.",
    prompts: [
      "The year we laughed until the lights came on",
      "Three things I hope this year gives you",
      "A photo from the day we met",
    ],
    seoTitle: "Birthday wish pages",
    seoDescription:
      "Create a password-protected birthday wish page with photos, music and a message they unlock like a gift.",
  },
  {
    slug: "anniversary",
    name: "Anniversary",
    tone: "fun",
    icon: "heart-handshake",
    defaultTemplateId: "golden-hour",
    defaultMusicId: "warm-glow",
    blurb:
      "The years, the small rituals, the song that always plays. Gather it into one page they open together.",
    prompts: [
      "The moment I knew this was forever",
      "Our ordinary Tuesday, which I love most",
      "A promise for the next year",
    ],
    seoTitle: "Anniversary wish pages",
    seoDescription:
      "A password-protected anniversary page with your photos, music and a letter they unlock together.",
  },
  {
    slug: "love-valentine",
    name: "Love and Valentine",
    tone: "fun",
    icon: "heart",
    defaultTemplateId: "romantic-rose",
    defaultMusicId: "night-sky",
    blurb:
      "Less chocolate box, more the real thing. A private page for the words you'd rather say slowly.",
    prompts: [
      "What I noticed about you first",
      "A small thing you do that I never want to lose",
      "The song that belongs to us",
    ],
    seoTitle: "Valentine and love wish pages",
    seoDescription:
      "Make a private, password-protected love page with photos, a voice note and a message they unlock.",
  },
  {
    slug: "wedding-engagement",
    name: "Wedding and Engagement",
    tone: "fun",
    icon: "gem",
    defaultTemplateId: "golden-hour",
    defaultMusicId: "soft-bells",
    blurb:
      "For the couple, or from the whole guest list. Collect wishes from friends and hand them over as a memory wall.",
    prompts: [
      "The moment we knew they were meant for each other",
      "A wish for the marriage, not just the wedding",
      "A photo from the beginning",
    ],
    seoTitle: "Wedding and engagement wish pages",
    seoDescription:
      "Collect wishes from friends and create a password-protected wedding page with a memory wall.",
  },
  {
    slug: "baby-shower-newborn",
    name: "Baby Shower and Newborn",
    tone: "fun",
    icon: "baby",
    defaultTemplateId: "soft-pastel",
    defaultMusicId: "gentle-morning",
    blurb:
      "Welcome the small new person with soft colors, family photos, and a few words for the tired, happy parents.",
    prompts: [
      "The advice we wish someone had given us",
      "What we already love about you, little one",
      "A photo of the family you're joining",
    ],
    seoTitle: "Baby shower and newborn wish pages",
    seoDescription:
      "A gentle, password-protected wish page for a baby shower or a newborn, with photos and messages from family.",
  },
  {
    slug: "graduation",
    name: "Graduation",
    tone: "fun",
    icon: "graduation-cap",
    defaultTemplateId: "confetti-pop",
    defaultMusicId: "gentle-morning",
    blurb:
      "Years of late nights, then one very good morning. Mark it with the people who watched you get there.",
    prompts: [
      "The moment I knew you'd make it",
      "One thing I hope you never stop doing",
      "A photo from the impossible semester",
    ],
    seoTitle: "Graduation wish pages",
    seoDescription:
      "Celebrate a graduation with a password-protected page of photos, messages and music they unlock.",
  },
  {
    slug: "farewell-retirement",
    name: "Farewell and Retirement",
    tone: "fun",
    icon: "briefcase",
    defaultTemplateId: "golden-hour",
    defaultMusicId: "warm-glow",
    blurb:
      "Give the goodbye the attention it deserves. Collect notes from the whole team before the last day.",
    prompts: [
      "The thing I'll remember most",
      "Advice I'll actually use",
      "What we hope your slow mornings look like",
    ],
    seoTitle: "Farewell and retirement wish pages",
    seoDescription:
      "Collect farewell notes and build a password-protected retirement page the whole team can contribute to.",
  },
  {
    slug: "get-well-soon",
    name: "Get Well Soon",
    tone: "calm",
    icon: "heart-pulse",
    defaultTemplateId: "calm-sky",
    defaultMusicId: "gentle-morning",
    blurb:
      "Something quiet to open on a hard day. Soft motion, no confetti, just the people rooting for them.",
    prompts: [
      "Something small that made me think of you",
      "No pressure to reply — we're just here",
      "A photo of the last good afternoon we had",
    ],
    seoTitle: "Get well soon wish pages",
    seoDescription:
      "A calm, password-protected get well page with gentle messages and photos from the people who care.",
  },
  {
    slug: "thank-you",
    name: "Thank You",
    tone: "fun",
    icon: "gift",
    defaultTemplateId: "clean-white",
    defaultMusicId: "warm-glow",
    blurb:
      "For the teacher, the neighbour, the friend who showed up. Say it properly, with pictures.",
    prompts: [
      "What you did that I still think about",
      "The thing I never got to say out loud",
      "A photo that reminds me of you",
    ],
    seoTitle: "Thank you wish pages",
    seoDescription:
      "Say thank you properly with a password-protected page of photos, music and a heartfelt message.",
  },
  {
    slug: "sorry",
    name: "Sorry",
    tone: "calm",
    icon: "flower",
    defaultTemplateId: "calm-sky",
    defaultMusicId: "night-sky",
    blurb:
      "Some things are better said slowly and in private. Write it down, give them time, let them open it when ready.",
    prompts: [
      "What I should have said sooner",
      "What I understand now",
      "Where I'd like us to go from here",
    ],
    seoTitle: "Sorry and apology pages",
    seoDescription:
      "A private, password-protected page for a sincere apology, with space for your words and no pressure.",
  },
  {
    slug: "mothers-fathers-day",
    name: "Mother's Day and Father's Day",
    tone: "fun",
    icon: "flower",
    defaultTemplateId: "soft-pastel",
    defaultMusicId: "gentle-morning",
    blurb:
      "The photos are probably blurry and that's the point. A page of small, specific gratitude.",
    prompts: [
      "The thing you did every single morning",
      "Something I learned from you without noticing",
      "A photo from before I was born",
    ],
    seoTitle: "Mother's Day and Father's Day wish pages",
    seoDescription:
      "Make a password-protected Mother's or Father's Day page with family photos, messages and music.",
  },
  {
    slug: "friendship",
    name: "Friendship",
    tone: "fun",
    icon: "users",
    defaultTemplateId: "confetti-pop",
    defaultMusicId: "gentle-morning",
    blurb:
      "No occasion required. For the friend who has seen everything and stayed anyway.",
    prompts: [
      "The night that still makes me laugh",
      "Something you got me through",
      "A photo we both look terrible in",
    ],
    seoTitle: "Friendship wish pages",
    seoDescription:
      "Celebrate a friendship with a password-protected page of shared photos, inside jokes and messages.",
  },
  {
    slug: "diwali",
    name: "Diwali",
    tone: "fun",
    icon: "sparkles",
    defaultTemplateId: "festival-lights",
    defaultMusicId: "soft-bells",
    blurb:
      "Lamps, sweets, and the family chat in one place. A festival page with warm light and good wishes.",
    prompts: [
      "The memory that comes back every Diwali",
      "A wish for the year ahead",
      "A photo of the house all lit up",
    ],
    seoTitle: "Diwali wish pages",
    seoDescription:
      "Create a Diwali wish page with warm festival colors, photos and a message they unlock.",
  },
  {
    slug: "pongal",
    name: "Pongal",
    tone: "fun",
    icon: "sun",
    defaultTemplateId: "festival-lights",
    defaultMusicId: "gentle-morning",
    blurb:
      "Morning light, new clothes, and the sound of the whole street cooking. Send the warmth.",
    prompts: [
      "The smell of Pongal morning",
      "A wish for a good harvest year",
      "A photo from the kitchen",
    ],
    seoTitle: "Pongal wish pages",
    seoDescription:
      "Send a Pongal wish with a password-protected page of photos, music and warm words.",
  },
  {
    slug: "eid",
    name: "Eid",
    tone: "fun",
    icon: "moon",
    defaultTemplateId: "festival-lights",
    defaultMusicId: "night-sky",
    blurb:
      "After the prayers, before the noise. A quiet, beautiful card for people far away.",
    prompts: [
      "A memory of Eid at home",
      "A wish for peace this year",
      "A photo of everyone dressed up",
    ],
    seoTitle: "Eid wish pages",
    seoDescription:
      "Create an Eid wish page with night colors, photos and a message your family unlocks.",
  },
  {
    slug: "christmas",
    name: "Christmas",
    tone: "fun",
    icon: "tree",
    defaultTemplateId: "festival-lights",
    defaultMusicId: "soft-bells",
    blurb:
      "Lights in the window, a message in their pocket. A small gift that isn't wrapping paper.",
    prompts: [
      "The Christmas we still talk about",
      "A wish for their year",
      "A photo of the tree, before the chaos",
    ],
    seoTitle: "Christmas wish pages",
    seoDescription:
      "Create a Christmas wish page with warm lights, photos, music and a message they unlock.",
  },
  {
    slug: "holi",
    name: "Holi",
    tone: "fun",
    icon: "droplets",
    defaultTemplateId: "confetti-pop",
    defaultMusicId: "warm-glow",
    blurb:
      "Color everywhere, and the friends who started it. Send a page that feels like that afternoon.",
    prompts: [
      "The year we lost all the towels",
      "A wish for a bright year",
      "A photo before everyone got covered",
    ],
    seoTitle: "Holi wish pages",
    seoDescription:
      "Send a colorful Holi wish with a password-protected page of photos, music and messages.",
  },
  {
    slug: "new-year",
    name: "New Year",
    tone: "fun",
    icon: "party",
    defaultTemplateId: "midnight-glow",
    defaultMusicId: "night-sky",
    blurb:
      "Count the year down with the people who made it. A dark, golden page for midnight.",
    prompts: [
      "The moment this year turned around",
      "What I want for us next year",
      "A photo from the best night",
    ],
    seoTitle: "New Year wish pages",
    seoDescription:
      "Create a New Year wish page with midnight colors, photos and a message to open at twelve.",
  },
  {
    slug: "remembrance",
    name: "Remembrance",
    tone: "calm",
    icon: "star",
    defaultTemplateId: "calm-sky",
    defaultMusicId: "night-sky",
    blurb:
      "A quiet place to remember, together. Soft light, no confetti, and room for everyone's memory.",
    prompts: [
      "The laugh I still hear",
      "A small thing they did that I miss",
      "A photo from a good, ordinary day",
    ],
    seoTitle: "Remembrance pages",
    seoDescription:
      "Create a calm, password-protected remembrance page to gather memories and photos together.",
  },
];

const OCCASION_MAP = new Map(OCCASIONS.map((occasion) => [occasion.slug, occasion]));

export function getOccasion(slug: string): Occasion | null {
  return OCCASION_MAP.get(slug) ?? null;
}

export const OCCASION_SLUGS = OCCASIONS.map((occasion) => occasion.slug);

export const CALM_OCCASION_SLUGS = OCCASIONS.filter(
  (occasion) => occasion.tone === "calm",
).map((occasion) => occasion.slug);
