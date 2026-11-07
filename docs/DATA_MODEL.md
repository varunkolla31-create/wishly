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

## DynamoDB design (M5)

Single table, on-demand capacity.

- `PK = WISH#<wishId>`, `SK = META` → wish item
- `PK = WISH#<wishId>`, `SK = CONTRIB#<contributionId>` → contribution
- `PK = WISH#<wishId>`, `SK = REPLY#<replyId>` → reply
- `GSI1`: `GSI1PK = OWNER#<ownerId>`, `GSI1SK = UPDATED#<updatedAt>` → dashboard list
- `GSI2`: `GSI2PK = OWNER#<ownerId>`, `GSI2SK = REPLY#<createdAt>` → reply inbox
- `GSI3`: `GSI3PK = CONTRIB_TOKEN#<contributorToken>`, `GSI3SK = META` → contributor link lookup.
  Only written while the token is active; revoking removes the attribute so the GSI entry disappears.
- Contributions wall: `Query PK = WISH#<wishId>` with `begins_with(SK, "CONTRIB#")` then filter status/order, or store approved contributions under `SK = CONTRIB#APPROVED#<order>#<id>` for direct ordered reads.

Projection rules:

- Dashboard/list queries **never** project `passwordHash`.
- Public meta uses an explicit projection of the allowed lock-screen fields.
- Media keys are never returned before unlock.

## Access patterns

| Use | Operation |
|---|---|
| Dashboard list | GSI1 query by owner, newest first |
| Open wish (sender) | GetItem `WISH#<id>` with ownership check |
| Public lock screen | GetItem with strict projection |
| Unlock | GetItem including `passwordHash` (server only) |
| Reveal content | GetItem + presigned media reads |
| Contributor wall | Query contributions, approved, ordered |
| Contributor link | GSI3 by token; a miss means revoked or never existed |
| Reply inbox | GSI2 query by owner |

## Deletion

"Delete my data" removes the wish item and cascades to contributions, replies, and every media object referenced by `mediaKeys` / contribution `mediaKey`. The local adapter implements the same cascade (`deleteByWish`, `MediaStore.delete`). Nothing is soft-deleted.
