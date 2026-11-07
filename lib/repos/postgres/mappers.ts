import "server-only";
import type {
  Contribution,
  ContributionStatus,
  ContributionType,
  Reply,
  Wish,
  WishMode,
  WishStatus,
} from "@/lib/repos/types";

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
  media_keys: string[] | null;
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
  order: number;
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
    order: row.order,
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
