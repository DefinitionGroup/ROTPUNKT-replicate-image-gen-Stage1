# Rotpunkt AI Kitchen Vision Generator – Developer Overview

> **Comprehensive technical documentation for developers working on the Rotpunkt Visions AI image generation platform.**

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Features & Flows](#core-features--flows)
   - [AI Image Generation Pipeline](#ai-image-generation-pipeline)
   - [High-Res Upscaling Pipeline](#high-res-upscaling-pipeline)
   - [Authentication Flow](#authentication-flow)
   - [Content Management (Sanity)](#content-management-sanity)
6. [State Management](#state-management)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [Component Architecture](#component-architecture)
10. [Development Workflows](#development-workflows)
11. [Deployment](#deployment)
12. [Environment Configuration](#environment-configuration)
13. [Troubleshooting](#troubleshooting)

---

## Introduction

**Rotpunkt Visions** is a marketing-focused web application that enables users to design custom kitchen and room concepts through an interactive wizard interface. The application leverages AI-powered image generation using fine-tuned models on the Replicate platform.

### Key Capabilities

- 🎨 **Guided Wizard**: Step-by-step kitchen design configurator
- 🤖 **AI Generation**: Fine-tuned Flux model for photorealistic kitchen renders
- ✨ **High-Res Upscaling**: Optional 2x resolution enhancement
- 🔐 **User Authentication**: Clerk-based auth with image ownership
- 📱 **Responsive Design**: Mobile-first with Tailwind CSS
- 📝 **CMS Integration**: Sanity-powered page builder for marketing content

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Next.js   │  │  Nanostores │  │ React Query │  │    Clerk Auth       │ │
│  │   App       │  │   (State)   │  │  (Fetching) │  │    (Frontend)       │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────┼─────────────────────┼───────────┘
          │                │                │                     │
          ▼                ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVER (Next.js API Routes)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ /api/replicate  │  │ /api/replicate  │  │ /api/clerk-user-webhook     │  │
│  │   (Generate)    │  │   /upscale      │  │   (User sync)               │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────────┬──────────────┘  │
└───────────┼────────────────────┼──────────────────────────┼─────────────────┘
            │                    │                          │
            ▼                    ▼                          ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Replicate  │  │    MinIO    │  │  Supabase   │  │    Clerk    │          │
│  │  (AI Gen)   │  │  (Storage)  │  │    (DB)     │  │   (Auth)    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                                               │
│  ┌─────────────┐                                                              │
│  │   Sanity    │                                                              │
│  │   (CMS)     │                                                              │
│  └─────────────┘                                                              │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action → React Component → Nanostore Update → React Query Mutation
    → API Route → External Service → Response → State Update → UI Update
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Motion (Framer) | 11.x | Animations |
| Nanostores | 0.11.x | Lightweight state management |
| TanStack Query | 5.x | Server state & caching |

### Backend & Services
| Service | Purpose |
|---------|---------|
| Replicate | AI model hosting & inference |
| Supabase | PostgreSQL database with RLS |
| MinIO | S3-compatible object storage |
| Clerk | Authentication & user management |
| Sanity | Headless CMS |

### Development
| Tool | Purpose |
|------|---------|
| pnpm | Package manager |
| Turbopack | Dev server bundler |
| ESLint | Code linting |
| Docker | Containerization |
| Jenkins | CI/CD |

---

## Project Structure

```
rotpunkt-image-gen/
├── app/                          # Next.js App Router
│   ├── (site)/                   # Public routes (route group)
│   │   ├── layout.tsx            # Site layout with navbar/footer
│   │   ├── page.tsx              # Homepage (Sanity-driven)
│   │   ├── [slug]/               # Dynamic CMS pages
│   │   │   └── page.tsx
│   │   └── my-images/            # User's generated images
│   │       └── page.tsx
│   ├── (studio)/                 # Sanity Studio (route group)
│   │   ├── layout.tsx
│   │   └── studio/[[...tool]]/   # Catch-all for studio routes
│   ├── api/                      # API Route Handlers
│   │   ├── replicate/
│   │   │   ├── route.ts          # Base image generation
│   │   │   └── upscale/
│   │   │       └── route.ts      # High-res upscaling
│   │   ├── clerk-user-webhook/
│   │   │   └── route.ts          # Clerk webhook handler
│   │   └── draft-mode/           # Sanity preview mode
│   ├── store/                    # Nanostore atoms
│   │   ├── modals.ts             # Modal visibility
│   │   ├── prompt.ts             # Current prompt
│   │   ├── step.ts               # Page navigation state
│   │   └── wizardStore.ts        # Wizard selections
│   ├── hooks/                    # Custom React hooks
│   │   └── use-outside-click.ts
│   ├── lib/                      # App utilities
│   │   └── utils.ts
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── actions.ts                # Server actions
│   └── get-query-client.ts       # React Query setup
│
├── components/                   # React components
│   ├── wizard/                   # Wizard feature components
│   │   ├── KitchenWizardModal.tsx    # Main wizard container
│   │   ├── WizardIntro.tsx           # Intro/preset selection
│   │   ├── WizardStep.tsx            # Generic step renderer
│   │   ├── WizardColorStep.tsx       # Color selection step
│   │   ├── WizardFinal.tsx           # Final confirmation
│   │   ├── WizardHeader.tsx          # Navigation header
│   │   ├── WizardSummaryPanel.tsx    # Live preview panel
│   │   ├── ImageGenerator.tsx        # Generation UI & mutations
│   │   ├── IntroCard.tsx             # Landing intro card
│   │   ├── Wizard.tsx                # Page builder wrapper
│   │   ├── promptBuilder.ts          # Prompt construction logic
│   │   ├── wizardSteps.tsx           # Step definitions
│   │   ├── wizardPresets.ts          # Preset configurations
│   │   └── fenixColors.ts            # Color palette data
│   ├── pagebuildercomponents/    # Sanity page builder blocks
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── MediaHeroSection.tsx
│   │   ├── Ticker.tsx
│   │   ├── TextHeadlineCombo.tsx
│   │   ├── ExpandableCards.tsx
│   │   ├── RichTextComponent.tsx
│   │   └── MediaScrollHighlightSection.tsx
│   ├── ui/                       # Shadcn/Radix primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── switch.tsx
│   │   ├── navbar.tsx
│   │   ├── navbar-menu.tsx
│   │   ├── Footer.tsx
│   │   ├── logo.tsx
│   │   ├── LogoBig.tsx
│   │   └── not-found.tsx
│   ├── ImageModal.tsx            # Full-size image viewer
│   ├── UpscaleModal.tsx          # High-res upscaling UI
│   ├── ImagesGalleryClient.tsx   # User gallery grid
│   ├── PageBuilder.tsx           # Sanity block renderer
│   ├── Providers.tsx             # Context providers wrapper
│   └── ...                       # Other shared components
│
├── lib/                          # Server-side utilities
│   ├── minioClient.ts            # MinIO upload functions
│   ├── supabaseClient.ts         # Browser Supabase client
│   ├── supabaseServer.ts         # Server Supabase client
│   └── utils.ts                  # Shared utilities
│
├── sanity/                       # Sanity CMS configuration
│   ├── schemaTypes/              # Content schemas
│   │   ├── index.ts              # Schema registry
│   │   ├── pageType.ts           # Page document type
│   │   ├── pageBuilderType.ts    # Page builder array
│   │   ├── components.ts         # Component schemas
│   │   ├── objects.ts            # Object schemas
│   │   ├── components/           # Individual component schemas
│   │   └── objects/              # Individual object schemas
│   ├── lib/
│   │   ├── client.ts             # Sanity client
│   │   ├── queries.ts            # GROQ queries
│   │   ├── image.ts              # Image URL builder
│   │   └── live.ts               # Live preview
│   ├── env.ts                    # Environment variables
│   ├── structure.ts              # Studio structure
│   ├── sanity.types.ts           # Generated types
│   └── schema.json               # Extracted schema
│
├── public/                       # Static assets
│   ├── wizard-presets/           # Preset preview images
│   ├── UI/                       # Lottie animations
│   ├── assets/                   # General assets
│   └── fonts/                    # Custom fonts
│
├── scripts/                      # Build/utility scripts
│   └── download-assets.mjs
│
├── utils/                        # Shared utilities
│   └── nav-internal.ts
│
├── middleware.ts                 # Clerk auth middleware
├── next.config.ts                # Next.js configuration
├── sanity.config.ts              # Sanity Studio config
├── sanity.cli.ts                 # Sanity CLI config
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── Dockerfile                    # Container definition
└── dockerDeployment.sh           # Deployment script
```

---

## Core Features & Flows

### AI Image Generation Pipeline

The primary feature of the application. Users configure kitchen parameters through a multi-step wizard, which generates a detailed German-language prompt for the AI model.

#### Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           WIZARD CONFIGURATION                                │
│                                                                              │
│  Step 1: Style    Step 2: Color    Step 3: Environment    Step 4: Details   │
│  ┌─────────┐      ┌─────────┐      ┌─────────────┐        ┌───────────────┐ │
│  │ Modern  │      │ Oak     │      │ Open Living │        │ Time of Day   │ │
│  │ Classic │      │ White   │      │ Closed      │        │ House Type    │ │
│  │ ...     │      │ Black   │      │ ...         │        │ Viewpoint     │ │
│  └─────────┘      └─────────┘      └─────────────┘        └───────────────┘ │
│                                                                              │
│                         + Extra Wishes (free text)                           │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           PROMPT BUILDER                                      │
│  promptBuilder.ts                                                            │
│                                                                              │
│  Input:  { style: "modern", color: "oak", environment: "open", ... }         │
│  Output: "RDTDOT Eine moderne Küche mit Eichenholz-Fronten in einem          │
│           offenen Wohnbereich mit natürlichem Tageslicht..."                 │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           API ROUTE                                           │
│  /api/replicate/route.ts                                                     │
│                                                                              │
│  1. Verify authentication (Clerk)                                            │
│  2. Validate prompt                                                          │
│  3. Call Replicate API with fine-tuned model                                 │
│  4. Download generated image from Replicate CDN                              │
│  5. Upload to MinIO (permanent storage)                                      │
│  6. Insert record into Supabase                                              │
│  7. Return MinIO URL to client                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           IMAGE DISPLAY                                       │
│  ImageGenerator.tsx → ImageModal.tsx                                         │
│                                                                              │
│  - Display generated image                                                   │
│  - Share options (WhatsApp, Facebook, etc.)                                  │
│  - Download button                                                           │
│  - High-Res upscale button (✨)                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Key Files

| File | Purpose |
|------|---------|
| `components/wizard/KitchenWizardModal.tsx` | Main wizard container, step navigation |
| `components/wizard/wizardSteps.tsx` | Step definitions and options |
| `components/wizard/promptBuilder.ts` | Converts selections to German prompt |
| `components/wizard/ImageGenerator.tsx` | Handles generation mutation and display |
| `app/api/replicate/route.ts` | Server-side API endpoint |
| `lib/minioClient.ts` | Image storage utilities |

#### Replicate Model Configuration

```typescript
// Model: mainframeai/rddt-finetune-dec-2025
const input = {
  prompt: "RDTDOT " + germanPrompt,  // Trigger word + prompt
  go_fast: true,
  guidance: 3,
  strength: 0.9,
  image_size: "optimize_for_quality",
  lora_scale: 1,
  aspect_ratio: "16:9",
  output_format: "webp",
  enhance_prompt: true,
  output_quality: 80,
  negative_prompt: "duplicate sinks, double faucets, ...",
  num_inference_steps: 30,
  num_outputs: 1,
};
```

---

### High-Res Upscaling Pipeline

An optional second-stage pipeline that allows users to enhance their generated images to 2x resolution using the Clarity Upscaler model.

#### Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────┐
│   ImageModal    │    │  UpscaleModal    │    │  /api/replicate/upscale │
│                 │    │                  │    │                         │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ 1. Auth check           │
│ │ ✨ High-Res │─┼───▶│ │ Loading...   │ │───▶│ 2. Call Clarity model   │
│ └─────────────┘ │    │ │              │ │    │ 3. Upload to MinIO      │
│                 │    │ │ [Progress]   │ │    │ 4. Save to Supabase     │
│                 │    │ └──────────────┘ │    │    (is_upscaled=true)   │
└─────────────────┘    └──────────────────┘    └─────────────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Result Display  │
                       │                  │
                       │ ┌──────────────┐ │
                       │ │ 📥 Download  │ │
                       │ │   High-Res   │ │
                       │ └──────────────┘ │
                       └──────────────────┘
```

#### Upscaler Configuration

```typescript
// Model: philz1337x/clarity-upscaler
const input = {
  seed: 1337,
  image: sourceImageUrl,
  prompt: "masterpiece, best quality, highres...",
  dynamic: 6,
  scale_factor: 2,          // 2x upscale
  output_format: "png",
  creativity: 0.35,
  resemblance: 0.6,
  num_inference_steps: 18,
  // ... additional parameters
};
```

#### Key Files

| File | Purpose |
|------|---------|
| `components/ImageModal.tsx` | Triggers upscale flow |
| `components/UpscaleModal.tsx` | Upscale UI and loading states |
| `app/api/replicate/upscale/route.ts` | Server-side upscale endpoint |

---

### Authentication Flow

Authentication is handled by Clerk with Supabase RLS integration.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  Clerk.js   │    │  Next.js    │    │  Supabase   │
│             │    │             │    │  Middleware │    │    (RLS)    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │  1. Sign In      │                  │                  │
       │─────────────────▶│                  │                  │
       │                  │                  │                  │
       │  2. Session      │                  │                  │
       │◀─────────────────│                  │                  │
       │                  │                  │                  │
       │  3. Request /my-images              │                  │
       │────────────────────────────────────▶│                  │
       │                  │                  │                  │
       │                  │  4. Verify JWT   │                  │
       │                  │◀─────────────────│                  │
       │                  │                  │                  │
       │                  │  5. Get Token    │                  │
       │                  │  (template:      │                  │
       │                  │   supabase)      │                  │
       │                  │─────────────────▶│                  │
       │                  │                  │                  │
       │                  │                  │  6. Query with   │
       │                  │                  │     JWT          │
       │                  │                  │─────────────────▶│
       │                  │                  │                  │
       │                  │                  │  7. RLS Filter   │
       │                  │                  │◀─────────────────│
       │                  │                  │                  │
       │  8. Response (user's images only)   │                  │
       │◀────────────────────────────────────│                  │
```

#### Protected Routes

| Route | Protection Level |
|-------|------------------|
| `/` | Public |
| `/[slug]` | Public |
| `/my-images` | Authenticated |
| `/api/replicate` | Authenticated |
| `/api/replicate/upscale` | Authenticated |
| `/studio` | Public (Sanity handles auth) |

---

### Content Management (Sanity)

The marketing site content is managed through Sanity CMS using a Page Builder pattern.

#### Page Builder Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           SANITY STUDIO                                       │
│                                                                              │
│  Page Document                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ title: "Home"                                                          │ │
│  │ slug: "/"                                                              │ │
│  │ pageBuilder: [                                                         │ │
│  │   { _type: "heroSection", ... },                                       │ │
│  │   { _type: "wizard" },                                                 │ │
│  │   { _type: "tickerGallery", ... },                                     │ │
│  │   { _type: "textHeadlineCombo", ... },                                 │ │
│  │ ]                                                                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ GROQ Query
┌──────────────────────────────────────────────────────────────────────────────┐
│                           PAGE RENDERER                                       │
│  app/(site)/page.tsx + components/PageBuilder.tsx                            │
│                                                                              │
│  pageBuilder.map(block => {                                                  │
│    switch(block._type) {                                                     │
│      case 'heroSection':    return <HeroSection {...block} />                │
│      case 'wizard':         return <Wizard {...block} />                     │
│      case 'tickerGallery':  return <Ticker {...block} />                     │
│      ...                                                                     │
│    }                                                                         │
│  })                                                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Available Page Builder Blocks

| Block Type | Component | Description |
|------------|-----------|-------------|
| `wizard` | `Wizard.tsx` | AI generation wizard integration |
| `heroSection` | `HeroSection.tsx` | Hero with image/video background |
| `mediaHeroSection` | `MediaHeroSection.tsx` | Full-bleed media hero |
| `tickerGallery` | `Ticker.tsx` | Horizontal scrolling image gallery |
| `header` | `Header.tsx` | Section headers with styling |
| `textHeadlineCombo` | `TextHeadlineCombo.tsx` | Text blocks with headlines |
| `expandableCards` | `ExpandableCards.tsx` | Accordion-style cards |
| `richText` | `RichTextComponent.tsx` | Portable Text content |
| `mediaScrollHighlightSection` | `MediaScrollHighlightSection.tsx` | Scroll-triggered media reveal |

---

## State Management

State is managed using Nanostores for its lightweight footprint and React 19 compatibility.

### Store Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           NANOSTORE ATOMS                                     │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   $showWizard   │  │     $prompt     │  │        $pageStep            │  │
│  │   (boolean)     │  │    (string)     │  │  ('intro' | 'imagegen')     │  │
│  │                 │  │                 │  │                             │  │
│  │ Controls modal  │  │ Stores final    │  │ Tracks page navigation      │  │
│  │ visibility      │  │ AI prompt       │  │ state                       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                          wizardStore                                    │ │
│  │                    (persistentMap - localStorage)                       │ │
│  │                                                                         │ │
│  │  {                                                                      │ │
│  │    currentStep: number,                                                 │ │
│  │    selectedOptions: {                                                   │ │
│  │      color?: string,                                                    │ │
│  │      style?: string,                                                    │ │
│  │      kind?: string,                                                     │ │
│  │      environment?: string,                                              │ │
│  │      location?: string,                                                 │ │
│  │      time?: string,                                                     │ │
│  │      houseType?: string,                                                │ │
│  │      viewpoint?: string,                                                │ │
│  │    },                                                                   │ │
│  │    extraWishes: string,                                                 │ │
│  │    showAuthPrompt: boolean,                                             │ │
│  │    error: string,                                                       │ │
│  │  }                                                                      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Usage Pattern

```typescript
// Reading state
import { useStore } from '@nanostores/react';
import { wizardStore, wizardActions } from '@/store/wizardStore';

function MyComponent() {
  const state = useStore(wizardStore);
  
  const handleSelect = (option: string) => {
    wizardActions.selectOption('color', option);
    wizardActions.nextStep(totalSteps);
  };
  
  return <div>{state.selectedOptions.color}</div>;
}
```

---

## Database Schema

### Supabase Tables

#### `images` Table

```sql
CREATE TABLE images (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url                TEXT NOT NULL,
  imageprompt        TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  user_id            TEXT NOT NULL,
  is_upscaled        BOOLEAN DEFAULT FALSE,
  original_image_url TEXT
);

-- Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images" ON images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON images
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Schema Diagram

```
┌─────────────────────────────────────┐
│              images                  │
├─────────────────────────────────────┤
│ id                 UUID      PK     │
│ url                TEXT      NOT NULL
│ imageprompt        TEXT             │
│ created_at         TIMESTAMPTZ      │
│ user_id            TEXT      FK→Clerk
│ is_upscaled        BOOLEAN          │
│ original_image_url TEXT             │
└─────────────────────────────────────┘
```

---

## API Reference

### POST `/api/replicate`

Generate a new AI image.

**Request:**
```json
{
  "prompt": "Eine moderne Küche mit weißen Fronten..."
}
```

**Response:**
```json
["https://minio.example.com/vision-images/abc123.webp"]
```

**Errors:**
| Status | Description |
|--------|-------------|
| 401 | Unauthorized - no valid session |
| 400 | Bad request - missing prompt |
| 500 | Server error - generation failed |

---

### POST `/api/replicate/upscale`

Upscale an existing image to 2x resolution.

**Request:**
```json
{
  "imageUrl": "https://minio.example.com/vision-images/abc123.webp",
  "prompt": "masterpiece, best quality, highres..."
}
```

**Response:**
```json
["https://minio.example.com/vision-images/xyz789.png"]
```

**Errors:**
| Status | Description |
|--------|-------------|
| 401 | Unauthorized |
| 400 | Missing imageUrl |
| 500 | Upscale failed |

---

## Component Architecture

### Wizard Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Wizard.tsx (Page Builder)                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     IntroCard.tsx                                      │  │
│  │  - Hero section with CTA                                              │  │
│  │  - Opens wizard modal                                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼ onClick                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   KitchenWizardModal.tsx                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    WizardHeader.tsx                              │  │  │
│  │  │  - Step indicators                                              │  │  │
│  │  │  - Navigation buttons                                           │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Content Area                                  │  │  │
│  │  │                                                                  │  │  │
│  │  │  WizardIntro.tsx    │ WizardStep.tsx      │ WizardFinal.tsx     │  │  │
│  │  │  - Preset selection │ - Option grid       │ - Summary           │  │  │
│  │  │  - Start blank      │ - WizardColorStep   │ - Extra wishes      │  │  │
│  │  │                     │   (special color UI)│ - Generate button   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                  WizardSummaryPanel.tsx                          │  │  │
│  │  │  - Live preview of selections                                   │  │  │
│  │  │  - Shows generated prompt                                       │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼ onPromptReady                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     ImageGenerator.tsx                                 │  │
│  │  - Loading state with timer                                           │  │
│  │  - Error handling                                                     │  │
│  │  - Image grid display                                                 │  │
│  │  - Opens ImageModal on click                                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Modal Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ImageModal.tsx                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  - Full-size image display                                            │  │
│  │  - Share dropdown (WhatsApp, Facebook, Telegram, X, Email)            │  │
│  │  - ✨ High-Res button → opens UpscaleModal                            │  │
│  │  - Download button                                                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼ ✨ High-Res click                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         UpscaleModal.tsx                               │  │
│  │  - Auto-triggers upscale on mount (with guard)                        │  │
│  │  - Loading animation with timer                                       │  │
│  │  - Progress bar                                                       │  │
│  │  - Result display with download                                       │  │
│  │  - Error state with retry                                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Development Workflows

### Getting Started

```bash
# Clone and install
git clone <repo-url>
cd rotpunkt-image-gen
pnpm install

# Set up environment
cp .env.example .env.local
# Fill in all required variables

# Start development
pnpm dev
```

### Common Tasks

#### Adding a New Wizard Step

1. **Define the step** in `components/wizard/wizardSteps.tsx`:
```typescript
{
  key: "newStep",
  title: "Neuer Schritt",
  options: [
    { value: "option1", label: "Option 1", image: "/wizard-presets/..." },
    // ...
  ]
}
```

2. **Update state type** in `app/store/wizardStore.ts`:
```typescript
selectedOptions: {
  // ...existing
  newStep?: string
}
```

3. **Update prompt builder** in `components/wizard/promptBuilder.ts`:
```typescript
if (selections.newStep) {
  parts.push(`mit ${selections.newStep}`);
}
```

#### Adding a New Page Builder Block

1. **Create schema** in `sanity/schemaTypes/components/`:
```typescript
// newBlockType.ts
export const newBlockType = defineType({
  name: 'newBlock',
  title: 'New Block',
  type: 'object',
  fields: [/* ... */]
});
```

2. **Register schema** in `sanity/schemaTypes/index.ts`

3. **Add to page builder** in `sanity/schemaTypes/pageBuilderType.ts`

4. **Create component** in `components/pagebuildercomponents/`:
```typescript
export function NewBlock({ /* props */ }) {
  return <section>...</section>;
}
```

5. **Add to PageBuilder switch** in `components/PageBuilder.tsx`

#### Modifying AI Parameters

Edit `app/api/replicate/route.ts`:
```typescript
const output = await replicate.run(MODEL, {
  input: {
    // Modify parameters here
    guidance: 4,  // Was 3
    num_inference_steps: 40,  // Was 30
  },
});
```

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm fix` | Auto-fix lint errors |
| `pnpm typegen` | Generate Sanity types |

---

## Deployment

### CI/CD Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │───▶│   Jenkins   │───▶│   Docker    │───▶│  Production │
│   (main)    │    │   Build     │    │   Image     │    │   Server    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Manual Deployment

```bash
# Build Docker image
docker build -t rotpunkt-visions .

# Run container
docker run -p 3000:3000 \
  --env-file .env.production \
  rotpunkt-visions

# Or use deployment script
./dockerDeployment.sh
```

### Production URLs

| Service | URL |
|---------|-----|
| Production | https://rotpunkt-visions.de |
| Sanity Studio | https://rotpunkt-visions.de/studio |

---

## Environment Configuration

### Required Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# Replicate AI
REPLICATE_API_TOKEN=r8_...

# MinIO Storage
MINIO_DOMAIN=minio.example.com
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-21
NEXT_PUBLIC_SANITY_STUDIO_URL=https://your-sanity-studio-url
NEXT_PUBLIC_SANITY_BROWSER_TOKEN=sk_live_readonly_optional
SANITY_VIEWER_TOKEN=sk_live_server_only
SANITY_STUDIO_PREVIEW_ORIGIN=http://localhost:3000
```

### Variable Categories

| Prefix | Usage |
|--------|-------|
| `NEXT_PUBLIC_` | Exposed to browser |
| No prefix | Server-only |

---

## Troubleshooting

### Common Issues

#### "Cold Start" Delays

**Symptom:** First image generation takes 2-3 minutes.

**Cause:** Replicate model needs to spin up.

**Solution:** The UI shows appropriate loading messages. Consider model warm-up strategies for production.

#### Double API Calls

**Symptom:** API called twice on component mount.

**Cause:** React Strict Mode or missing guards.

**Solution:** Use `useRef` guards:
```typescript
const hasTriggered = useRef(false);
useEffect(() => {
  if (hasTriggered.current) return;
  hasTriggered.current = true;
  // ... trigger action
}, []);
```

#### Image Upload Failures

**Symptom:** MinIO upload fails.

**Cause:** Network issues or credentials.

**Solution:** Check MinIO credentials and network connectivity. The upload function includes retry logic.

#### Supabase RLS Errors

**Symptom:** "Row level security policy violation"

**Cause:** JWT token not properly configured.

**Solution:** Verify Clerk JWT template "supabase" is configured correctly with the Supabase JWT secret.

### Debug Logging

API routes include request IDs for tracing:
```
[abc12345] 🚀 New generation request received
[abc12345] 👤 User: user_xyz
[abc12345] ⏱️ Replicate generation took 12.3s — 🔥 WARM
```

### Support

For issues:
1. Check browser console for client errors
2. Check server logs for API errors
3. Verify environment variables
4. Check external service status (Replicate, Supabase, MinIO)

---

## License

Proprietary - Rotpunkt Küchen GmbH

---

*Last updated: December 2024*
