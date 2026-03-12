# Bilingual Content Stabilization Report

**Date:** Checkpoint after stabilization verification  
**Mode:** Verify and stabilize only — no new features, no refactoring, no column renames.

---

## 1. Confirmed DB columns expected by code

The current implementation expects these **localized columns** in `public.content_items`:

| Column | Used in |
|--------|---------|
| `title_fi` | API POST/PATCH, content-items rowToPublic, ContentItemForm |
| `title_en` | API POST/PATCH, content-items rowToPublic, ContentItemForm |
| `slug_fi` | API POST/PATCH, content-items getContentBySlug (.eq), rowToPublic, ContentItemForm |
| `slug_en` | API POST/PATCH, content-items getContentBySlug (.eq), rowToPublic, ContentItemForm |
| `excerpt_fi` | API POST/PATCH, content-items rowToPublic, ContentItemForm |
| `excerpt_en` | API POST/PATCH, content-items rowToPublic, ContentItemForm |
| `body_fi` | API POST/PATCH, content-items getContentBySlug pickLocale, ContentItemForm |
| `body_en` | API POST/PATCH, content-items getContentBySlug pickLocale, ContentItemForm |
| `seo_title_fi` | API POST/PATCH, content-items DbContentItem, ContentItemForm |
| `seo_title_en` | API POST/PATCH, content-items DbContentItem, ContentItemForm |
| `seo_description_fi` | API POST/PATCH, content-items DbContentItem, ContentItemForm |
| `seo_description_en` | API POST/PATCH, content-items DbContentItem, ContentItemForm |

**Legacy columns** (required for fallback and dual-write):

- `title`, `slug`, `summary`, `body` — written by API; read by `rowToPublic` when `hasLocalized` is false.

**Consistent usage confirmed:**

- **Legacy short text:** `summary`
- **Localized short text:** `excerpt_fi`, `excerpt_en`
- No `summary_fi`/`summary_en` in code; no `excerpt` as a legacy column in writes (migration backfill may read `excerpt` if it exists).

---

## 2. Confirmed blockers

| Blocker | Impact |
|---------|--------|
| **DB migration not applied** | POST/PATCH insert/update into localized columns will fail. `getContentBySlug` uses `.eq("slug_fi", slug)` and `.eq("slug_en", slug)` — will fail if columns missing. |
| **Save/create/edit/publish** | All write to `title_fi`, `slug_fi`, `excerpt_fi`, `body_fi`, etc. — blocked until migration applied. |

---

## 3. What is now stable

- **Code alignment:** All references to localized columns use the 12 columns above consistently.
- **Field mapping:** `summary` (legacy) ↔ `excerpt_fi`/`excerpt_en` (localized). Form maps `excerpt_fi` → `summary` on save.
- **Fallback:** `rowToPublic` uses `db.summary ?? db.excerpt` for excerpt fallback; form init uses `initial?.summary ?? init?.excerpt` for `excerpt_fi`.
- **Public rendering:** `getContentBySlug(slug, locale)`, `getPublishedContentItems(locale)`, `getPublishedContentItemsByRouteSlug`, `getPublishedContentItemsByEventSlug` all receive locale.
- **Publish validation:** Requires `title_fi`, `slug_fi`, `body_fi`; returns clear error message.
- **Migration file:** `20250311000000_content_items_localized_fields.sql` adds all 12 columns with `add column if not exists` and conditional backfill.

---

## 4. What is still partial

| Area | Status |
|------|--------|
| **SEO metadata** | `generateMetadata` uses `item.title` and `item.excerpt`. Does not use `seo_title_fi/en` or `seo_description_fi/en`. Left as-is for stabilization. |
| **Admin list body** | `getAdminContentItems` returns `body: db.body` (legacy). Admin cards do not display body; edit loads full row. Low impact. |
| **Edit page heading** | Uses `item.title`. For new content, API syncs `title` on save. For legacy-only rows, `title` exists. Minor gap for localized-only rows never saved. |

---

## 5. What remains unverified

- **Migration applied or not:** Cannot confirm without DB access. Run:
  ```bash
  source .env.local 2>/dev/null || true
  npx tsx scripts/inspect-content-items-schema.ts
  ```
  Output shows which localized columns exist.
- **End-to-end flows:** After migration is confirmed, manually verify:
  - [ ] Create new content item
  - [ ] Edit existing item
  - [ ] Save draft
  - [ ] Publish
  - [ ] Load legacy row (no localized fields)
  - [ ] Render `/fi/content/[slug]`
  - [ ] Render `/en/content/[slug]`

---

## 6. Minimal next step after stabilization

1. Run `npx tsx scripts/inspect-content-items-schema.ts` with env set. If any localized column is MISSING → apply `supabase db push` (or run the migration manually).
2. If all localized columns exist → run through the end-to-end checklist above.
3. When flows pass → consider bilingual content workflow stable. Leave SEO metadata as partial for later.

---

## Verification script

Run from project root with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set:

```bash
npx tsx scripts/inspect-content-items-schema.ts
```

The script reports which columns exist and whether the migration appears applied.
