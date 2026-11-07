import type { MediaKind } from "@/lib/media/validate";

export interface MediaItem {
  key: string;
  url: string;
  kind: MediaKind;
}
