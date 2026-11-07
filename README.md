# Wishly

Create a password-protected, interactive wish page for any occasion — alone or with friends — and share it by link. The receiver unlocks it with a password and gets an animated reveal.

Working name. Trademark search required before launch.

## Quickstart

```bash
pnpm install
cp .env.example .env.local   # optional — defaults already work locally
pnpm dev
```

Open http://localhost:3000. No AWS, Clerk, or Gemini keys are required for local development:

- Sender auth falls back to a dev bypass user (`AUTH_MODE=dev`, `WISHLY_DEV_AUTH_BYPASS=true`).
- Data is stored in `.wishly-data/` through the file repositories.
- Media uploads land in `.wishly-data/media/` through signed local URLs.
- The message idea generator returns curated local ideas when `GEMINI_API_KEY` is empty.

Switching services is env-only: `AUTH_MODE=clerk` plus Clerk keys for auth, and `DATA_ADAPTER` / `MEDIA_ADAPTER` for storage once the AWS adapters land in M5.

## Scripts

```bash
pnpm dev            # dev server
pnpm build          # production build
pnpm start          # serve the production build
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm test           # Vitest unit tests
pnpm test:e2e       # Playwright end-to-end
pnpm music:generate # regenerate bundled royalty-free ambient loops
```

The bundled music loops are synthesized by `scripts/generate-music.mjs` (no third-party audio) and regenerate automatically after install if missing.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layering, repositories, security model, adapters.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — records, DynamoDB design, access patterns, deletion.
- [`DESIGN.md`](DESIGN.md) — design tokens, typography, components, motion, accessibility.
- [`CLAUDE.md`](CLAUDE.md) — conventions, commands, definition of done.

## Status

Milestones M0–M4 are the current scope, followed by a review checkpoint.

- M0 Scaffold — Next.js, tokens, fonts, adapters, security primitives, tests, docs.
- M1 Marketing — landing, occasion pages, template gallery, SEO.
- M2 Auth + dashboard — Clerk (optional) and draft management.
- M3 Wizard — solo creation flow with autosave, AI ideas, uploads.
- M4 Publish + unlock + reveal + replies — server-side unlock, animations, e2e.

M5 (AWS adapters), M6 (group mode), M7 (extras), and M8 (polish) follow after review.

## Stack

Next.js 15 · React 19 · TypeScript strict · Tailwind CSS v4 · Framer Motion · Zod · React Hook Form · Clerk · DynamoDB/S3 (M5) · Gemini · Vitest · Playwright · pnpm.
