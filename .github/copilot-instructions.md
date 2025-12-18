# Copilot Instructions – Rotpunkt AI Kitchen Vision Generator

This document describes the architecture, conventions, and key integration points of the project to assist with development.

---

## Project Overview

**Name:** `rotpunkt-image-gen`  
**Purpose:** Marketing-focused Next.js 15 application that lets visitors design custom kitchen/room concepts through a guided wizard and generate AI imagery using a fine-tuned Replicate model.

**Core Stack:**
- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Motion (Framer Motion)
- **Auth:** Clerk (`@clerk/nextjs`)
- **CMS:** Sanity v4 with Page Builder pattern
- **Database:** Supabase (PostgreSQL)
- **Object Storage:** MinIO (S3-compatible)
- **AI Generation:** Replicate API (flux-based fine-tune)
- **State Management:** Nanostores with persistence (`@nanostores/persistent`)
- **Data Fetching:** TanStack React Query

---

## Directory Structure

```
├── app/
│   ├── (site)/              # Public marketing site routes
│   │   ├── page.tsx         # Home page (renders Sanity content)
│   │   ├── [slug]/          # Dynamic pages from Sanity
│   │   └── my-images/       # Authenticated user gallery
│   ├── (studio)/            # Sanity Studio (embedded)
│   ├── api/
│   │   ├── replicate/       # AI image generation endpoint
│   │   └── clerk-user-webhook/  # Clerk webhook handler
│   ├── store/               # Nanostore atoms
│   │   ├── modals.ts        # Modal visibility state
│   │   ├── prompt.ts        # Generated prompt storage
│   │   ├── step.ts          # Page step navigation
│   │   └── wizardStore.ts   # Wizard selections & state
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # App-level utilities
├── components/
│   ├── wizard/              # AI generation wizard components
│   ├── pagebuildercomponents/  # Sanity page builder blocks
│   └── ui/                  # Shadcn/Radix UI primitives
├── lib/
│   ├── minioClient.ts       # MinIO upload utilities (server-only)
│   ├── supabaseClient.ts    # Supabase browser client
│   └── supabaseServer.ts    # Supabase server client
├── sanity/
│   ├── schemaTypes/         # Sanity schema definitions
│   └── lib/
│       ├── queries.ts       # GROQ queries
│       └── client.ts        # Sanity client config
└── public/
    ├── wizard-presets/      # Preset preview images
    └── UI/                  # Lottie animations
```

---

## Key Architectural Patterns

### 1. AI Image Generation Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  KitchenWizard  │───▶│  promptBuilder   │───▶│  ImageGenerator │
│     Modal       │    │    .ts           │    │     .tsx        │
└─────────────────┘    └──────────────────┘    └────────┬────────┘
                                                        │
                                                        ▼
                                               POST /api/replicate
                                                        │
                       ┌────────────────────────────────┼────────────────────────────────┐
                       ▼                                ▼                                ▼
               Replicate API                     MinIO Upload                    Supabase Insert
               (mainframeai/                     (vision-images                  (images table)
                rddt-finetune)                    bucket)
