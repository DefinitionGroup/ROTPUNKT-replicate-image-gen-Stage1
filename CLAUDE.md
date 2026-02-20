# CLAUDE.md — RDDOT-dfn-AI-IMAGEGEN

## Project Overview
AI kitchen image generation app built with Next.js 15 (App Router). Combines a Sanity CMS marketing site with a client-side wizard that builds prompts, calls Replicate for generation/upscaling, stores assets in MinIO, and records metadata in Supabase. Auth via Clerk, i18n via `next-intl`.

## Tech Stack
- **Framework**: Next.js 15, React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"` in `app/globals.css`), dark high-contrast palette
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
pnpm build        # production build
pnpm lint         # eslint
pnpm fix          # eslint --fix
```

## Project Structure
```
app/
  (site)/[locale]/page.tsx          # Home (Sanity HOME_PAGE_QUERY → PageBuilder)
  (site)/[locale]/[slug]/page.tsx   # CMS pages (PAGE_QUERY)
  (site)/[locale]/my-images/        # Auth-protected gallery
  (studio)/studio/[[...tool]]/      # Sanity Studio
  api/replicate/route.ts            # Image generation endpoint
  api/replicate/upscale/route.ts    # Upscale endpoint
  api/clerk-user-webhook/route.ts   # Clerk → Supabase user sync
  store/                            # nanostores
components/
  PageBuilder.tsx                   # Maps Sanity blocks → React components
  pagebuildercomponents/            # Individual CMS block components
  wizard/                           # Prompt wizard + ImageGenerator
  ui/                               # Navbar, Footer, shadcn primitives
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
- **Brand colors**: CSS variables (`--color-brand-primary-2`, etc.) in `app/globals.css`
- **CMS blocks**: Schema in `sanity/schemaTypes/`, registered in `pageBuilderType.ts`, rendered via `PageBuilder.tsx`
- **Image generation**: Wizard → `POST /api/replicate` → Replicate → MinIO + Supabase → client
- **Upscaling**: `POST /api/replicate/upscale` → same storage flow
- **Draft preview**: Sanity live mode via `/api/draft-mode/enable`

## Adding a New CMS Block
1. Create schema in `sanity/schemaTypes/`
2. Register in `sanity/schemaTypes/pageBuilderType.ts`
3. Create React component in `components/pagebuildercomponents/`
4. Map in `components/PageBuilder.tsx`

## Environment Variables
See `.env.local.example`. Key groups: Replicate, MinIO, Supabase, Clerk, Sanity.

## Deployment
Automated Jenkins deploy on `main` branch push to `https://rotpunkt-visions.de/` (~2 min).

## Testing
No test suite configured. Use `pnpm lint` for static checks.
