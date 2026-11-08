"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearGuestMedia,
  deleteGuestMedia,
  listGuestMedia,
  saveGuestMedia,
  type GuestMediaKind,
  type StoredGuestMedia,
} from "@/lib/media/guest-store";

export interface GuestMediaItem extends StoredGuestMedia {
  url: string;
}

const MAX_PHOTOS = 10;
const MAX_VIDEOS = 3;

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function captureVideoPoster(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    let settled = false;
    let timer: number | null = null;

    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      if (timer) window.clearTimeout(timer);
      video.pause();
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objectUrl);
      resolve(value);
    };

    timer = window.setTimeout(() => finish(null), 10_000);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadeddata = () => {
      window.requestAnimationFrame(() => {
        try {
          const width = 480;
          const height = video.videoWidth
            ? Math.max(
                1,
                Math.round((video.videoHeight / video.videoWidth) * width),
              )
            : 640;
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          if (!context) {
            finish(null);
            return;
          }
          context.drawImage(video, 0, 0, width, height);
          finish(canvas.toDataURL("image/jpeg", 0.82));
        } catch {
          finish(null);
        }
      });
    };
    video.onerror = () => finish(null);
    video.src = objectUrl;
    video.load();
  });
}

export function useGuestMedia() {
  const [media, setMedia] = useState<GuestMediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const mediaRef = useRef<GuestMediaItem[]>([]);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    let active = true;
    void listGuestMedia()
      .then((records) => {
        if (!active) return;
        const items = records.map((record) => ({
          ...record,
          url: URL.createObjectURL(record.file),
        }));
        urlsRef.current = items.map((item) => item.url);
        mediaRef.current = items;
        setMedia(items);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = [];
    };
  }, []);

  const addFiles = useCallback(
    async (kind: GuestMediaKind, files: FileList | File[]) => {
      if (busy) return;
      const list = Array.from(files);
      if (list.length === 0) return;

      setBusy(true);
      try {
        const used = mediaRef.current.filter((item) => item.kind === kind).length;
        const limit = kind === "photo" ? MAX_PHOTOS : MAX_VIDEOS;
        const accepted = list
          .filter((file) =>
            file.type.startsWith(kind === "photo" ? "image/" : "video/"),
          )
          .slice(0, Math.max(0, limit - used));

        for (const file of accepted) {
          const poster =
            kind === "video" ? await captureVideoPoster(file) : null;
          const record: StoredGuestMedia = {
            id: makeId(),
            kind,
            file,
            poster,
            createdAt: Date.now(),
          };
          await saveGuestMedia(record);
          const item: GuestMediaItem = {
            ...record,
            url: URL.createObjectURL(file),
          };
          urlsRef.current.push(item.url);
          mediaRef.current = [...mediaRef.current, item];
          setMedia(mediaRef.current);
        }
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );

  const remove = useCallback(async (id: string) => {
    const item = mediaRef.current.find((entry) => entry.id === id);
    if (!item) return;
    URL.revokeObjectURL(item.url);
    urlsRef.current = urlsRef.current.filter((url) => url !== item.url);
    mediaRef.current = mediaRef.current.filter((entry) => entry.id !== id);
    setMedia(mediaRef.current);
    await deleteGuestMedia(id).catch(() => undefined);
  }, []);

  const clear = useCallback(async () => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
    mediaRef.current = [];
    setMedia([]);
    await clearGuestMedia().catch(() => undefined);
  }, []);

  return {
    media,
    busy,
    ready,
    addFiles,
    remove,
    clear,
    maxPhotos: MAX_PHOTOS,
    maxVideos: MAX_VIDEOS,
  };
}