```

**Files involved:**
- [components/wizard/KitchenWizardModal.tsx](components/wizard/KitchenWizardModal.tsx) – Assembles wizard UI
- [components/wizard/promptBuilder.ts](components/wizard/promptBuilder.ts) – Converts selections to German prompt
- [components/wizard/ImageGenerator.tsx](components/wizard/ImageGenerator.tsx) – React Query mutation to API
- [app/api/replicate/route.ts](app/api/replicate/route.ts) – Server-side generation orchestration
- [lib/minioClient.ts](lib/minioClient.ts) – Downloads from Replicate, uploads to MinIO

### 2. Replicate Model Configuration

**Current Model:** `mainframeai/rddt-finetune-dec-2025:9620255525bcbad26f909dd62b2820aaae39aa99d0d9de5933c4a39465c6ff83`

**Input Parameters:**
```typescript
{
  prompt: string,           // German description from wizard
  go_fast: true,
  guidance: 3,
  strength: 0.9,
  image_size: "optimize_for_quality",
  lora_scale: 1,
  aspect_ratio: "16:9",
  output_format: "webp",
  enhance_prompt: true,
  output_quality: 80,
  negative_prompt: string,  // Prevents artifacts
  num_inference_steps: 30
}
```

**Output:** Array of `FileOutput` objects – use `.url().href` to get string URL.

### 3. State Management (Nanostores)

| Store | File | Purpose |
|-------|------|---------|
| `$showWizard` | `app/store/modals.ts` | Controls wizard modal visibility |
| `$prompt` | `app/store/prompt.ts` | Stores final generated prompt |
| `$pageStep` | `app/store/step.ts` | Tracks current page state (`intro`/`imagegen`) |
| `wizardStore` | `app/store/wizardStore.ts` | Persisted wizard selections |

**Wizard State Shape:**
```typescript
interface WizardState {
  currentStep: number
  selectedOptions: {
    color?: string
    style?: string
    kind?: string
    environment?: string
    location?: string
    time?: string
    houseType?: string
    viewpoint?: string
  }
  extraWishes: string
  showAuthPrompt: boolean
  error: string
}
```

### 4. Sanity Page Builder

Content editors create pages using composable blocks. The `PageBuilder` component maps `_type` to React components:

| Block Type | Component | Description |
|------------|-----------|-------------|
| `wizard` | `Wizard.tsx` | AI generation wizard |
| `heroSection` | `HeroSection.tsx` | Hero with image/video |
| `mediaHeroSection` | `MediaHeroSection.tsx` | Full-bleed media hero |
| `tickerGallery` | `Ticker.tsx` | Scrolling image gallery |
| `header` | `Header.tsx` | Section headers |
| `textHeadlineCombo` | `TextHeadlineCombo.tsx` | Text blocks |
| `expandableCards` | `ExpandableCards.tsx` | Accordion cards |
| `richText` | `RichTextComponent.tsx` | Portable Text |
| `mediaScrollHighlightSection` | `MediaScrollHighlightSection.tsx` | Scroll-triggered media |

### 5. Authentication & Authorization

- **Middleware:** `middleware.ts` uses `clerkMiddleware()` to protect routes
- **API Routes:** Use `getAuth(req)` to verify user and get tokens
- **Supabase Integration:** JWT template `"supabase"` for RLS-enabled queries
- **Protected Pages:** `/my-images` requires authentication

---

## Database Schema (Supabase)

### `images` Table
```sql
id          UUID PRIMARY KEY
url         TEXT NOT NULL       -- MinIO permanent URL
imageprompt TEXT                -- Original prompt used
created_at  TIMESTAMPTZ         -- Auto-generated
user_id     UUID                -- From Clerk (via RLS)
```

---

## Environment Variables Required

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Replicate
REPLICATE_API_TOKEN=

# MinIO
MINIO_DOMAIN=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_READ_TOKEN=
```

---

## Wizard Steps Configuration

Defined in [components/wizard/wizardSteps.tsx](components/wizard/wizardSteps.tsx):

1. **Raumfokus (kind):** Kitchen, Living Room, Exterior, Hallway
2. **Farbwelt (color):** Color palette + FENIX NTM colors
3. **Stilrichtung (style):** Elegant, Modern, Minimalist, Classic, Open
4. **Umgebung (environment):** Urban, Rural, Suburban
5. **Haustyp (houseType):** Apartment, House, Loft, Villa
6. **Standort (location):** Germany, Austria, Switzerland, Other
7. **Tageszeit (time):** Morning, Noon, Evening, Night
8. **Perspektive (viewpoint):** Interior or Exterior view

---

## Code Conventions

- **Language:** German for user-facing text, English for code/comments
- **Components:** Functional with hooks, co-located styles
- **Exports:** Named exports preferred, default for pages
- **Imports:** Use `@/` path alias for absolute imports
- **Server Components:** Default in App Router; add `"use client"` when needed
- **API Routes:** Use Route Handlers (`route.ts`) with Next.js patterns

---

## Common Development Tasks

### Adding a New Wizard Step
1. Add step definition to `wizardSteps.tsx`
2. Add key to `WizardState['selectedOptions']` in `wizardStore.ts`
3. Update `promptBuilder.ts` to include new field in prompt

### Adding a New Page Builder Block
1. Create schema in `sanity/schemaTypes/components/`
2. Register in `sanity/schemaTypes/index.ts`
3. Add to `pageBuilderType.ts` array
4. Create React component in `components/pagebuildercomponents/`
5. Add case to `PageBuilder.tsx` switch

### Modifying AI Generation Parameters
Edit [app/api/replicate/route.ts](app/api/replicate/route.ts) – update the `input` object in `replicate.run()`.

### Adding Persistent State
Use `persistentAtom` from `@nanostores/persistent` in `app/store/`.

---

## Testing & Debugging

- **Dev Server:** `pnpm dev` (uses Turbopack)
- **Lint:** `pnpm lint` / `pnpm fix`
- **Sanity Studio:** Available at `/studio` route
- **API Debugging:** Check server logs for Replicate/MinIO errors

---

## Deployment

- **Docker:** `Dockerfile` and `dockerDeployment.sh` provided
- **Build:** `pnpm build` → `pnpm start`
- **Prerequisites:** Node ≥20, pnpm ≥10
