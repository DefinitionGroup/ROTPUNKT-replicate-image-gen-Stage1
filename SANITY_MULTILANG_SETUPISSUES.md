# Sanity & Next.js Multilingual Setup: Issues & Solutions

This document outlines the hiccups and challenges encountered during the implementation of internationalization (i18n) for the Rotpunkt project, along with their solutions.

## 1. Schema Configuration: "Unknown field found"
**Problem:** The Sanity Studio or build process threw "Unknown field found" errors for the `language` field.
**Cause:** The `@sanity/document-internationalization` plugin requires a `language` field to exist on the document types it manages, but this field was missing from our `page` and `menu` schemas.
**Solution:** Added the `language` field (read-only/hidden) to `sanity/schemaTypes/pageType.ts` and `sanity/schemaTypes/components/menu.ts`.

## 2. Language Switcher 404s
**Problem:** Switching languages (e.g., from `/de/ueber-uns` to English) incorrectly redirected to `/en/ueber-uns` (which returns 404) instead of `/en/about-us`.
**Cause:** The `LanguageSwitcher` component was only replacing the locale prefix in the URL path, unaware of the actual translated slug structure.
**Solution:**
- Created a Nanostores store (`store/translations.ts`) to manage current page translations on the client.
- Updated `PAGE_QUERY` to fetch `translation.metadata` values.
- Implemented a `TranslationSetter` component to populate the store with valid translated slugs.
- Updated `LanguageSwitcher` to look up the target locale's slug from the store before navigating.

## 3. Path Alias & Import Errors
**Problem:** Imports like `@/store/translations` failed during build/runtime.
**Cause:** The new `store` directory was initially placed in the project root, but `tsconfig.json` alias configuration (or Next.js convention) expected it inside `app/` or needed explicit mapping.
**Solution:** Moved `store/translations.ts` to `app/store/translations.ts` (or ensured consistent alias usage).

## 4. Menu Links Not Localizing
**Problem:** Menu items (Navbar/Footer) linked to the "English" page document. When viewing the site in German, the menu still pointed to the English slug (or required manual duplication of menus for every language).
**Cause:** The standard reference expansion `page->slug.current` always retrieves the slug of the *referenced* document, ignoring the current context's language requirements.
**Solution:** Updated `NAVBAR_QUERY` and `FOOTER_QUERY` to use a robust subquery:
```groq
"slug": select(linkType == "internal" => coalesce(
  *[_type == "translation.metadata" && references(^.page._ref)][0].translations[_key == $locale][0].value->slug.current,
  page->slug.current
))
```
This dynamically finds the translation of the linked page corresponding to the current `$locale`.

## 5. Home Page Routing (`/en` failing)
**Problem:** Visiting `localhost:3000/en` resulted in empty content or partial rendering errors, while `/de` worked.
**Cause:** The `HOME_PAGE_QUERY` hardcoded a check for `slug.current == "home"`. However, in Sanity, the English home page had been created with the slug `home-en` (to avoid conflicts or via default behavior), so the query returned nothing.
**Solution:** Updated `HOME_PAGE_QUERY` to accept a list of valid home slugs:
```groq
slug.current in ["home", "home-en"]
```

## 6. Debugging Sanity Queries (Auth Issues)
**Problem:** Attempting to query Sanity directly via MCP tools or simple scripts often failed with "Unauthorized" or "Session" errors.
**Cause:** Local development environments sometimes lack the correct session context for direct API calls to private datasets.
**Solution:** Created a standalone `debug-sanity.js` (and `debug-slugs.js`) script using `@sanity/client` with a hardcoded `SANITY_VIEWER_TOKEN` (or one from `.env.local`) to reliably inspect data structures and verify schema assumptions (like "does `translation.metadata` actually exist?").

## 7. Hardcoded UI Text (IntroCard)
**Problem:** The "Jetzt starten" button in the Wizard IntroCard was hardcoded in German.
**Solution:**
- Added `"startNow"` keys to `messages/en.json` and `messages/de.json`.
- Refactored `IntroCard.tsx` to use `useTranslations('wizard.intro')`.

---

## Best Practices Checklist for Future i18n Work
- **Check Metadata First:** Always verify `translation.metadata` exists and references the correct documents.
- **Dynamic Slugs:** Never assume a slug is just "translated-word". Always look it up via the metadata relationship.
- **Fallback Logic:** Queries should gracefully fallback (using `coalesce`) if a translation is missing, rather than breaking the UI.
- **Debug Scripts:** Keep `debug-slugs.js` handy to quickly list all page slugs and IDs when routing acts up.
