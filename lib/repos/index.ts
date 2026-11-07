import "server-only";
import { env } from "@/lib/env";
import { FileContributionRepo } from "@/lib/repos/file/contribution-repo";
import { FileMediaStore } from "@/lib/repos/file/media-store";
import { FileReplyRepo } from "@/lib/repos/file/reply-repo";
import { FileWishRepo } from "@/lib/repos/file/wish-repo";
import type {
  Contribution,
  ContributionRepo,
  MediaStore,
  Reply,
  ReplyRepo,
  Wish,
  WishRepo,
} from "@/lib/repos/types";
import { JsonCollection } from "@/lib/storage/json-collection";
import { collectionPath } from "@/lib/storage/paths";

const collections = new Map<string, JsonCollection<unknown>>();

function jsonCollection<T>(name: string): JsonCollection<T> {
  const filePath = collectionPath(name);
  const existing = collections.get(filePath);
  if (existing) return existing as JsonCollection<T>;

  const created = new JsonCollection<T>(filePath);
  collections.set(filePath, created);
  return created;
}

function assertFileAdapter(kind: "DATA_ADAPTER" | "MEDIA_ADAPTER"): void {
  const config = env();
  const adapter = kind === "DATA_ADAPTER" ? config.DATA_ADAPTER : config.MEDIA_ADAPTER;
  if (adapter !== "file") {
    throw new Error(
      `${kind}=${adapter} is not available in this build. The AWS adapters land in M5.`,
    );
  }
}

export function wishRepo(): WishRepo {
  assertFileAdapter("DATA_ADAPTER");
  return new FileWishRepo(jsonCollection<Wish>("wishes"));
}

export function contributionRepo(): ContributionRepo {
  assertFileAdapter("DATA_ADAPTER");
  return new FileContributionRepo(jsonCollection<Contribution>("contributions"));
}

export function replyRepo(): ReplyRepo {
  assertFileAdapter("DATA_ADAPTER");
  return new FileReplyRepo(jsonCollection<Reply>("replies"));
}

export function mediaStore(): MediaStore {
  assertFileAdapter("MEDIA_ADAPTER");
  return new FileMediaStore();
}
