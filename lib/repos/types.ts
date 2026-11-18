import type { MediaKind, UploadVerification } from "@/lib/media/validate";
import type { MusicBinding } from "@/lib/music/types";

export type WishStatus = "draft" | "collecting" | "published" | "locked";
export type WishMode = "solo" | "group";
export type WishGateMode = "password" | "quiz" | "both";

export interface Wish {
  wishId: string;
  ownerId: string;
  mode: WishMode;
  category: string;
  templateId: string;
  receiverName: string;
  title: string;
  message: string;
  /** Optional scratch-to-reveal note or gift code. */
  bonusNote: string | null;
  /** Live "time since" milestone shown on the reveal page. */
  milestoneDate: string | null;
  milestoneLabel: string | null;
  /** Gold-foil scratch card copy and optional voucher code. */
  secretScratchMessage: string | null;
  giftVoucherCode: string | null;
  /** Optional one-question memory quiz gate. */
  quizQuestion: string | null;
  quizOptions: string[] | null;
  quizAnswerIndex: number | null;
  quizWrongToast: string | null;
  gateMode: WishGateMode;
  /** Native 3D memory reel template id. */
  reelTemplateId: string | null;
  /** YouTube music binding. Never both this and musicId. */
  music: MusicBinding | null;
  /** Random keys under `wishes/<wishId>/<kind>/...`; kind is the path segment. */
  mediaKeys: string[];
  musicId: string | null;
  passwordHash: string | null;
  passwordHint: string | null;
  passwordVersion: number;
  unlockAt: string | null;
  status: WishStatus;
  contributorToken: string | null;
  contributorTokenRevokedAt: string | null;
  /**
   * SHA-256 of the manage token handed to a creator who published without
   * signing in. Only the hash is stored; the raw token is shown once.
   */
  manageTokenHash: string | null;
  /** When an anonymous wish stops being reachable. Null means never. */
  expiresAt: string | null;
  /** Set when an anonymous wish is claimed by a signed-in sender. */
  claimedAt: string | null;
  /** First time a receiver opened the reveal. Null until then. */
  openedAt: string | null;
  /**
   * Sender's address, copied onto the row at creation for signed-in wishes so
   * the one-off "your wish was opened" note can be sent without a Clerk lookup.
   * Null for anonymous wishes, which never get a notification.
   */
  ownerEmail: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewWish {
  ownerId: string;
  ownerEmail?: string | null;
  mode?: WishMode;
  category: string;
  templateId: string;
  receiverName?: string;
  title?: string;
}

export type WishPatch = Partial<
  Omit<Wish, "wishId" | "ownerId" | "createdAt" | "updatedAt" | "views">
>;

export interface WishRepo {
  create(input: NewWish): Promise<Wish>;
  getById(wishId: string): Promise<Wish | null>;
  getByContributorToken(token: string): Promise<Wish | null>;
  /** Looks a wish up by the hash of its manage token. */
  getByManageTokenHash(hash: string): Promise<Wish | null>;
  listByOwner(ownerId: string): Promise<Wish[]>;
  update(wishId: string, patch: WishPatch): Promise<Wish | null>;
  delete(wishId: string): Promise<boolean>;
  incrementViews(wishId: string, by?: number): Promise<void>;
}

export type ContributionType = "photo" | "video" | "voice" | "text";
export type ContributionStatus = "pending" | "approved" | "hidden";

export interface Contribution {
  wishId: string;
  contributionId: string;
  contributorName: string;
  type: ContributionType;
  mediaKey: string | null;
  text: string | null;
  status: ContributionStatus;
  order: number;
  createdAt: string;
}

export interface NewContribution {
  wishId: string;
  contributorName: string;
  type: ContributionType;
  mediaKey?: string | null;
  text?: string | null;
  status?: ContributionStatus;
}

export interface ContributionRepo {
  create(input: NewContribution): Promise<Contribution>;
  getById(
    wishId: string,
    contributionId: string,
  ): Promise<Contribution | null>;
  listByWish(
    wishId: string,
    status?: ContributionStatus,
  ): Promise<Contribution[]>;
  updateStatus(
    wishId: string,
    contributionId: string,
    status: ContributionStatus,
  ): Promise<Contribution | null>;
  reorder(wishId: string, orderedIds: string[]): Promise<void>;
  delete(wishId: string, contributionId: string): Promise<boolean>;
  deleteByWish(wishId: string): Promise<void>;
}

export interface Reply {
  wishId: string;
  replyId: string;
  ownerId: string;
  message: string;
  emoji: string;
  createdAt: string;
}

export interface NewReply {
  wishId: string;
  ownerId: string;
  message: string;
  emoji: string;
}

export interface ReplyRepo {
  create(input: NewReply): Promise<Reply>;
  listByWish(wishId: string): Promise<Reply[]>;
  listByOwner(ownerId: string): Promise<Reply[]>;
  deleteByWish(wishId: string): Promise<void>;
}

export interface PresignInput {
  wishId: string;
  kind: MediaKind;
  contentType: string;
  size: number;
}

export interface UploadTarget {
  key: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
}

export interface MediaStore {
  createUpload(input: PresignInput): Promise<UploadTarget>;
  createReadUrl(key: string): Promise<string>;
  /** Confirms an upload exists, matches its key's type and fits the size cap. */
  verifyUpload(key: string): Promise<UploadVerification>;
  delete(key: string): Promise<void>;
}
