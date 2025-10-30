# Prompt Generation Flow

## Prompt Construction

- Wizard steps defined in `components/wizard/wizardSteps.tsx` collect structured fields (`kind`, `color`, `style`, `environment`, etc.) and store them in the nanostore-based `wizardStore` state.
- Final submission at the wizard’s last screen triggers `KitchenWizardModal.tsx` to assemble a German-language paragraph combining every selection plus optional freeform “extra wishes.” The resulting text resembles:
  `Dann eine rot, modern Küche. Modern aussehend in einer urbanen Umgebung. Standort ist: … Zusätzliche Wünsche: …`
- Before the prompt is sent to Replicate, the API route prefixes the text with the finetune token `RDTDOT` and sets `finetune_id` to bind requests to the customized FLUX 1.1 Pro model.

## Generation Timeline

1. **Wizard Completion** – `onPromptReady` hides the modal, stores the final prompt in the `$prompt` atom, and transitions the UI to `ImageGenerator.tsx`.
2. **Client Request** – React Query POSTs to `/api/replicate` with the prompt payload and manages loading and error UI via the Lottie animation and status messages.
3. **API Authentication** – `app/api/replicate/route.ts` checks Clerk auth; unauthenticated calls return 401.
4. **Replicate Call** – The server sends the prompt to the Flux 1.1 Pro fine-tune, requesting a single 1:1 PNG, then blocks on `replicate.wait` until URLs are returned.
5. **Asset Handling** – Each temporary Replicate URL is downloaded and re-uploaded to MinIO (`lib/minioClient.ts`), yielding permanent HTTPS URLs with retry safeguards.
6. **Persistence** – Supabase `images` table receives those MinIO URLs, using the user’s Clerk-issued JWT for authorization.
7. **Response & UI Update** – The API returns the MinIO URLs; React Query resolves, the generated images render, and the first image opens in the viewer. The same URLs later appear on `/my-images` via Supabase queries.

This pipeline centralizes prompt assembly on the client, keeps Replicate access and asset storage on the server, and ensures every generated result is archived for immediate and future use.
