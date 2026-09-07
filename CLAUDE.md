# CLAUDE.md — RDDOT-dfn-AI-IMAGEGEN

## Project Overview
AI kitchen image generation app built with Next.js 15 (App Router). A marketing site (content from `content/content.md` in dev, Sanity CMS otherwise) plus the studio at `/studio`: a step-by-step configurator that builds prompts, calls Replicate for generation/upscaling, validates results (quality gate), stores assets in MinIO, and records metadata in Supabase. Auth via Clerk, i18n via `next-intl`. Design contract in `DESIGN.md`, product schema in `PRODUCT.md`.

## Tech Stack
- **Framework**: Next.js 15, React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (`@theme inline` tokens in `app/globals.css`), dark-only palette (canvas/charcoal/hairline/graphite/ash/ink/porcelain/signature), Manrope + Instrument Serif self-hosted via `@fontsource`
- **Animation**: `motion/react` (framer-motion), Lottie
- **CMS**: Sanity v4 + Studio at `/studio`, Cloudinary plugin, document internationalization
- **Auth**: Clerk (`@clerk/nextjs`)
- **Database**: Supabase (tables: `images`, `users`)
- **Storage**: MinIO (bucket: `vision-images`)
- **AI**: Replicate API for image generation + upscaling
- **UI**: shadcn/ui + Radix UI primitives
- **State**: nanostores (`@nanostores/react`, `@nanostores/persistent`)
- **Package Manager**: pnpm (>=10)

## Commands
```bash
pnpm install      # install deps
pnpm dev          # dev server (Turbopack)
DEV_CONTENT=true pnpm dev   # marketing content from content/content.md instead of Sanity
pnpm build        # production build
pnpm lint         # eslint
pnpm fix          # eslint --fix
```

## Project Structure
```
app/
  (site)/[locale]/layout.tsx              # Providers only
  (site)/[locale]/(marketing)/page.tsx    # Home (sections from lib/content)
  (site)/[locale]/(marketing)/[slug]/     # About + legal pages
  (site)/[locale]/(app)/studio/           # The configurator (StudioShell)
  (site)/[locale]/(app)/my-images/        # Auth-protected gallery
  (site)/[locale]/(app)/quality-gate/     # Admin review of validator verdicts
  (studio)/studio/[[...tool]]/            # Sanity Studio (CMS, not the configurator)
  api/replicate/route.ts                  # Start a generation set
  api/replicate/status/route.ts           # Poll, validate, persist
  api/replicate/upscale/route.ts          # Upscale endpoint
  api/clerk-user-webhook/route.ts         # Clerk → Supabase user sync
  store/                                  # nanostores (wizardStore, prompt, runtimeConfig)
components/
  design-system/                    # Pill, Label, Emphasis, Glass, Card, Overlay, Reveal …
  site/                             # SiteHeader, SiteFooter, AppHeader, LanguageToggle
  sections/                         # Homepage + about/legal sections
  studio/                           # StudioShell, StudioRail, StudioIntro
  wizard/                           # Step components, promptBuilder, ImageGenerator
  ui/                               # shadcn primitives
content/content.md                  # Dev content (## de / ## en yaml blocks)
lib/content/                        # Content model, md loader, Sanity adapter
lib/motion.ts                       # Motion contract (easing, durations)
sanity/
  schemaTypes/                      # CMS schema types
  lib/queries.ts                    # GROQ queries
  structure.ts                      # Studio desk structure
i18n/                               # next-intl config
messages/                           # Locale JSON (de, en)
lib/                                # Supabase helpers, MinIO client, server actions
public/                             # Fonts (Raleway), assets, lottie
```

## Path Aliases
- `@/*` → repo root
- `@/store/*` → `app/store/*`

## Key Conventions
- **Locales**: `de` (German), `en` (English) — prefix always shown in URL
- **Fonts**: Raleway (multiple weights, `public/fonts/`)
- **Design tokens**: `app/globals.css` (`@theme inline`) + `lib/motion.ts`; see `DESIGN.md`. Headlines mark one serif word with `*asterisks*` (`Emphasis`)
- **Content**: `DEV_CONTENT=true` → `content/content.md`; otherwise `lib/content/fromSanity.ts` maps existing Sanity blocks onto the same `LocaleContent` model
- **Image generation**: StudioShell captures prompt + quality contract together (`GenerationRequestSpec`) → `POST /api/replicate` → poll `/api/replicate/status` → MinIO + Supabase → client
- **Quality gate**: `QUALITY_GATE_MODE=off|shadow|enforce`, validator on Replicate (`lib/visionValidator.ts`, `lib/qualityGate.ts`); see `playbook-stabilisierung.md`
- **Upscaling**: `POST /api/replicate/upscale` → same storage flow
- **Draft preview**: Sanity live mode via `/api/draft-mode/enable`

## Adding a Homepage Section
1. Extend the content model in `lib/content/types.ts`
2. Add the data to `content/content.md` (both locales) and map it in `lib/content/fromSanity.ts`
3. Create the section in `components/sections/` and render it in `(marketing)/page.tsx`

## Environment Variables
See `.env.local.example`. Key groups: Replicate, MinIO, Supabase, Clerk, Sanity.

## Deployment
Automated Jenkins deploy on `main` branch push to `https://rotpunkt-visions.de/` (~2 min).

## Testing
No test suite configured. Use `pnpm lint`, `pnpm exec tsc --noEmit` and `pnpm audit:prompts` for static checks.
