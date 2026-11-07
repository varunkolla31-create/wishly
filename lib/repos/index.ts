import "server-only";
import { dataAdapter, mediaAdapter } from "@/lib/env";
import { DynamoContributionRepo } from "@/lib/repos/dynamodb/contribution-repo";
import { DynamoReplyRepo } from "@/lib/repos/dynamodb/reply-repo";
import { DynamoWishRepo } from "@/lib/repos/dynamodb/wish-repo";
import { FileContributionRepo } from "@/lib/repos/file/contribution-repo";
import { FileMediaStore } from "@/lib/repos/file/media-store";
import { FileReplyRepo } from "@/lib/repos/file/reply-repo";
import { FileWishRepo } from "@/lib/repos/file/wish-repo";
import { S3MediaStore } from "@/lib/repos/s3/media-store";
import { PostgresContributionRepo } from "@/lib/repos/postgres/contribution-repo";
import { PostgresReplyRepo } from "@/lib/repos/postgres/reply-repo";
import { PostgresWishRepo } from "@/lib/repos/postgres/wish-repo";
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
  const adapter = dataAdapter();
  if (adapter === "dynamodb") return new DynamoWishRepo();
  if (adapter === "postgres") return new PostgresWishRepo();
  return new FileWishRepo(jsonCollection<Wish>("wishes"));
}

export function contributionRepo(): ContributionRepo {
  const adapter = dataAdapter();
  if (adapter === "dynamodb") return new DynamoContributionRepo();
  if (adapter === "postgres") return new PostgresContributionRepo();
  return new FileContributionRepo(jsonCollection<Contribution>("contributions"));
}

export function replyRepo(): ReplyRepo {
  const adapter = dataAdapter();
  if (adapter === "dynamodb") return new DynamoReplyRepo();
  if (adapter === "postgres") return new PostgresReplyRepo();
  return new FileReplyRepo(jsonCollection<Reply>("replies"));
}

export function mediaStore(): MediaStore {
  if (mediaAdapter() === "s3") return new S3MediaStore();
  return new FileMediaStore();
}
