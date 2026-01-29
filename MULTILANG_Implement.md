# 🌍 Multilingual Implementation Plan for Rotpunkt Vision Generator

## Executive Summary

This plan covers implementing **i18n (internationalization)** across both the **Next.js 15 frontend** and **Sanity CMS** backend, with automatic browser language detection and a language switcher in the navigation.

---

## 📋 Part 1: Overview of Languages

**Recommended initial languages:**
- 🇩🇪 **German (de)** – Default/primary (current state)
- 🇬🇧 **English (en)** – Secondary

Easily extendable to more languages later.

---

## 📋 Part 2: Architecture Decision

### Recommended Approach: **next-intl + Sanity Document Internationalization**

| Layer | Solution | Why |
|-------|----------|-----|
| **Next.js App** | `next-intl` | Best-in-class for App Router, supports Server Components, middleware-based routing |
| **Static UI Strings** | JSON translation files | Wizard labels, buttons, error messages |
| **Sanity CMS Content** | `@sanity/document-internationalization` plugin | Per-document translations with language selector |
| **Routing** | Locale prefix (`/de/...`, `/en/...`) | SEO-friendly, clear URL structure |

---

## 📋 Part 3: File Structure Changes

### New directories and files to create:

```
├── messages/                       # NEW: Translation JSON files
│   ├── de.json                     # German translations
│   └── en.json                     # English translations
├── i18n/                           # NEW: i18n configuration
│   ├── config.ts                   # Locale configuration
│   ├── request.ts                  # next-intl request config
│   └── routing.ts                  # Routing configuration
├── app/
│   └── (site)/
│       └── [locale]/               # NEW: Locale-prefixed routes
│           ├── layout.tsx          # Locale-aware layout
│           ├── page.tsx            # Home page
│           ├── [slug]/
│           │   └── page.tsx        # Dynamic pages
│           └── my-images/
│               └── page.tsx        # User gallery
├── components/
│   └── ui/
│       └── LanguageSwitcher.tsx    # NEW: Language toggle component
├── middleware.ts                   # MODIFIED: Add locale detection
```

---

## 📋 Part 4: Implementation Steps (Detailed)

### **Phase 1: Dependencies & Configuration**

#### 1.1 Install packages
```bash
pnpm add next-intl
pnpm add -D @sanity/document-internationalization
```

#### 1.2 Create i18n configuration files

**`i18n/config.ts`**
```typescript
export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'de';

export const localeNames: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
};
```

**`i18n/routing.ts`**
```typescript
import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always', // or 'as-needed' to hide default locale
});
```

