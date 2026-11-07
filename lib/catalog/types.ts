export type OccasionTone = "fun" | "calm";

export type OccasionIcon =
  | "cake"
  | "heart-handshake"
  | "heart"
  | "gem"
  | "baby"
  | "graduation-cap"
  | "briefcase"
  | "heart-pulse"
  | "gift"
  | "flower"
  | "users"
  | "sparkles"
  | "sun"
  | "moon"
  | "tree"
  | "droplets"
  | "party"
  | "star";

export interface Occasion {
  slug: string;
  name: string;
  tone: OccasionTone;
  icon: OccasionIcon;
  defaultTemplateId: string;
  defaultMusicId: string;
  blurb: string;
  prompts: string[];
  seoTitle: string;
  seoDescription: string;
}

export type PhotoLayout = "stack" | "grid" | "collage";
export type ConfettiStyle = "coral" | "gold" | "pastel" | "festival" | "none";

export interface TemplatePalette {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  tagline: string;
  tone: OccasionTone;
  titleStyle: "serif" | "sans";
  photoLayout: PhotoLayout;
  confetti: ConfettiStyle;
  musicMood: string;
  palette: TemplatePalette;
  /** Gradient preview used by marketing cards; reveal styling derives from palette. */
  preview: { from: string; to: string };
}

export interface MusicTrack {
  id: string;
  title: string;
  mood: string;
  file: string;
}
