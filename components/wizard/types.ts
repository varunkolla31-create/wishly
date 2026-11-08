import type { MusicBinding } from "@/lib/music/types";
import type { WishGateMode } from "@/lib/repos/types";

export const WIZARD_STEPS = [
  { id: "occasion", label: "Occasion" },
  { id: "template", label: "Template" },
  { id: "content", label: "Content" },
  { id: "collect", label: "Collect" },
  { id: "password", label: "Password" },
  { id: "preview", label: "Preview" },
] as const;

export interface DraftValues {
  category: string;
  templateId: string;
  mode: "solo" | "group";
  receiverName: string;
  title: string;
  message: string;
  milestoneDate: string;
  milestoneLabel: string;
  secretScratchMessage: string;
  giftVoucherCode: string;
  quizQuestion: string;
  quizOption0: string;
  quizOption1: string;
  quizOption2: string;
  quizAnswerIndex: number;
  quizWrongToast: string;
  gateMode: WishGateMode;
  reelTemplateId: string;
  mediaKeys: string[];
  musicId: string | null;
  music: MusicBinding | null;
  unlockAt: string;
}

export function toLocalDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function toLocalDateInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function fromLocalDateTimeInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
