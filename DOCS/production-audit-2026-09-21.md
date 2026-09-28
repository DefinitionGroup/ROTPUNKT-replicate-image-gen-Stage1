# Production audit — rotpunkt.ai (2026-09-21, updated 2026-09-28)

## 0. Update 2026-09-28 — no image is ever delivered — Confirmed, fixed in code

Since **2026-09-25** every generation on rotpunkt.ai (and rotpunkt-visions.de,
same model) hangs: the Replicate prediction on the fine-tune
`rotpunkt007/basemodel-5-2026` never leaves `starting` and fails after 24 h
with "Prediction failed to start". The client keeps polling, so the visitor
sees the loading screen until they give up. Four different users hit it
between 25 and 28 September (sets bd392ed2, 233e30ce, a58aefe3, b2cbbd60,
675213dc). Up to 24 September the same model completed in about 8 s.

**Cause**: Replicate no longer serves the fine-tune's weights. Its internal
endpoint `https://replicate.com/rotpunkt007/basemodel-5-2026/_weights`
answers 404, which is what the public runner reports when asked to load the
LoRA by model name. The training output itself still exists
(training `6rt0kj6cg9rmr0cwf128t1h9ac`, tarball on `replicate.delivery`,
172 MB, HEAD 200). Nothing in our code changed on that day; the account is
fine (a public model starts in 5 s).

**Verified workaround**: run the same weights through the public runner
`black-forest-labs/flux-dev-lora` with `lora_weights` = the tarball URL.
Production settings (16:9, 1 MP, 28 steps, guidance 3.2, LoRA 0.85,
seed 260805) render in 6.3 s and produce a proper Rotpunkt kitchen.

**Code changes** (uncommitted on `feat/redesign-sept26`):

- `lib/generationModel.ts` — the generation target. Default: public runner +
  trained weights URL. `REPLICATE_GENERATION_MODEL` (`owner/model:version`
  for the fine-tune, `owner/model` for a runner) and `REPLICATE_LORA_WEIGHTS`
  override it without a code change.
- `app/api/replicate/route.ts` — uses the target; `generation_sets.model_version`
  records it (the fine-tune path renamed `guidance_scale` → `guidance` and
  added `lora_weights`; everything else is identical so seeds stay comparable).
- `app/api/replicate/status/route.ts` — a prediction still in `starting`
  8 minutes after the set was created is cancelled and the set fails with
  "The image model did not start", so the studio shows the error state
  instead of polling forever.

**Still to do (needs you)**:

1. Weights are self-hosted (done 2026-09-28): private Hugging Face repo
   `mainframeai/rotpunktlora2026` (`flux-lora.safetensors`, 172 MB, same
   sha as the tarball; local copy in `arc/lora-weights/`). Verified with a
   fine-grained read token: 8 s at production settings, output
   byte-identical to the tarball run. Production env:

   ```
   REPLICATE_LORA_WEIGHTS=huggingface.co/mainframeai/rotpunktlora2026
   REPLICATE_LORA_HF_TOKEN=<fine-grained read token>
   ```

   The code default stays the `replicate.delivery` tarball, so a deploy
   without these two variables still works.
2. Open a Replicate support ticket: fine-tune `rotpunkt007/basemodel-5-2026`
   version `0672a909…`, weights endpoint 404 since 2026-09-25, predictions
   stuck in `starting`. If they restore it, switch back by setting
   `REPLICATE_GENERATION_MODEL` to the fine-tune string.
3. Deploy. The 6 stuck predictions on Replicate were cancelled; the affected
   `generation_sets` rows stay `processing` (harmless, no image exists).

**Also seen in the data** (14 days, 62 sets): 40 succeeded, 13 failed,
9 stuck. Of the 13 failures, every one with attempts is a quality-gate
rejection of both candidates, and the "Dutch angle" viewpoint fails the
camera hard check in all of its runs (5 of 5 sets on 09-21). Visitors who
choose that perspective never get an image. Worth a decision: drop the
camera hard check for that viewpoint, or drop the option.


Trigger: `Minified React error #418` in the console on rotpunkt.ai, plus
unspecified client complaints. Scope: what is publicly reachable without a
login, the code paths behind it, and the generation flow as far as it can be
read from code. Not covered: anything behind sign-in on production (no test
account was used), server logs, Sentry.

