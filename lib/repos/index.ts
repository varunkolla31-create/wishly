import "server-only";
import { env } from "@/lib/env";
import { DynamoContributionRepo } from "@/lib/repos/dynamodb/contribution-repo";
import { DynamoReplyRepo } from "@/lib/repos/dynamodb/reply-repo";
import { DynamoWishRepo } from "@/lib/repos/dynamodb/wish-repo";
import { FileContributionRepo } from "@/lib/repos/file/contribution-repo";
import { FileMediaStore } from "@/lib/repos/file/media-store";
import { FileReplyRepo } from "@/lib/repos/file/reply-repo";
import { FileWishRepo } from "@/lib/repos/file/wish-repo";
import { S3MediaStore } from "@/lib/repos/s3/media-store";
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

export function wishRepo(): WishRepo {
  if (env().DATA_ADAPTER === "dynamodb") return new DynamoWishRepo();
  return new FileWishRepo(jsonCollection<Wish>("wishes"));
}

export function contributionRepo(): ContributionRepo {
  if (env().DATA_ADAPTER === "dynamodb") return new DynamoContributionRepo();
  return new FileContributionRepo(jsonCollection<Contribution>("contributions"));
}

export function replyRepo(): ReplyRepo {
  if (env().DATA_ADAPTER === "dynamodb") return new DynamoReplyRepo();
  return new FileReplyRepo(jsonCollection<Reply>("replies"));
}

export function mediaStore(): MediaStore {
  if (env().MEDIA_ADAPTER === "s3") return new S3MediaStore();
  return new FileMediaStore();
}
