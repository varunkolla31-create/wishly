import { describe, expect, it } from "vitest";
import { mediaFilePath, isValidMediaKey } from "@/lib/media/storage";
import {
  acceptAttribute,
  contentTypeForKey,
  validateUpload,
} from "@/lib/media/validate";

describe("upload validation", () => {
  it("accepts allowed types under the size cap", () => {
    expect(validateUpload("photo", "image/jpeg", 2 * 1024 * 1024)).toEqual({
      ok: true,
      extension: "jpg",
    });
    expect(validateUpload("video", "video/mp4", 50 * 1024 * 1024)).toEqual({
      ok: true,
      extension: "mp4",
    });
  });

  it("rejects disallowed types", () => {
    const result = validateUpload("photo", "application/pdf", 1024);
    expect(result.ok).toBe(false);
  });

  it("rejects files over the cap", () => {
    const result = validateUpload("voice", "audio/webm", 6 * 1024 * 1024);
    expect(result.ok).toBe(false);
  });

  it("derives content types from keys", () => {
    expect(
      contentTypeForKey("wishes/abc/photo/thing.webp"),
    ).toBe("image/webp");
    expect(contentTypeForKey("wishes/abc/voice/thing.m4a")).toBe("audio/mp4");
  });

  it("exposes accept attributes for file inputs", () => {
    expect(acceptAttribute("photo")).toContain("image/jpeg");
  });
});

describe("media keys", () => {
  it("accepts well-formed keys and rejects traversal", () => {
    expect(isValidMediaKey("wishes/abc123/photo/xyz789.jpg")).toBe(true);
    expect(isValidMediaKey("wishes/abc/photo/../../etc/passwd")).toBe(false);
    expect(isValidMediaKey("other/abc/photo/xyz.jpg")).toBe(false);
    expect(() => mediaFilePath("../secret")).toThrow();
  });
});
