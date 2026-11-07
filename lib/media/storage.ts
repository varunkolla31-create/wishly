import "server-only";
import path from "node:path";
import { isValidMediaKey } from "@/lib/media/validate";
import { dataDir } from "@/lib/storage/paths";

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
