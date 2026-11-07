# Wishly — Design system

Concept: warm like Airbnb, immersive like Spotify, calm and premium like Oura. Inspiration only — no copied logos, names, or proprietary fonts.

- **Sender area** (landing, occasions, dashboard, wizard): light, photo-first, generous whitespace.
- **Receiver area** (lock, reveal): dark, cinematic, one clear action at a time.

## Tokens

Defined as CSS variables in `app/globals.css` and mapped into Tailwind v4 with `@theme inline`. Components use token utilities (`bg-canvas`, `text-ink-muted`, `border-hairline`, `text-coral`) — never raw hex.

### Surface

| Token | Light | Dark |
|---|---|---|
| `--canvas` | `#FFFFFF` | `#121212` |
| `--sand` | `#F7F1E8` | `#181818` |
| `--cream` | `#F5F0E6` | `#1F1F1F` |
| `--surface` | `#FFFFFF` | `#181818` |
| `--surface-2` | `#F7F1E8` | `#1F1F1F` |
| `--hover` | `#F5F0E6` | `#282828` |
| `--ink` | `#1C1B1A` | `#FFFFFF` |
| `--ink-muted` | `#6B6762` | `#B3B3B3` |
| `--hairline` | `#EBE5DA` | `#262626` |

### Accent and semantics

| Token | Value | Use |
|---|---|---|
| `--coral` | `#FF385C` | **only** primary action color |
| `--coral-hover` | `#E31C5F` | primary hover/pressed |
| `--gold` | `#D6C283` | surprise moments only: unlock ring, reveal glow, confetti accent |
| `--success` | `#1F9D55` | confirmations |
| `--error` | `#F3727F` | errors, wrong password |
| `--warning` | `#FFA42B` | caution |

Coral and gold are never used as decorative fills for large areas. Remembrance and Get Well categories never use confetti or loud color.

## Typography

- **Instrument Serif italic** — emotional titles, 48–72px, tight leading (`leading-[1.05]`).
- **Inter** — all UI and body copy. Minimum 16px body on mobile.
- **Overline** — Inter 12px / 600 / uppercase / `tracking-[0.12em]` / muted.

Scale: 12 · 14 · 16 · 20 · 24 · 32 · 48 · 64 · 72.

## Shape and spacing

- Spacing unit: 8px.
- Buttons, inputs, chips: pill (`rounded-full`).
- Cards: 24px (`rounded-card`).
- Media tiles: 16px (`rounded-media`).
- Play buttons and avatars: circles.

## Elevation

- Light: `shadow-soft` = `0 8px 24px rgba(28,27,26,0.08)`.
- Dark: no heavy shadows. Depth by surface steps (`surface` → `surface-2` → `hover`).
- Featured / unlock: `shadow-glow` = `0 0 48px rgba(214,194,131,0.25)`.

## Motion

- UI transitions: 200–300ms, ease-out (`--ease-out-soft`).
- Reveal sequence: 800–1200ms, orchestrated; wrap → greeting → typed message → gallery.
- Typed message respects a skip control.
- Everything gates on `prefers-reduced-motion`: swap movement for instant crossfades. Global CSS fallback is in `globals.css`; components check `useReducedMotion` before spatial animation.
- Tone rule: `calm` categories (Get Well, Remembrance) use slow fades, no confetti, no shake.

## Components

| Component | Spec |
|---|---|
| Category chip | Pill, hairline border, 14px label, optional icon; selected = ink fill with canvas text. |
| Template card | 4:5 media tile, name + tone caption beneath, 2px hover lift, focus ring. |
| Wizard stepper | Numbered dots with connectors; current = coral, complete = ink with check; labels hidden under 640px (aria-label retained). |
| Media tile | 16px radius, object-cover, centered circular play button with 32% dark scrim for video/voice, duration chip bottom-right. |
| Unlock ring | SVG stroke ring with gold glow; progress fills as the password is typed; shake on error (disabled for reduced motion); countdown text centered when `unlockAt` is set. |
| Mini player | Spotify-style bottom bar: title, play/pause, progress, 56px tall, safe-area inset padding. |
| Password input | Reveal toggle, hint line, generator, 4-segment strength meter (error → warning → success progression). |
| Wish card | 4:5 cover, status chip, serif title, meta row (views, replies), actions menu. |
| Toasts | `sonner`, top-center, accessible live region. |
| Skeletons | Shimmer blocks matching final layout; no layout shift. |
| Empty states | Serif headline, one sentence, one CTA. No illustration dependency. |

## Accessibility

- WCAG AA contrast for text and controls (`ink-muted` on `canvas` verified).
- Visible `:focus-visible` ring: 2px coral, 2px offset.
- Minimum 48px touch targets.
- Full keyboard paths for unlock, wizard steps, gallery, player, dialogs.
- Dialogs trap focus and restore it on close.
- Icon buttons carry `aria-label`.
- Unlock errors and copy confirmations announce through `role="status"` / toasts.
- Images need meaningful `alt` when they are content; decorative media uses empty alt.

## Voice

Warm, short, human. Written like a friend, not a brand.

- "Someone made something for you."
- "Almost there — try that password again."
- "Saved."
- "Send a reply"

Avoid exclamation stacks, corporate filler, and pressure language.
