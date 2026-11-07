# Wishly — conventions

Next.js 15 App Router · React 19 · TypeScript strict · Tailwind v4 tokens · Framer Motion · Zod · React Hook Form · Vitest · Playwright · pnpm.

## Commands

```bash
pnpm dev            # dev server, works with no external keys
pnpm build          # production build
pnpm start          # serve the build
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint .
pnpm test           # vitest unit tests
pnpm test:watch     # vitest in watch mode
pnpm test:e2e       # playwright (starts the dev server)
pnpm test:db        # Postgres/Neon repository contract (needs DATABASE_URL)
pnpm test:aws       # AWS contract test (needs AWS_TEST_WRITE=1 and credentials)
pnpm aws:check      # read-only DynamoDB/S3 connection check
pnpm db:push        # apply db/schema.sql to the configured database
pnpm music:generate # regenerate bundled ambient loops
```

No keys are required locally: `.env.example` documents defaults, the sender is a dev bypass user, media is stored on disk, and the idea generator falls back to a curated bank.

## Layout

- `app/(marketing)` public pages, `app/(app)` authenticated sender area, `app/w/[id]` receiver area.
- `app/api/**` route handlers — the only place HTTP is parsed.
- `components/ui` primitives, `components/marketing`, `components/wizard`, `components/reveal`, `components/dashboard`.
- `lib/catalog` single source of truth for occasions, templates, music.
- `lib/repos` interfaces plus adapters (file, DynamoDB, Postgres) and the S3 media store; `STORAGE_DRIVER=aws` selects DynamoDB + S3.
- `lib/security` hashing, tokens, rate limits; `lib/ai` Gemini and fallback; `lib/music` YouTube provider.
- `docs/` architecture and data model, `DESIGN.md` tokens, `CLAUDE.md` this file.

## Rules

- TypeScript strict, `noUncheckedIndexedAccess` on. No `any`, no non-null assertions in shipped code, no TODO placeholders in shipped paths.
- Validate every boundary with Zod: request bodies, upload metadata, env, catalog data (tests).
- UI → route handlers → repos/security. Components never import adapters or secrets.
- Anything touching secrets, filesystem, or hashing imports `server-only`; client-shareable env lives in `lib/env-public.ts`.
- Every sender route calls `requireSender()` and checks `wish.ownerId === sender.userId`. Return 404 for foreign ids.
- Before unlock, receiver APIs return only `receiverName`, `hint`, `templateId`, `category`, `tone`, `lockState`, `unlockAt`.
- Never log passwords, hashes, tokens, or signed URLs. Never store plaintext passwords.
- Cookie: `httpOnly`, `SameSite=Lax`, `Secure` in production, scoped by wish, 2h TTL, bound to `passwordVersion`.
- All design values come from tokens in `app/globals.css`; no raw hex in components.
- New occasions go only in `lib/catalog/occasions.ts`; new templates only in `lib/catalog/templates.ts`.
- Unfinished surface sits behind `FEATURE_*` flags; ship no dead UI.
- Motion respects `prefers-reduced-motion`; `calm` categories get no confetti.
- Commits are conventional and scoped to one milestone, e.g. `feat(m4): publish, unlock, reveal, replies`.

## Definition of done (every milestone)

- `pnpm typecheck`, `pnpm lint`, `pnpm test` pass; `pnpm test:e2e` where applicable.
- Dev server boots with no console errors.
- Responsive at 390px and 1440px.
- Keyboard accessible: every action reachable, visible focus.
- Matches `DESIGN.md` tokens and the tone rules.
- Committed with a clear message, followed by a summary of what changed and what is next.
