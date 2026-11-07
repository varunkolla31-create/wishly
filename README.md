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

Switching services is env-only: `AUTH_MODE=clerk` plus Clerk keys for auth, and `DATA_ADAPTER` / `MEDIA_ADAPTER` for storage.

## Scripts

```bash
pnpm dev            # dev server
pnpm build          # production build
pnpm start          # serve the production build
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm test           # Vitest unit tests
pnpm test:e2e       # Playwright end-to-end (includes axe accessibility checks)
pnpm music:generate # regenerate bundled royalty-free ambient loops
pnpm localstack:up  # start DynamoDB + S3 locally (requires Docker)
pnpm test:aws       # run the AWS adapter contract tests
```

The bundled music loops are synthesized by `scripts/generate-music.mjs` (no third-party audio) and regenerate automatically after install if missing.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layering, repositories, security model, adapters.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — records, DynamoDB design, access patterns, deletion.
- [`DESIGN.md`](DESIGN.md) — design tokens, typography, components, motion, accessibility.
- [`CLAUDE.md`](CLAUDE.md) — conventions, commands, definition of done.

## Status

All eight milestones are built.

- M0 Scaffold — Next.js, tokens, fonts, adapters, security primitives, tests, docs.
- M1 Marketing — landing, occasion pages, template gallery, SEO.
- M2 Auth + dashboard — Clerk (optional) and draft management.
- M3 Wizard — solo creation flow with autosave, AI ideas, uploads.
- M4 Publish + unlock + reveal + replies — server-side unlock, animations, e2e.
- M5 AWS adapters — DynamoDB single table + S3 presigned media.
- M6 Group mode — contributor links, moderation, memory wall.
- M7 Extras — QR keepsake card, music library, PWA, i18n scaffolding.
- M8 Polish — axe accessibility suite, error boundaries, deploy guide.

## Deployment

### Environment matrix

| Goal | Env |
|---|---|
| Local, no keys | `AUTH_MODE=dev`, `DATA_ADAPTER=file`, `MEDIA_ADAPTER=file` |
| Local against real AWS | same adapters as production, plus the AWS block below |
| Production | `AUTH_MODE=clerk`, `DATA_ADAPTER=dynamodb`, `MEDIA_ADAPTER=s3` |

Production also requires that `AUTH_SECRET` and `WISH_UNLOCK_SECRET` are **not** the
dev default (`dev-only-change-me`); `lib/env.ts` refuses to boot otherwise.

```
NEXT_PUBLIC_APP_URL=https://your-domain
AUTH_MODE=clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

DATA_ADAPTER=dynamodb
MEDIA_ADAPTER=s3
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DYNAMODB_TABLE=
S3_BUCKET=

GEMINI_API_KEY=            # optional; curated fallback otherwise
GEMINI_MODEL=gemini-2.0-flash
AUTH_SECRET=               # 32+ random chars
WISH_UNLOCK_SECRET=        # 32+ random chars, different from AUTH_SECRET
FEATURE_BILLING=false
FEATURE_GROUP_MODE=true
```

### Vercel

1. Import the repo, set the env vars above, deploy.
2. Route handlers that hash passwords run on the Node runtime (already declared per route).
3. No middleware is used, so no Clerk middleware configuration is needed.

### AWS Amplify

Same environment variables. Amplify's Node 20+ runtime is required for `@node-rs/argon2`.

### DynamoDB + S3 provisioning

- One on-demand table named by `DYNAMODB_TABLE`, with:
  - `PK` (partition) and `SK` (sort) — string
  - `GSI1` (`GSI1PK`, `GSI1SK`) — owner dashboard list
  - `GSI2` (`GSI2PK`, `GSI2SK`) — reply inbox
  - `GSI3` (`GSI3PK`, `GSI3SK`) — contributor token lookup
  Full key layout in [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md).
- One private S3 bucket named by `S3_BUCKET`, public access blocked, CORS allowing
  `PUT` and `GET` from the app origin.
- Least-privilege IAM: `dynamodb:GetItem/PutItem/UpdateItem/DeleteItem/Query` on the
  table and its indexes, plus `s3:PutObject/GetObject/DeleteObject` on
  `arn:aws:s3:::<bucket>/wishes/*`.

### Local AWS loop (LocalStack)

```bash
pnpm localstack:up     # docker compose: DynamoDB on 4566, S3 on 4566
pnpm localstack:init   # create the table, GSIs and bucket
pnpm test:aws          # adapter contract tests against LocalStack
```

Set `AWS_ENDPOINT_URL=http://localhost:4566` for these runs. The tests skip
cleanly when that endpoint is unreachable, so `pnpm test` never needs Docker.

### Verified vs unverified

| Area | Verified on this machine |
|---|---|
| File adapter, local media, whole app flow | Yes — unit + Playwright + production build |
| Marketing, dashboard, wizard, group mode, reveal | Yes — 27 Playwright specs |
| Accessibility (WCAG A/AA via axe) | Yes — public pages, dashboard, keyboard pass |
| DynamoDB + S3 adapters | **No** — written and covered by contract tests, but this machine has no Docker/Java, so LocalStack could not run |
| Real AWS deployment | No — no credentials used |

## Stack

Next.js 15 · React 19 · TypeScript strict · Tailwind CSS v4 · Framer Motion · Zod · React Hook Form · Clerk · DynamoDB/S3 · Gemini · Vitest · Playwright · pnpm.
