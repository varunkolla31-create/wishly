# Music: the YouTube picker

The sender's Music section is a YouTube **Top 10 + search + paste a link** picker.
Only metadata is stored; no audio or video is downloaded, cached, or re-hosted.

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `YOUTUBE_API_KEY` | empty | Server-only Data API key. Never sent to the browser. |
| `YOUTUBE_REGION_CODE` | `US` | ISO 3166-1 alpha-2 region for the Top 10 chart. Wishly uses `IN`. |
| `YOUTUBE_TOP_CACHE_HOURS` | `6` | How long the Top 10 chart is cached. |
| `YOUTUBE_DAILY_SEARCH_LIMIT` | `80` | Daily `search.list` calls allowed (each costs ~100 quota units). |

Set the values in `.env.local` locally and in the Vercel project environment.
Never commit the key. If the key was ever pasted into chat, rotate it.

## API

All routes are in `app/api/music/`:

- `GET /api/music/top` — `videos.list` (`chart=mostPopular`, `videoCategoryId=10`,
  `regionCode`, `maxResults=10`), filters `status.embeddable`, asks for up to 50
  if fewer than 10 remain. Fallback order: **fresh → last cached good list →
  curated Wishly picks**. Cached as `top:{region}`.
- `GET /api/music/search?q=` — normalized query (3–100 chars), 400 ms client
  debounce, `search.list` then `videos.list` for duration/embeddable. Cached as
  `search:{normalized}` for 24 h. Cache hits do not spend quota.
- `POST /api/music/resolve` — paste a link; oEmbed, enriched with duration and
  embeddability when a key exists. Works without a key for pasting.

Responses contain only `videoId`, `title`, `channel`, `thumbnailUrl`,
`durationSeconds`. The browser never sees provider errors, quota details or the
key. Rate limits are per user (when signed in) and per IP.

## Quota costs

- `search.list`: 100 units per call.
- `videos.list`: ~1 unit per call (Top 10 and search enrichment).
- Default project quota: 10,000 units/day.
- `YOUTUBE_DAILY_SEARCH_LIMIT` counts **search calls**, not units; cache hits do
  not count. Top 10 and paste keep working when search is busy.

## Data

`wish.music` is one object:

```json
{
  "provider": "youtube",
  "videoId": "dQw4w9WgXcQ",
  "title": "…",
  "channel": "…",
  "thumbnailUrl": "https://i.ytimg.com/…",
  "sourceUrl": "https://www.youtube.com/watch?v=…",
  "durationSeconds": 213,
  "startAtSeconds": 30
}
```

Selecting a new song replaces it completely, including the start time. Removing
sets it to `null`. `musicId` remains only for already-published bundled tracks;
never both. YouTube music is stored in the existing `wishes.music` JSONB column.

## UI

- Default view: **Top 10 on YouTube** with rank, thumbnail, title, channel,
  duration, a visible official IFrame preview and Select.
- Typing ≥3 characters clears the old list, shows skeletons, debounces 400 ms,
  and uses `AbortController` + a request id so stale responses cannot win.
  Clearing the box returns to the Top 10.
- Exactly one song. “Now selected” shows Change / Remove and the `mm:ss` start.
- Paste a link is always available, including when search is quota-busy.
- Only one visible preview player exists; it is the official IFrame player
  (`youtube-nocookie.com`), never hidden or backgrounded.
- The receiver shows a visible YouTube card with title/channel and Watch on
  YouTube; voice/video playback pauses it via the duck event.

## Compliance notes (checked Nov 2026)

- Search results are shown unmodified and attributed to YouTube; fallback
  content is labelled “Wishly picks” and never mixed into search results.
- The IFrame player must be visible and ≥200×200 px; we use 16:9 with controls
  and autoplay off.
- API metadata is cached for 24 h (search) / 6 h (top), under YouTube’s 30-day
  caching limit. No audiovisual content is stored.
- Embeddable-only filtering, safe search, and a `more` request for short charts.
- Made-for-kids status is collected when available and the player never autoplays
  by default.

## Testing

- Unit: `tests/unit/music-top10.test.ts` and `tests/unit/music-provider.test.ts`
  mock all YouTube fetches; no real API is called.
- E2E: `e2e/music-picker.spec.ts` mocks `/api/music/*` and the IFrame script.
- Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`,
  `pnpm test:db`, `pnpm build`.