Deployment facts observed: rotpunkt.ai serves the redesign branch
(`feat/redesign-sept26`) from a Plesk host behind Cloudflare, **without**
`DEV_CONTENT`, so marketing content comes from Sanity. `main`
(rotpunkt-visions.de, Jenkins) is still the old design.

Status legend: **Confirmed** = reproduced or measured. **Likely** = follows
from code, not reproduced. **Check** = could not be verified from outside.

## 1. The reported error

### 1.1 React #418 on `/studio` for returning visitors — Confirmed, fixed locally

- **Repro**: open `/de/studio`, start a configuration, pick one option, reload.
  Console shows #418 on every load from then on.
- **Cause**: the wizard state is restored from `localStorage`
  (`app/store/wizardStore.ts`, `onMount`). nanostores runs that restore on the
  first `get()`, i.e. during the hydration render. The server rendered the
  start screen, the client rendered the saved step, React discarded the server
  HTML and re-rendered the page on the client.
- **Introduced by** the studio redesign: the old modal only read the store
  after a click, so the mismatch could not happen.
- **User impact**: the page still works, but returning visitors get a full
  client re-render (flash, slower first interaction, lost scroll position),
  and every occurrence is reported to Sentry as an unhandled error.
- **Fix** (`components/studio/studio-shell.tsx`): render an empty stage until
  the component has mounted, on server and client alike. Verified on the dev
  server with a saved state: step is restored, no hydration error.
- First-time visitors never saw the error, which is why it looked sporadic.

## 2. High — likely behind "unspecified issues"

### 2.1 Clerk runs with development keys in production — Confirmed

Response header `x-clerk-auth-reason: dev-browser-missing`, publishable key
`pk_test_…`, console warning from Clerk. Consequences:

- Sign-in goes through Clerk's dev-browser handshake (extra redirects, a
  `__clerk_db_jwt` query parameter). Browsers that restrict cross-site
  storage (Safari, Firefox strict, in-app browsers) can end in sign-in loops
  or silently signed-out sessions.
- Development instances have hard user and rate limits and show a
  "Development mode" badge in the sign-in dialog.
- Sessions are not shared with rotpunkt-visions.de.

Action: create a Clerk production instance for rotpunkt.ai, set
`pk_live`/`sk_live`, point the user webhook at the new domain.

### 2.2 Mobile header overflowed, menu button cut off — Confirmed, fixed locally

On phones the language toggle and the CTA pill were not hidden: `hidden
md:inline-flex` lost against the component's own `inline-flex`. The burger
button sat partly outside the viewport (right edge at 399 px of 375), the
"Visions" label collided with the toggle. Same in the app header, where
"Zur Startseite" also wrapped onto two lines. Fixed with `max-md:hidden` /
`max-sm:hidden` and `whitespace-nowrap`; the 4 px horizontal scroll in the
studio chip strip is gone too. Verified at 375 px.

### 2.3 Images are only saved while the browser keeps polling — Likely

Upload to MinIO, validation and the Supabase insert all happen inside
`POST /api/replicate/status`, which only runs when the client polls. There is
no Replicate webhook and the `generationSetId` lives only in component state.

- Phone locked, tab in background (react-query pauses interval polling),
  page reloaded or closed during the 30 s – 5 min wait → the prediction
  finishes and is billed, but the image is never stored and cannot be
  recovered (Replicate output URLs expire after about an hour).
- From the customer's side this is "I waited and got nothing".

Action: persist the running `generationSetId` (localStorage) and resume
polling on return; better, add a Replicate webhook that finalises the set
server-side.

### 2.4 "Auswahl ändern" during generation abandons the run — Likely

The rail shows "Auswahl ändern" while the image is still being generated.
Clicking it unmounts `ImageGenerator`; the running set is orphaned (see 2.3)
and the next "Bild erstellen" starts and bills a second one. Action: disable
the button while pending, or keep the generator mounted.

### 2.5 No sign-in page behind the auth redirect — Confirmed (pre-existing)

`/my-images` redirects signed-out visitors to `/de/sign-in?redirect_url=…`.
That route does not exist; they get the 404 page. Happens on expired sessions
and on shared or bookmarked gallery links. Action: add a `sign-in/[[...rest]]`
route with Clerk's `<SignIn />`, or open the modal instead of redirecting.

