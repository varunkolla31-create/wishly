---
name: canva-video-templates
description: Maintain and extend Wishly's in-app Canva video template gallery, engagement ranking and canvas video studio. Use when adding or refreshing video templates, changing categories/filters, working on likes/shares/uses stats or trending sort, or editing the /studio video renderer.
---

# Canva video templates in Wishly

Implement occasion **video templates** entirely inside the app. Consumers browse,
preview, customise and render a video without ever being sent to Canva. The
original source spec is in `references/canva-spec.md`; treat it as background,
not as a mandate to add the Canva REST API.

## Ground rules

- **No Canva API and no outbound Canva links in the UI.** The app never hands the
  consumer off to canva.com. Mode B in the spec (OAuth/autofill/export) is out of
  scope unless the user explicitly asks for it.
- **Host previews only.** Preview images are Canva's; they are downloaded into
  `public/canva-video-templates/<id>.jpg` for browsing. Never redistribute Canva
  videos or claim the templates as ours.
- **Render in the browser.** The studio uses Canvas + MediaRecorder. Nothing is
  uploaded to a server.
- **Keep counts anonymous.** Likes/shares/uses are per-template aggregates, not
  per-user records.

## File map

| Concern | Path |
|---|---|
| Template catalog (id, title, category, aspect, tier, local preview, source link) | `lib/catalog/canva-videos.ts` |
| Hosted preview images | `public/canva-video-templates/` |
| Gallery UI + filters + stats + lightbox | `components/marketing/canva-video-gallery.tsx` |
| Card | `components/marketing/canva-video-card.tsx` |
| Gallery mount point | `app/(marketing)/templates/page.tsx` (`#video-templates`) |
| In-app video maker | `app/(marketing)/studio/[id]/page.tsx` + `components/studio/video-studio.tsx` |
| Ranking formula + types | `lib/catalog/ranking.ts` |
| Stats persistence | `lib/repos/video-template-stats.ts`, `db/migrations/003_video_template_stats.sql` |
| Stats API | `app/api/video-templates/stats/route.ts`, `app/api/video-templates/[id]/[action]/route.ts` |

## Refresh the catalog from Canva

Canva serves listings to `curl` but often returns a bot page to plain `fetch`.
Use `curl.exe` with a desktop user agent.

1. Fetch each category listing, e.g.
   `https://www.canva.com/video-editor/templates/birthday/?continuation=350`.
   Working categories are recorded in the current catalog; verify a new one with
   `curl -s -o NUL -w "%{http_code} %{size_download}"` before trusting it.
2. Parse template cards from the HTML:
   - `href="/templates/<ID>-<slug>/"` gives ID and slug.
   - `aria-label="Preview pro|free <title> template"` gives title and tier.
   - `padding-bottom:56.25%` → `16:9`; `177.78%` → `9:16`; `100%` → `1:1`.
   - Preview URLs look like
     `https://template.canva.com/<ID>/<page>/<index>/<width>w-<hash>.jpg`.
     Prefer 400w; if absent, fetch the template detail page and strip the
     `?X-Amz-...` query from the URL it serves (unsigned URLs return 200).
3. Download one image per template to
   `public/canva-video-templates/<ID>.jpg` and set `thumb` to
   `/canva-video-templates/<ID>.jpg`.
4. Decode HTML entities in titles (`&amp;`, `&#39;`, …).
5. Regenerate `lib/catalog/canva-videos.ts` with
   `CANVA_VIDEO_TEMPLATES`, `CANVA_VIDEO_CATEGORIES` and
   `getCanvaVideoTemplate(id)`. Keep category keys stable; they are used by
   filters, tests and analytics.
6. Run the validation suite (below). The test asserts every referenced preview
   file exists on disk.

## Ranking

`trending_score = likes * 2 + shares * 3 + uses * 1` (see `lib/catalog/ranking.ts`).

- `GET /api/video-templates/stats` → `{ ok, data: { stats: Record<id, {likes, shares, uses, trending}> } }`
- `POST /api/video-templates/<id>/like|share|use` → returns the updated stats.

The repository upserts rows lazily, so adding a template needs no seed pass. With
`DB_DRIVER=postgres` it uses `video_template_stats`; other drivers fall back to an
in-process map (single instance, resets on deploy). Apply schema changes with
`pnpm db:migrate`.

The gallery fetches stats on mount, sorts by trending when **Popular** is on, and
optimistically updates likes/shares. A browser can like a template once
(`localStorage: wishly-liked-templates`). The studio posts `use` once per mount
when a video is rendered.

## Studio

- Canvas dimensions: `16:9` 1280×720, `9:16` 720×1280, `1:1` 900×900.
- On mount, load the template preview, sample it, and derive a palette
  (`from`, `to`, `accent`) with a `#2a1f2d`/`#8c2f4a` fallback.
- Render six seconds at 30fps: gradient background, moving blobs, photo
  (rounded, cover-fitted, gentle zoom), text panel, progress bar.
- Record with `canvas.captureStream(30)` + `MediaRecorder`; prefer
  `video/mp4;codecs=avc1`, then `video/webm` variants. Stop after ~6.2s and expose
  a blob download.
- Keep the copy honest: everything renders locally; the video is downloaded to
  the consumer's device.

## Validate

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm db:migrate   # after adding a migration
```

Then push to `main`; Vercel deploys automatically. Verify
`/templates#video-templates` and one `/studio/<id>` page in a browser, including
that the studio produces a downloadable blob.