**`i18n/request.ts`**
```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

---

### **Phase 2: Translation Files**

**`messages/de.json`** (Extract all German strings from current codebase)
```json
{
  "common": {
    "loading": "Lädt...",
    "error": "Ein Fehler ist aufgetreten",
    "close": "Schließen",
    "back": "Zurück",
    "next": "Weiter",
    "generate": "Generieren",
    "download": "Herunterladen",
    "share": "Teilen",
    "signIn": "Anmelden",
    "signUp": "Registrieren",
    "myImages": "Meine Bilder"
  },
  "wizard": {
    "title": "Küchen-Konfigurator",
    "steps": {
      "kind": {
        "label": "Raumfokus",
        "description": "Welche Art von Raum soll visualisiert werden?"
      },
      "color": {
        "label": "Farbwelt",
        "description": "Definieren Sie die dominante Farbgebung"
      },
      "style": {
        "label": "Stilrichtung",
        "description": "Welcher Einrichtungsstil passt am besten?"
      }
    },
    "options": {
      "kueche": "Küche",
      "wohnzimmer": "Wohnzimmer",
      "modern": "Modern",
      "zeitlos": "Zeitlos"
    },
    "final": {
      "extraWishes": "Zusätzliche Wünsche",
      "generateButton": "Bild generieren"
    }
  },
  "imageGallery": {
    "title": "Meine generierten Bilder",
    "empty": "Noch keine Bilder generiert",
    "upscale": "Hochskalieren",
    "highRes": "✨ High-Res"
  },
  "auth": {
    "signInRequired": "Bitte melden Sie sich an, um Bilder zu generieren"
  },
  "metadata": {
    "title": "Rotpunkt Küchen AI Bildgenerator",
    "description": "Generieren Sie Ihre Traumküche mit KI"
  }
}
```

**`messages/en.json`**
```json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "generate": "Generate",
    "download": "Download",
    "share": "Share",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "myImages": "My Images"
  },
  "wizard": {
    "title": "Kitchen Configurator",
    "steps": {
      "kind": {
        "label": "Room Focus",
        "description": "What type of room should be visualized?"
      },
      "color": {
        "label": "Color World",
        "description": "Define the dominant color palette"
      },
      "style": {
        "label": "Style Direction",
        "description": "Which interior style fits best?"
      }
    },
    "options": {
      "kueche": "Kitchen",
      "wohnzimmer": "Living Room",
      "modern": "Modern",
      "zeitlos": "Timeless"
    },
    "final": {
      "extraWishes": "Additional Wishes",
      "generateButton": "Generate Image"
    }
  },
  "imageGallery": {
    "title": "My Generated Images",
    "empty": "No images generated yet",
    "upscale": "Upscale",
    "highRes": "✨ High-Res"
  },
  "auth": {
    "signInRequired": "Please sign in to generate images"
  },
  "metadata": {
    "title": "Rotpunkt Kitchen AI Image Generator",
    "description": "Generate your dream kitchen with AI"
  }
}
```

---

### **Phase 3: Middleware Update**

**`middleware.ts`** (Updated)
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  '/',
  '/:locale',
  '/:locale/sign-in(.*)',
  '/:locale/sign-up(.*)',
  '/api/(.*)',
  '/studio(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip i18n for API routes and studio
  if (req.nextUrl.pathname.startsWith('/api') || 
      req.nextUrl.pathname.startsWith('/studio')) {
    return;
  }
  
  // Apply internationalization
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!studio|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

---

### **Phase 4: Route Structure Refactoring**

#### 4.1 New folder structure under `app/(site)/[locale]/`

Move existing routes into locale-prefixed structure:

| Current | New |
|---------|-----|
| `app/(site)/page.tsx` | `app/(site)/[locale]/page.tsx` |
| `app/(site)/[slug]/page.tsx` | `app/(site)/[locale]/[slug]/page.tsx` |
| `app/(site)/my-images/page.tsx` | `app/(site)/[locale]/my-images/page.tsx` |
| `app/(site)/layout.tsx` | `app/(site)/[locale]/layout.tsx` |

#### 4.2 Update layout to use locale

**`app/(site)/[locale]/layout.tsx`**
```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {/* Navbar, children, Footer */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

### **Phase 5: Language Switcher Component**

**`components/ui/LanguageSwitcher.tsx`**
```tsx
"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    // Replace current locale in pathname
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {localeNames[locale as Locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={loc === locale ? 'bg-accent' : ''}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Add to Navbar** between auth buttons:
```tsx
<LanguageSwitcher />
```

---

### **Phase 6: Sanity CMS Internationalization**

#### 6.1 Install and configure the plugin

**`sanity.config.ts`** (Updated)
```typescript
import { documentInternationalization } from '@sanity/document-internationalization';

export default defineConfig({
  // ... existing config
  plugins: [
    // ... existing plugins
    documentInternationalization({
      supportedLanguages: [
        { id: 'de', title: 'Deutsch' },
        { id: 'en', title: 'English' },
      ],
      schemaTypes: ['page', 'menu'], // Document types to translate
    }),
  ],
});
```

#### 6.2 Update Sanity queries to filter by locale

**`sanity/lib/queries.ts`** (Updated)
```typescript
export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug && language == $locale][0]{
    ...,
    content[]{...}
  }
`);

export const HOME_PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == "home" && language == $locale][0]{
    ...,
    content[]{...}
  }
`);

export const NAVBAR_QUERY = defineQuery(`
  *[_type == "menu" && menuType == "navbar" && language == $locale][0]{
    // ... existing projection
  }
`);
```

#### 6.3 Update page schema for language field

The `@sanity/document-internationalization` plugin automatically adds a `language` field to configured document types.

---

### **Phase 7: Component Updates**

#### 7.1 Wizard Steps (make translatable)

**Current:** Labels hardcoded in `wizardSteps.tsx`
**New:** Use translation keys

```tsx
// wizardSteps.tsx - Updated structure
export const wizardSteps: WizardStepDefinition[] = [
  {
    key: "kind",
    labelKey: "wizard.steps.kind.label",      // Translation key
    descriptionKey: "wizard.steps.kind.description",
    options: [
      { value: "kueche", labelKey: "wizard.options.kueche" },
      { value: "wohnzimmer", labelKey: "wizard.options.wohnzimmer" },
      // ...
    ],
    icon: <FaPalette />,
  },
  // ...
];
```

**In components, use `useTranslations` hook:**
```tsx
import { useTranslations } from 'next-intl';

