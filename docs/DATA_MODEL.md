# Wishly — Data model

Local development uses JSON files under `WISHLY_DATA_DIR` (default `.wishly-data/`):

```
.wishly-data/
  wishes.json          # one array of Wish records
  contributions.json   # one array of Contribution records
  replies.json         # one array of Reply records
  media/
    wishes/<wishId>/<kind>/<objectId>.<ext>
```

Writes are serialized per file and atomic (temp file + rename). Reads never see a partial write.

Production uses a single DynamoDB table designed for the same records (M5). Shapes below are the source of truth for both adapters.

## Wishes — PK `wishId`

| Field | Type | Notes |
|---|---|---|
| `wishId` | string | `nanoid` 21 chars, URL-safe; this is the link id |
| `ownerId` | string | Clerk user id (or `dev_sender`) |
| `mode` | `"solo" \| "group"` | group unlocks contributor links (M6) |
| `category` | string | occasion slug from `lib/catalog/occasions.ts` |
| `templateId` | string | from `lib/catalog/templates.ts` |
| `receiverName` | string | shown on the lock screen |
| `title` | string | sender-facing title / reveal headline |
| `message` | string | private until unlock |
| `mediaKeys` | string[] | `wishes/<wishId>/<kind>/<object>.<ext>` |
| `musicId` | string \| null | track id from `lib/catalog/music.ts` |
| `passwordHash` | string \| null | argon2id PHC string; never logged or serialized to clients |
| `passwordHint` | string \| null | public before unlock (opt-in) |
| `passwordVersion` | number | bump on publish/password change to revoke cookies |
| `unlockAt` | ISO string \| null | optional scheduled unlock; countdown in the ring |
| `status` | `draft \| collecting \| published \| locked` | |
| `contributorToken` | string \| null | unguessable group link token (M6) |
| `contributorTokenRevokedAt` | ISO string \| null | revocation marker |
| `views` | number | aggregate counter only |
| `createdAt` / `updatedAt` | ISO string | `updatedAt` drives dashboard ordering; views do not touch it |

## Contributions — PK `wishId`, SK `contributionId`

| Field | Type |
|---|---|
| `contributorName` | string (no account) |
| `type` | `photo \| video \| voice \| text` |
| `mediaKey` | string \| null |
| `text` | string \| null |
| `status` | `pending \| approved \| hidden` |
| `order` | number (sender-controlled) |
| `createdAt` | ISO string |

## Replies — PK `wishId`, SK `replyId`

| Field | Type |
|---|---|
| `ownerId` | string — denormalized so the sender inbox is one query |
| `message` | string |
| `emoji` | string |
| `createdAt` | ISO string |

## Views

No table. `ADD views :one` on the wish item. No IP address, user agent, or per-visitor record is stored.

## DynamoDB design

Three tables, on-demand capacity. See [`AWS_SETUP.md`](AWS_SETUP.md) for the
console steps, IAM policy and bucket CORS.

**Wishes** — partition key `wishId` (S)
- `OwnerIndex`: `ownerId` (HASH) + `updatedAt` (RANGE) → dashboard list, newest first
- `ContributorTokenIndex`: `contributorToken` (HASH) → group invite lookup. Sparse:
  items without a live token are absent from the index, so a revoked link 404s.

**Contributions** — partition key `wishId` (S), sort key `contributionId` (S)
- The wall is a single `Query` on `wishId`, filtered by `status` and sorted by `order`.

**Replies** — partition key `wishId` (S), sort key `replyId` (S)
- `OwnerIndex`: `ownerId` (HASH) + `createdAt` (RANGE) → the sender's inbox.

The adapters call `DescribeTable` once per process and use whatever key names the
table actually has. A missing GSI is not fatal: the lookup falls back to `Scan`
and logs one warning. `Contributions` and `Replies` **do** require a sort key,
because they hold many records per wish.

Projection rules:

- Dashboard/list queries **never** carry `passwordHash` (the adapter blanks it).
- Public meta uses an explicit projection of the allowed lock-screen fields.
- Media keys are never returned before unlock.

## Access patterns

| Use | Operation |
|---|---|
| Dashboard list | `OwnerIndex` query by owner |
| Open wish (sender) | `GetItem` by `wishId` with ownership check |
| Public lock screen | `GetItem`, strict projection |
| Unlock | `GetItem` including `passwordHash` (server only) |
| Reveal content | `GetItem` + presigned media reads |
| Contributor wall | `Query` contributions by `wishId`, approved, ordered |
| Contributor link | `ContributorTokenIndex`; a miss means revoked or never existed |
| Reply inbox | `Replies` `OwnerIndex` query by owner |
| Views | `UpdateItem` `ADD views :n` (never touches `updatedAt`) |

## Deletion

"Delete my data" removes the wish item and cascades to contributions, replies, and every media object referenced by `mediaKeys` / contribution `mediaKey`. The local adapter implements the same cascade (`deleteByWish`, `MediaStore.delete`). Nothing is soft-deleted.
