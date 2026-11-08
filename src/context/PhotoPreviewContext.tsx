"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SAMPLE_PHOTOS } from "@/src/components/three-memory/catalog";

const STORAGE_KEY = "wishly_preview_photos";
const MAX_PHOTOS = 10;
const MAX_EDGE = 900;

interface PhotoPreviewValue {
  photos: string[];
  addFiles: (files: FileList | File[]) => Promise<void>;
  clear: () => void;
  consume: () => string[];
}

const PhotoPreviewContext = createContext<PhotoPreviewValue | null>(null);

function readStored(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function fileToDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}

export function PhotoPreviewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [photos, setPhotos] = useState<string[]>(() => SAMPLE_PHOTOS.slice(0, 5));

  useEffect(() => {
    const stored = readStored();
    if (stored.length > 0) setPhotos(stored);
  }, []);

  const persist = useCallback((next: string[]) => {
    setPhotos(next);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Session storage is a convenience; the in-memory list still works.
    }
  }, []);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).slice(0, MAX_PHOTOS);
      const urls = await Promise.all(list.map((file) => fileToDataUrl(file)));
      persist(urls.filter((url): url is string => Boolean(url)));
    },
    [persist],
  );

  const clear = useCallback(() => {
    persist(SAMPLE_PHOTOS.slice(0, 5));
  }, [persist]);

  const consume = useCallback(() => readStored(), []);

  const value = useMemo(
    () => ({ photos, addFiles, clear, consume }),
    [photos, addFiles, clear, consume],
  );

  return (
    <PhotoPreviewContext.Provider value={value}>
      {children}
    </PhotoPreviewContext.Provider>
  );
}

export function usePhotoPreview(): PhotoPreviewValue {
  const value = useContext(PhotoPreviewContext);
  if (!value) {
    throw new Error("usePhotoPreview must be used inside PhotoPreviewProvider.");
  }
  return value;
}

export { STORAGE_KEY as PHOTO_PREVIEW_STORAGE_KEY, MAX_PHOTOS };
