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
│   │   ├── replicate/       # AI image generation endpoints
│   │   │   ├── route.ts     # Base image generation
│   │   │   └── upscale/     # High-res upscaling endpoint
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
│   ├── ImageModal.tsx       # Image preview with sharing & upscale
│   ├── UpscaleModal.tsx     # High-res upscaling UI
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

### 2. High-Res Upscaling Pipeline (Optional)

After base image generation, users can optionally upscale images to 2x resolution:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ImageModal    │───▶│  UpscaleModal    │───▶│ POST /api/      │
│  (✨ High-Res)  │    │    .tsx          │    │ replicate/upscale│
└─────────────────┘    └──────────────────┘    └────────┬────────┘
                                                        │
                       ┌────────────────────────────────┼────────────────────────────────┐
                       ▼                                ▼                                ▼
               Replicate API                     MinIO Upload                    Supabase Insert
               (philz1337x/                      (vision-images                  (is_upscaled=true)
                clarity-upscaler)                 bucket)
```

**Upscaler Model:** `philz1337x/clarity-upscaler:dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e`

**Input Parameters:**
```typescript
{
  seed: 1337,
  image: string,              // Source image URL
  prompt: string,             // Enhancement prompt
  dynamic: 6,
  scale_factor: 2,            // 2x upscale
  output_format: "png",
  creativity: 0.35,
  resemblance: 0.6,
  num_inference_steps: 18
}
```

**Files involved:**
- [components/ImageModal.tsx](components/ImageModal.tsx) – "✨ High-Res" button trigger
- [components/UpscaleModal.tsx](components/UpscaleModal.tsx) – Upscale UI with loading states
- [app/api/replicate/upscale/route.ts](app/api/replicate/upscale/route.ts) – Server-side upscale orchestration

### 3. Replicate Model Configuration

**Base Generation Model:** `mainframeai/rddt-finetune-dec-2025:9620255525bcbad26f909dd62b2820aaae39aa99d0d9de5933c4a39465c6ff83`

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

### 4. State Management (Nanostores)

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

### 5. Sanity Page Builder

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

### 6. Authentication & Authorization

- **Middleware:** `middleware.ts` uses `clerkMiddleware()` to protect routes
- **API Routes:** Use `getAuth(req)` to verify user and get tokens
- **Supabase Integration:** JWT template `"supabase"` for RLS-enabled queries
- **Protected Pages:** `/my-images` requires authentication

---

## Database Schema (Supabase)

### `images` Table
```sql
id                 UUID PRIMARY KEY
url                TEXT NOT NULL       -- MinIO permanent URL
imageprompt        TEXT                -- Original prompt used
created_at         TIMESTAMPTZ         -- Auto-generated
user_id            UUID                -- From Clerk (via RLS)
is_upscaled        BOOLEAN DEFAULT FALSE  -- Whether this is a high-res version
original_image_url TEXT                -- Reference to original image (for upscaled)
```

---

## Critical Developer Workflows

### Development & Build
- **Start Dev Server:** `pnpm dev` (uses Turbopack)
- **Build Project:** `pnpm build`
- **Linting:** `pnpm lint`
- **Auto-fix Linting:** `pnpm fix`

### Deployment
- **Automated:** Jenkins CI/CD triggers on `main` branch push.
- **Production URL:** `https://rotpunkt-visions.de/`
- **Docker:** `Dockerfile` and `dockerDeployment.sh` are available for manual containerization.

---

## Code Conventions

- **Language:** German for user-facing text, English for code/comments.
- **Prompt Engineering:** German prompts are built in `promptBuilder.ts` with specific brand constraints (e.g., "genau ein Spülbecken", "Rotpunkt Markensprache").
- **Components:** Functional with hooks, co-located styles.
- **Exports:** Named exports preferred, default for pages.
- **Imports:** Use `@/` path alias for absolute imports.
- **Server Components:** Default in App Router; add `"use client"` when needed.
- **API Routes:** Use Route Handlers (`route.ts`) with Next.js patterns.

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
