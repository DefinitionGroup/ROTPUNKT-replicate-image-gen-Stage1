# General App Description

## Overview

- Marketing-focused Next.js 15 application that lets visitors design custom kitchen concepts through a guided wizard and generate AI imagery.
- Content is sourced from Sanity CMS and rendered via a page-builder so marketers can change layouts without deployments.
- Styling uses Tailwind CSS and Motion (Framer) to deliver a polished, animated experience.

## Generation Workflow

1. Wizard components (`components/wizard/*`) collect structured choices (including an inside/outside perspective toggle) stored in nanostores and convert them into a descriptive prompt.
2. `ImageGenerator.tsx` posts the prompt to `/api/replicate` using React Query, handling loading and error states.
3. The API route (`app/api/replicate/route.ts`) verifies Clerk auth, sends the prompt plus a curated negative prompt to Replicate (Flux 1.1 Pro fine-tune), awaits completion, and receives image URLs.
4. Server-side utilities (`lib/minioClient.ts`) download Replicate outputs, re-upload them to a MinIO bucket, and persist final URLs in the Supabase `images` table.
5. The API returns MinIO URLs so the client can immediately show the generated gallery and store entries for later access.

## Data & Integrations

- **Authentication:** Clerk middleware protects API routes and gated pages; unauthenticated users are redirected to sign in.
- **Storage:** MinIO stores generated image assets; Supabase tracks metadata and timestamps for user galleries.
- **CMS:** Sanity delivers dynamic sections (hero, wizard, tickers, etc.) via GROQ queries (`sanity/lib/queries.ts`).

## State Management & UX

- Persistent nanostores (`app/store/*`) remember wizard progress, modal visibility, and prompts across sessions.
- React Query centralizes async state, with a shared `QueryClient` (`app/get-query-client.ts`).
- Motion-based transitions and Lottie loading animations keep the wizard flow responsive and on-brand.
- The updated wizard modal uses a split layout with live prompt preview, quick presets, and a summary sidebar so users see their final request before generating.

## Key Entry Points

- `components/wizard/KitchenWizardModal.tsx`: assembles the AI prompt from user selections.
- `app/api/replicate/route.ts`: orchestrates Replicate calls, asset persistence, and Supabase writes.
- `components/PageBuilder.tsx`: maps Sanity-managed blocks into React components for the marketing site.
- `app/(site)/my-images/page.tsx`: authenticated gallery that surfaces previously generated images.
