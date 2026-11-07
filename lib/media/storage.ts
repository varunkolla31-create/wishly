import "server-only";
import path from "node:path";
import { dataDir } from "@/lib/storage/paths";

const KEY_PATTERN =
  /^wishes\/[A-Za-z0-9_-]{1,64}\/(photo|video|voice)\/[A-Za-z0-9_-]{1,64}\.[a-z0-9]{1,5}$/;

export function isValidMediaKey(key: string): boolean {
  return KEY_PATTERN.test(key);
}

export function mediaFilePath(key: string): string {
  if (!isValidMediaKey(key)) {
    throw new Error("Invalid media key.");
  }

  const root = path.resolve(dataDir(), "media");
  const full = path.resolve(root, ...key.split("/"));

  if (!full.startsWith(root + path.sep)) {
    throw new Error("Invalid media key.");
  }

  return full;
}
