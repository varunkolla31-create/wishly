# Media storage

Photos, short videos and voice notes are the only binary content in Wishly.
Everything goes through the `MediaStore` interface in `lib/repos/types.ts`, so
the app never talks to a storage SDK directly.

## Drivers

| `MEDIA_DRIVER` | Adapter | Where objects live | Use |
|---|---|---|---|
| `file` (default) | `lib/repos/file/media-store.ts` | `.wishly-data/media/…` on disk | local development, tests |
| `r2` | `lib/repos/r2/media-store.ts` | Cloudflare R2 bucket | current production target |
| `aws` | `lib/repos/s3/media-store.ts` | S3 bucket | only if the AWS account allows it |

`DB_DRIVER` and `MEDIA_DRIVER` are independent, so data can be on Postgres while
media is on R2.

The local `/api/uploads/*` and `/api/media/*` routes are gated to the file
driver; under `r2`/`aws` they 404 because the browser talks to the bucket
directly.

## The interface

```ts
interface MediaStore {
  createUpload(input: { wishId; kind; contentType; size }): Promise<UploadTarget>;
  createReadUrl(key: string): Promise<string>;
  verifyUpload(key: string): Promise<
    | { ok: true; size: number; contentType: string }
    | { ok: false; reason: "missing" | "type" | "size" }
  >;
  delete(key: string): Promise<void>;
}
```

`verifyUpload` is not optional glue: it is what makes "stored" mean the same
thing on every driver. It checks that the object exists, that its content type
matches the extension in its key, and that it fits the per-kind size cap.

## Keys

```
wishes/{wishId}/{kind}/{randomId}.{ext}
```

- `kind` is `photo | video | voice`. The reveal reads it from the key to decide
  how to render the item, so it must stay in the path.
- `randomId` is a 21-character nanoid. User file names are never used.
- Keys are validated against a strict pattern (`isValidMediaKey`) before any
  storage call, which is also the path-traversal defence.

## Limits

| Kind | Types | Max |
|---|---|---|
| photo | jpeg, png, webp, avif | 10 MB |
| video | mp4, webm, mov | 100 MB (60 s guidance) |
| voice | webm, ogg, mpeg, mp4, wav | 5 MB |

Defined once in `lib/media/validate.ts` and enforced at presign, at confirm and
by the player UI.

## Upload sequence

1. `POST /api/upload/presign` with `{ wishId, kind, contentType, size }`. The
   route checks ownership, validates the type and size, and returns a presigned
   `PUT` (10 minutes) plus the key.
2. The browser `PUT`s the file to that URL with the matching `Content-Type`.
3. `POST /api/upload/confirm` with `{ key }`. The server runs `verifyUpload`; on
   failure it deletes the object and returns a typed error. Only then does the
   draft reference the key.
4. Reads: `createReadUrl` mints a presigned `GET` (15 minutes) inside
   `buildWishContent`, which only runs after the receiver has unlocked. There is
   no public URL.

A reveal page left open longer than 15 minutes shows broken media until it is
reloaded.

## Deleting

`lib/wishes/delete.ts` cascades: contributions and replies are removed, then
every `mediaKey` (wish media and contribution media) is deleted from the store.
Media failures are logged and never block the wish deletion.

## Adding a driver

Implement the four methods, return presigned URLs from `createUpload` and
`createReadUrl`, and use `checkStoredMedia()` inside `verifyUpload`. Register it
in `lib/repos/index.ts` and add the enum value in `lib/env.ts`. Nothing else in
the app needs to change.
