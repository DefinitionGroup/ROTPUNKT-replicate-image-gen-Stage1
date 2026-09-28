# DESIGN.md — Rotpunkt Visions

The visual contract for the site and the studio. It follows the Rotpunkt
Signature 3D site (`/Users/martin/DEV/RDDOT-3Dwebsite`) so both products read
as one family. Everything here is expressed as Tailwind tokens in
`app/globals.css` and constants in `lib/motion.ts`; components in
`components/design-system/` are the only place they are turned into UI.

## Principles

- **Black is the room.** Every surface is `canvas` (#000). Cards are `charcoal`
  on canvas, never lighter. There is no light theme.
- **One red.** `signature` (#E30613) marks the current thing — the active step,
  the progress line, the dot on a card. It is never a background for text blocks
  and never used twice in one view for different meanings.
- **One serif word.** Each headline carries exactly one word in Instrument
  Serif italic. Content marks it with `*asterisks*`; `Emphasis` renders it.
- **Motion says what changed.** Transforms and opacity only, on one easing.
  Height animates only in the accordion. `MotionConfig reducedMotion="user"`.

## Colour

| Token       | Hex       | Use                                            |
| ----------- | --------- | ---------------------------------------------- |
| `canvas`    | `#000000` | page and stage background                      |
| `charcoal`  | `#202020` | cards, fields, chips                           |
| `hairline`  | `#333333` | 1 px rules and borders                         |
| `ash`       | `#666666` | disabled text, placeholders                    |
| `graphite`  | `#999999` | secondary text, labels                         |
| `ink`       | `#ffffff` | primary text, primary pill                     |
| `porcelain` | `#F5F1EA` | chosen values, text on imagery                 |
| `signature` | `#E30613` | the one accent                                 |

The shadcn tokens (`background`, `card`, `border`, `muted-foreground` …) are
aliased to these values so the older wizard steps sit on the same palette.

## Type

Manrope (variable, self-hosted via `@fontsource-variable/manrope`) for
everything; Instrument Serif 400 italic for the emphasised word.

`display` → `heading-lg` → `heading` → `title` → `panel` → `card-title` →
`lead` → `body` → `nav` → `caption` → `label` (uppercase, `tracking-label`).
Numbers that change use `tnum`.

## Shape and depth

Cards `rounded-card` (10 px), pills `rounded-pill`. Depth comes from the
hairline and the `glass` utility (frosted, on imagery), not from shadows.
Media gets `media-shade` / `media-shade-deep` so text on images stays legible.

## Motion

`SIGNATURE_EASE = [0.22, 1, 0.36, 1]`. Durations: `state` 160 ms (hover,
toggles), `accordion` 240 ms, `overlay` 420 ms (step changes, sheets),
`reveal` 600 ms (content entering). `STAGGER` 60 ms between siblings,
`REVEAL_RISE` 12 px. Tailwind exposes them as `duration-state` … and
`ease-signature`.

## Surfaces

- **Marketing** (`app/(site)/[locale]/(marketing)`) — `SiteHeader` frosted
  over the hero film, sections from `components/sections/`, `SiteFooter`.
  Content comes from `lib/content` (`DEV_CONTENT=true` reads
  `content/content.md`; otherwise the Sanity adapter).
- **App** (`app/(site)/[locale]/(app)`) — `AppHeader` (solid, one back link,
  language, account), no footer. The studio, the gallery, the quality review.

## The studio

`components/studio/studio-shell.tsx` hosts the wizard flow as a page:

1. **Start** — `StudioIntro`: begin blank, or from a template card.
2. **Configure** — the rail (`StudioRail`) lists every decision with its
   chosen value and jumps back to any step; the stage shows one step at a
   time. Below `lg` the rail becomes a chip strip (`StudioStepStrip`).
3. **Result** — the stage becomes `ImageGenerator`: loading line, the image
   in a hairline frame, `Geprüft` badge when the quality gate accepted it,
   then *Neue Variante* / *Meine Bilder* / *Auswahl ändern*.

Step components in `components/wizard/` keep their own logic; they share
`StepHeader` for the question and guidance line.

## Components (design-system)

`Pill` (primary / secondary / ghost, link or button), `RoundButton`, `Label`,
`SectionIntro`, `Emphasis`, `Glass`, `GlassBadge`, `GlassSegments`, `Card`,
`MediaCard`, `DetailCard`, `Overlay`, `Reveal`, `ScrollWords`, `Tilt`,
`BrandLogo`, `MotionProvider`.
