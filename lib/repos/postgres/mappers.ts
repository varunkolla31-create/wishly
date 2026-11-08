import "server-only";
import type {
  Contribution,
  ContributionStatus,
  ContributionType,
  Reply,
  Wish,
  WishGateMode,
  WishMode,
  WishStatus,
} from "@/lib/repos/types";
import type { MusicBinding } from "@/lib/music/types";

function toIso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export interface WishRow {
  wish_id: string;
  owner_id: string;
  mode: WishMode;
  category: string;
  template_id: string;
  receiver_name: string;
  title: string;
  message: string;
  bonus_note: string | null;
  milestone_date: Date | string | null;
  milestone_label: string | null;
  secret_scratch_message: string | null;
  gift_voucher_code: string | null;
  quiz_question: string | null;
  quiz_options: string[] | null;
  quiz_answer_index: number | null;
  quiz_wrong_toast: string | null;
  gate_mode: string | null;
  reel_template_id: string | null;
  media_keys: string[] | null;
  /** Reserved for the parked music refactor; unused by the current types. */
  music: unknown;
  music_id: string | null;
  password_hash: string | null;
  password_hint: string | null;
  password_version: number;
  unlock_at: Date | string | null;
  status: WishStatus;
  contributor_token: string | null;
  contributor_token_revoked_at: Date | string | null;
  views: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export function toWish(row: WishRow): Wish {
  return {
    wishId: row.wish_id,
    ownerId: row.owner_id,
    mode: row.mode,
    category: row.category,
    templateId: row.template_id,
    receiverName: row.receiver_name,
    title: row.title,
    message: row.message,
    bonusNote: row.bonus_note,
    milestoneDate: toIso(row.milestone_date),
    milestoneLabel: row.milestone_label,
    secretScratchMessage: row.secret_scratch_message,
    giftVoucherCode: row.gift_voucher_code,
    quizQuestion: row.quiz_question,
    quizOptions: row.quiz_options ?? null,
    quizAnswerIndex: row.quiz_answer_index,
    quizWrongToast: row.quiz_wrong_toast,
    gateMode: (row.gate_mode as WishGateMode | null) ?? "password",
    reelTemplateId: row.reel_template_id,
    music: (row.music as MusicBinding | null) ?? null,
    mediaKeys: row.media_keys ?? [],
    musicId: row.music_id,
    passwordHash: row.password_hash,
    passwordHint: row.password_hint,
    passwordVersion: row.password_version,
    unlockAt: toIso(row.unlock_at),
    status: row.status,
    contributorToken: row.contributor_token,
    contributorTokenRevokedAt: toIso(row.contributor_token_revoked_at),
    views: row.views,
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
  };
}

export interface ContributionRow {
  wish_id: string;
  contribution_id: string;
  contributor_name: string;
  type: ContributionType;
  media_key: string | null;
  text: string | null;
  status: ContributionStatus;
  sort_order: number;
  created_at: Date | string;
}

export function toContribution(row: ContributionRow): Contribution {
  return {
    wishId: row.wish_id,
    contributionId: row.contribution_id,
    contributorName: row.contributor_name,
    type: row.type,
    mediaKey: row.media_key,
    text: row.text,
    status: row.status,
    order: row.sort_order,
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
  };
}

export interface ReplyRow {
  wish_id: string;
  reply_id: string;
  owner_id: string;
  message: string;
  emoji: string;
  created_at: Date | string;
}

export function toReply(row: ReplyRow): Reply {
  return {
    wishId: row.wish_id,
    replyId: row.reply_id,
    ownerId: row.owner_id,
    message: row.message,
    emoji: row.emoji,
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
  };
}