function WizardStep({ step }) {
  const t = useTranslations();
  
  return (
    <div>
      <h2>{t(step.labelKey)}</h2>
      <p>{t(step.descriptionKey)}</p>
    </div>
  );
}
```

#### 7.2 Prompt Builder (keep German for AI)

**Important:** The AI prompt should remain in German regardless of UI language (the model is fine-tuned on German prompts).

```typescript
// promptBuilder.ts - Add locale parameter but always build German prompt
export function buildPrompt({
  selections,
  extraWishes,
  locale, // Accept locale but use German labels internally
}: {
  selections: WizardState["selectedOptions"];
  extraWishes?: string;
  locale?: string;
}): PromptBuildResult {
  // Always use German labels for AI prompt generation
  // The wizardStepsGerman constant maintains German-only labels
}
```

---

### **Phase 8: Update All Components**

Components requiring translation updates:

| Component | Changes Needed |
|-----------|----------------|
| `navbar.tsx` | Add `LanguageSwitcher`, translate menu items from Sanity |
| `Footer.tsx` | Translate via Sanity content |
| `KitchenWizardModal.tsx` | Use `useTranslations()` for all UI text |
| `WizardStep.tsx` | Translate labels, descriptions |
| `WizardFinal.tsx` | Translate buttons, placeholders |
| `ImageGenerator.tsx` | Translate loading states, errors |
| `ImageModal.tsx` | Translate action buttons |
| `UpscaleModal.tsx` | Translate UI text |
| `ImagesGalleryClient.tsx` | Translate empty state, titles |
| `not-found.tsx` | Translate 404 message |

---

## 📋 Part 5: Migration Checklist

### Before Starting:
- [ ] Back up current Sanity dataset
- [ ] Create feature branch `feature/i18n`

### Phase 1 - Setup (Day 1):
- [ ] Install `next-intl` package
- [ ] Create `i18n/` configuration files
- [ ] Create `messages/de.json` with all existing German strings
- [ ] Create `messages/en.json` with English translations

### Phase 2 - Routing (Day 2):
- [ ] Update `middleware.ts` with locale detection
- [ ] Restructure `app/(site)/` to `app/(site)/[locale]/`
- [ ] Update all internal `Link` components to include locale
- [ ] Add `next.config.ts` i18n configuration

### Phase 3 - Components (Day 3-4):
- [ ] Create `LanguageSwitcher.tsx`
- [ ] Add language switcher to Navbar
- [ ] Update all components to use `useTranslations()`
- [ ] Ensure wizard prompts remain German for AI

### Phase 4 - Sanity (Day 5):
- [ ] Install `@sanity/document-internationalization`
- [ ] Configure plugin in `sanity.config.ts`
- [ ] Update Sanity queries to include `language` parameter
- [ ] Migrate existing content to German language documents
- [ ] Create English versions of pages in Sanity

### Phase 5 - Testing (Day 6):
- [ ] Test browser language detection
- [ ] Test language switcher functionality
- [ ] Test all wizard steps in both languages
- [ ] Test image generation (prompts still German)
- [ ] Test Sanity content in both languages
- [ ] Test SEO (hreflang tags, URLs)

---

## 📋 Part 6: Configuration Files Needed

**`next.config.ts`** addition:
```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
  // ... existing config
};

