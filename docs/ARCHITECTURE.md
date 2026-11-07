# Wishly — Architecture

## Shape

Next.js 15 (App Router) with two audiences in one app:

- **Sender area** — light, photo-first: `/`, `/occasions/*`, `/templates`, `/pricing`, `/dashboard/*`. Authenticated with Clerk.
- **Receiver area** — dark, immersive: `/w/[id]` (lock) and `/w/[id]/reveal`. Never authenticates with an account; the only credential is the wish password.

Server-rendered metadata is why Next.js is the right host: links pasted into WhatsApp, Instagram, Telegram and Slack still render a teaser card, while the private content stays behind the unlock.

```
Browser
  │
  ├── React Server Components / client components (app/, components/)
  │
  ├── Route handlers (app/api/**)  ── Zod validation at the boundary
  │        │
  │        ├── lib/repos/*        ── WishRepo, ContributionRepo, ReplyRepo, MediaStore
  │        ├── lib/security/*     ── argon2id hashing, unlock JWT, rate limiting, media tokens
  │        ├── lib/ai/*           ── Gemini or curated fallback
  │        └── lib/catalog/*      ── occasions, templates, music (single source of truth)
  │
  └── Adapters (file now; DynamoDB/S3 in M5) selected by DATA_ADAPTER / MEDIA_ADAPTER
```

Rules that keep it honest:

- UI never imports an adapter. Route handlers resolve repos through `lib/repos/index.ts`.
- Every module that touches secrets, the filesystem, or hashing imports `server-only`.
- Client components receive only what a route handler explicitly serialized.

## Repository pattern

`lib/repos/types.ts` declares behavior; `lib/repos/file/*` implements it locally; M5 adds DynamoDB/S3 without changing call sites.

```ts
interface WishRepo {
  create(input: NewWish): Promise<Wish>;
  getById(wishId: string): Promise<Wish | null>;
  listByOwner(ownerId: string): Promise<Wish[]>;
  update(wishId: string, patch: WishPatch): Promise<Wish | null>;
  delete(wishId: string): Promise<boolean>;
  incrementViews(wishId: string): Promise<void>;
}

interface ContributionRepo { create, getById, listByWish, updateStatus, reorder, delete, deleteByWish }
interface ReplyRepo { create, listByWish, listByOwner, deleteByWish }

interface MediaStore {
  createUpload(input: { wishId; kind; contentType; size }): Promise<UploadTarget>;
  createReadUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}
```

The local file adapter uses one JSON file per collection under `WISHLY_DATA_DIR` with **serialized, atomic writes** (write temp, rename). All writes for a file queue behind the same `JsonCollection` instance, which is cached by absolute path.

## Authentication

| Mode | Behavior |
|---|---|
| `AUTH_MODE=dev` + `WISHLY_DEV_AUTH_BYPASS=true` | `getSender()` returns a fixed demo sender. Dashboard and API work with no Clerk keys. |
| `AUTH_MODE=dev` + bypass off | No sender; sender routes return 401. |
| `AUTH_MODE=clerk` | `getSender()` reads the Clerk session and primary email. `ClerkProvider` mounts only when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` exists. |

There is intentionally no Clerk middleware: middleware cannot boot without keys, and guards in the `(app)` layout plus each route handler are straightforward to test. Ownership is checked per request (`wish.ownerId === sender.userId`), and foreign ids return 404 rather than 403 so ids stay unenumerable.

## Receiver security model

Only one endpoint is readable before unlock:

`GET /api/w/:id/meta` returns exactly:

```ts
{ id, receiverName, hint, templateId, category, tone, lockState, unlockAt }
```

No message text, media keys/URLs, contribution text, reply text, or view counts.

`POST /api/w/:id/unlock`:

1. Rate-limit check keyed by `ip:wishId` (5 failures → 60s cooldown, doubling to 15 min).
2. Argon2id verify. A missing wish verifies against a dummy hash so timing does not reveal existence.
3. Success: sign a 2-hour HS256 JWT (`sub = wishId`, `v = passwordVersion`) and set it as `httpOnly`, `SameSite=Lax`, `Secure` in production, cookie name `wishly_unlock_<wishId>`. Clear the attempt ledger.
4. Failure: generic error shape; never reveal whether the wish exists or whether the password was close.

`GET /api/w/:id/content` requires a valid unlock cookie, then returns content plus freshly signed short-lived media read URLs. Bumping `passwordVersion` invalidates every outstanding cookie.

`/w/*` responses set `X-Robots-Tag: noindex, nofollow`, page metadata is `noindex`, and Open Graph tags are generic — never private.

## Media

Upload flow:

1. Client calls `POST /api/upload/presign` with `{ wishId, kind, contentType, size }`.
2. Server verifies ownership, runs `validateUpload` (allowlisted MIME + caps: photo 10MB, video 100MB, voice 5MB), generates a random key `wishes/<wishId>/<kind>/<nanoid>.<ext>`.
3. `MediaStore.createUpload` returns a presigned PUT target. The file adapter points at `PUT /api/uploads/<key>?token=…`; the S3 adapter (M5) will return a real presigned S3 URL with fixed content type.
4. Reads go through `GET /api/media/<key>?token=…` locally (supports HTTP Range for video) or a short-lived presigned S3 GET in M5.

Keys encode their kind in the path, so rendering code derives image/video/audio without extra fields. Tokens are HMAC-signed, action-scoped (`put` vs `get`), and expiring. Raw keys are validated against a strict pattern and resolved under the media root, blocking traversal.

## Environment and adapters

`lib/env.ts` validates with Zod on every read and fails with a readable message. Defaults make the app run keyless. In `NODE_ENV=production` it refuses the dev secrets and requires Clerk credentials when `AUTH_MODE=clerk`.

Client-shareable values live in `lib/env-public.ts` (`NEXT_PUBLIC_APP_URL`) only.

Feature flags (`FEATURE_BILLING`, `FEATURE_GROUP_MODE`) are server-read and passed down as booleans. Unfinished surface is not rendered.

## Testing

- **Vitest** for security primitives, rate limiting, JSON store concurrency, repository behavior, upload validation, catalog integrity.
- **Playwright** for the end-to-end create → publish → unlock → reveal → reply flow (M4).
- Typecheck and lint gate every milestone.

## Deployment

Vercel or AWS Amplify. Route handlers that hash passwords must run on the Node runtime. The file adapters are for local development only; production sets `DATA_ADAPTER=dynamodb` and `MEDIA_ADAPTER=s3` after M5.