## 3. Medium — legal, content, SEO

### 3.1 Cookie banner does not appear on rotpunkt.ai — Confirmed

Console: "The domain ROTPUNKT.AI is not authorized to show the cookie banner
for domain group ID 3dadf7ea-…". No consent dialog is shown while Clerk,
Sentry and Sanity requests run. Action: add rotpunkt.ai to the domain group
in the Cookiebot manager.

### 3.2 No Impressum link on the production site — Confirmed

Footer on rotpunkt.ai shows only "Datenschutz" and "Rotpunkt Website", and
Datenschutz points to rotpunktkuechen.de. `/de/disclaimer` exists but nothing
links to it. The complete footer exists only in `content/content.md`
(`DEV_CONTENT=true`). Action: either set `DEV_CONTENT=true` on this host until
the content is in Sanity, or add the legal links in the Sanity footer.

### 3.3 Production homepage is much thinner than the design — Confirmed

Without `DEV_CONTENT` only hero and gallery render; manifest, promises, studio
teaser and closing are missing because Sanity has no such blocks yet. The
gallery shows the internal block title "Ticker Gallery" as its visible label.
Same decision as 3.2.

### 3.4 Unknown URLs answer 200 instead of 404 — Confirmed

`/de/gibt-es-nicht` renders the 404 page with HTTP 200. `/robots.txt` and
`/sitemap.xml` are redirected into the locale and end on the same soft 404,
so there is no robots file and no sitemap. Action: call `notFound()` in the
`[slug]` page, add `app/robots.ts` and `app/sitemap.ts`, exclude `txt|xml`
in the middleware matcher.

### 3.5 Runtime config file is never read — Confirmed (pre-existing)

`/CONF.DAT` is redirected to `/de/CONF.DAT` and answered with HTML, so the
`NEXT_PUBLIC_PROMPT_PIPELINE_V2` runtime switch has no effect; the build-time
default (on) always applies. Action: add `dat` to the matcher exclusions or
drop the mechanism.

### 3.6 `<html lang="de">` on English pages — Confirmed

The root layout hardcodes `lang="de"`; `/en` is announced as German to screen
readers, translation tools and search engines.

## 4. Low / to watch

- **Hero video**: 6 MB, `preload="metadata"`, fine on Wi-Fi; on mobile data
  the poster carries the first seconds. Consider a 720p variant for phones.
- **Preset images**: several sources are 0.7–4 MB PNG/JPG
  (`public/wizard-presets`). The optimizer serves 24–50 KB WebP in
  0.2–0.4 s once cached, but the first request per size is slow on a cold
  cache. `kind-wohnzimmer.png` (4 MB) is unused next to its JPG.
- **Browser support**: Tailwind v4 needs Safari 16.4+/Chrome 111+. Older
  iPads and locked-down corporate browsers get a broken layout. Pre-existing.
- **Browser back** leaves the studio instead of going one step back; the
  state is kept, but it surprises people on phones.
- **Contrast**: `ash` (#666) on black is 3.7:1, below AA for small text
  (placeholders, "offen" in the rail).
- **Tone**: the auth prompt says "Du", the rest of the site "Sie".
- **Cookiebot script attributes** differ between server and client HTML; a
  dev-only warning, not the #418.

## 5. Checked and fine

- All public routes answer (home, about, legal, studio; de and en).
- API routes reject unauthenticated calls with 401.
- MinIO sends CORS headers for `https://rotpunkt.ai`, so generated images
  with `crossOrigin="anonymous"` load on the new domain.
- Hero video and poster are served directly (no locale redirect).
- Sentry tunnel (`/monitoring`) accepts events.
- Cloudflare does not cache HTML (`cf-cache-status: DYNAMIC`).

## 6. Could not be verified from outside

- Sign-in, generation, quality gate, upscale and share on production.
- Which `QUALITY_GATE_MODE` production runs with.
- Sanity CORS origins for rotpunkt.ai (the MCP token lacks the grant; no CORS
  errors appeared in the console).
- Clerk webhook target and Supabase user sync for the new domain.
- Sentry issue list — the fastest way to see what clients actually hit.
  Filter by release and `url:*rotpunkt.ai*`.
- The studio option images stayed unloaded in the emulated phone view even
  though the requests returned 200. Probably an artefact of the embedded
  browser; worth one look on a real phone.