export default withNextIntl(nextConfig);
```

---

## 📋 Part 7: URL Structure

| Current URL | German URL | English URL |
|-------------|------------|-------------|
| `/` | `/de` | `/en` |
| `/about` | `/de/about` | `/en/about` |
| `/my-images` | `/de/my-images` | `/en/my-images` |

**Browser detection flow:**
1. User visits `/` → middleware checks `Accept-Language` header
2. If German preferred → redirect to `/de`
3. If English preferred → redirect to `/en`
4. Otherwise → redirect to `/de` (default)
5. User selection via switcher is stored in cookie for future visits

---

## 📋 Part 8: Files Summary

### New Files to Create (12 files):
1. `i18n/config.ts`
2. `i18n/routing.ts`
3. `i18n/request.ts`
4. `messages/de.json`
5. `messages/en.json`
6. `components/ui/LanguageSwitcher.tsx`
7. `app/(site)/[locale]/layout.tsx`
8. `app/(site)/[locale]/page.tsx`
9. `app/(site)/[locale]/[slug]/page.tsx`
10. `app/(site)/[locale]/my-images/page.tsx`

### Files to Modify (15+ files):
1. `middleware.ts` - Add locale detection
2. `next.config.ts` - Add next-intl plugin
3. `sanity.config.ts` - Add i18n plugin
4. `sanity/lib/queries.ts` - Add language filtering
5. `components/ui/navbar.tsx` - Add language switcher
6. `components/wizard/wizardSteps.tsx` - Translation keys
7. `components/wizard/KitchenWizardModal.tsx` - useTranslations
8. `components/wizard/WizardStep.tsx` - useTranslations
9. `components/wizard/WizardFinal.tsx` - useTranslations
10. `components/ImageModal.tsx` - useTranslations
11. `components/UpscaleModal.tsx` - useTranslations
12. `components/ImagesGalleryClient.tsx` - useTranslations
13. `components/ui/not-found.tsx` - useTranslations
14. `package.json` - Add dependencies
15. All page builder components - useTranslations for static text

---

## ✅ Implementation Status

- [x] Plan created and saved
- [x] Phase 1: Dependencies & Configuration
  - [x] Installed `next-intl`
  - [x] Installed `@sanity/document-internationalization`
  - [x] Created `i18n/config.ts`
  - [x] Created `i18n/routing.ts`
  - [x] Created `i18n/request.ts`
  - [x] Updated `next.config.ts` with next-intl plugin
- [x] Phase 2: Translation Files
  - [x] Created `messages/de.json` with all German strings
  - [x] Created `messages/en.json` with English translations
- [x] Phase 3: Middleware & Routing
  - [x] Updated `middleware.ts` with locale detection
- [x] Phase 4: Route Structure Refactoring
  - [x] Created `app/(site)/[locale]/layout.tsx`
  - [x] Created `app/(site)/[locale]/page.tsx`
  - [x] Created `app/(site)/[locale]/[slug]/page.tsx`
  - [x] Created `app/(site)/[locale]/my-images/page.tsx`
  - [x] Updated parent layout to passthrough
- [x] Phase 5: Language Switcher Component
  - [x] Created `components/ui/LanguageSwitcher.tsx`
  - [x] Integrated into Navbar (desktop & mobile)
- [x] Phase 6: Sanity CMS Internationalization
  - [x] Added document-internationalization plugin to `sanity.config.ts`
  - [x] Updated Sanity queries to filter by locale
- [x] Phase 7: Component Updates ✅ COMPLETED
  - [x] `navbar.tsx` - Added language switcher & useTranslations
  - [x] `not-found.tsx` - Added useTranslations
  - [x] `components/wizard/WizardFinal.tsx` - Added useTranslations
  - [x] `components/wizard/WizardIntro.tsx` - Added useTranslations
  - [x] `components/wizard/WizardHeader.tsx` - Added useTranslations
  - [x] `components/wizard/ImageGenerator.tsx` - Added useTranslations
  - [x] `components/ImageModal.tsx` - Added useTranslations
  - [x] `components/UpscaleModal.tsx` - Added useTranslations
  - [x] `components/ImagesGalleryClient.tsx` - Added useTranslations
- [ ] Phase 8: Testing
  - [ ] Test browser language detection
  - [ ] Test language switcher functionality
  - [ ] Test all wizard steps in both languages
  - [ ] Test image generation (prompts still German)
  - [ ] Test Sanity content in both languages
  - [ ] Test SEO (hreflang tags, URLs)

---

## 🚀 Build Status

**Latest Build: ✅ PASSED**

Routes generated:
- `/[locale]` → `/de`, `/en`
- `/[locale]/my-images` → `/de/my-images`, `/en/my-images`
- `/[locale]/[slug]` (dynamic)

---

## 🚀 Next Steps

The core i18n infrastructure is now complete! To finish the implementation:

1. **Test the full user flow** in both languages
2. **Create translated Sanity content** in the CMS for English pages
3. **Test SEO** - hreflang meta tags are handled automatically by next-intl
4. **Add translations for wizardSteps.tsx options** - currently using static German labels that could be translated in the future

---

## 📎 Annex A: Wizard i18n Implementation Issues & Fixes

### Problem Summary

After implementing the core i18n infrastructure, the wizard component continued to display German text even when the English locale was selected. This required additional refactoring of the wizard step definitions.

---

### Issue 1: Hardcoded German Labels in wizardSteps.tsx

**Symptom:** Wizard UI showed German labels regardless of selected language.

**Root Cause:** The `wizardSteps.tsx` file had all labels hardcoded as German strings:
```typescript
// BEFORE - Hardcoded German
export type WizardOption = {
  value: string;
  label: string;  // ← Always German: "Küche", "Wohnzimmer", etc.
  hint?: string;
  image?: string;
};
```

**Fix:** Changed to use translation keys instead of hardcoded strings:
```typescript
// AFTER - Translation keys
export type WizardOption = {
  value: string;
  labelKey: string;      // Translation key: "wizard.options.kueche"
  germanLabel: string;   // German label for AI prompts (see Issue 2)
  hintKey?: string;
  image?: string;
};
```

**Files Modified:**
- `components/wizard/wizardSteps.tsx` - Changed type and all option definitions
- `components/wizard/useTranslatedWizardSteps.ts` - NEW: Hook to translate keys at runtime
- `components/wizard/KitchenWizardModal.tsx` - Use translated steps
- `components/wizard/WizardSummaryPanel.tsx` - Use translated steps
- `components/wizard/WizardStep.tsx` - Use `TranslatedWizardOption` type
- `components/wizard/WizardMultiSelectStep.tsx` - Use `TranslatedWizardOption` type
- `components/wizard/WizardColorStep.tsx` - Use `TranslatedWizardOption` type

---

### Issue 2: Build Failure - promptBuilder.ts Breaking Change

**Symptom:** Build failed with type error:
```
Type error: Property 'label' does not exist on type 'WizardOption'.
```

**Root Cause:** The `promptBuilder.ts` file was still accessing the old `.label` property which no longer existed after renaming to `.labelKey`:
```typescript
// BROKEN CODE
return step?.options.find((opt) => opt.value === value)?.label ?? value;
//                                                        ^^^^^ no longer exists
```

**Why This Happened:** During the refactoring, we focused on UI components but forgot that `promptBuilder.ts` also consumes `WizardOption` types. This file builds prompts for the Replicate AI model.

**Critical Insight:** The AI prompts **must remain in German** regardless of UI language because the Replicate model is fine-tuned on German prompts. Simply using translation keys would have broken the AI generation.

**Fix:** Added a separate `germanLabel` field specifically for AI prompt generation:
```typescript
export type WizardOption = {
  value: string;
  labelKey: string;      // For UI translation
  germanLabel: string;   // For AI prompt (always German)
  hintKey?: string;
  image?: string;
};
```

And updated `promptBuilder.ts` to use `germanLabel`:
```typescript
// FIXED CODE
return step?.options.find((opt) => opt.value === value)?.germanLabel ?? value;
```

---

### Is This a Common Mistake?

**Yes, this is a very common i18n implementation pitfall.**

#### Pattern: "Incomplete Refactoring"
When changing a type definition (like `label` → `labelKey`), it's easy to miss files that:
- Import the type indirectly
- Use the type in less obvious ways (like prompt generation)
- Are server-side only and not tested during UI development

#### Pattern: "Language Leakage"
In AI-powered applications, it's crucial to distinguish between:
1. **UI strings** - Should be translated based on user locale
2. **AI input strings** - May need to remain in a specific language (training data language)

This project's Replicate model is fine-tuned on German prompts. Translating the prompts to English would likely degrade image quality or produce unexpected results.

#### Prevention Strategies:
1. **Search for all usages** before changing a type property name
2. **Run full build** after type changes, not just TypeScript compilation
3. **Document AI language requirements** early in the i18n plan
4. **Separate concerns** - Keep AI-facing data structures distinct from UI-facing ones

---

### Architecture Decision: Dual Labels

The final architecture uses **dual labels** for wizard options:

| Field | Purpose | Example |
|-------|---------|---------|
| `labelKey` | Translation key for UI display | `"wizard.options.kueche"` → "Kitchen" (EN) / "Küche" (DE) |
| `germanLabel` | Fixed German label for AI prompts | `"Küche"` (always German) |

This ensures:
- ✅ UI respects user's language preference
- ✅ AI prompts remain in German for optimal model performance
- ✅ Clear separation of concerns
