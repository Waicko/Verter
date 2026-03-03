# Content CMS — Implementation Summary

## Overview

Content (blog/review/podcast/comparison) is now fully managed in Supabase and Admin Studio. Static `lib/data/content.ts` is deprecated; all production content comes from `content_items` table.

---

## Migration

### How to run migrations locally

1. **Supabase local** (if using `supabase start`):
   ```bash
   supabase db reset   # applies all migrations
   ```
   Or apply incrementally:
   ```bash
   supabase migration up
   ```

2. **Supabase hosted project** (via Dashboard or CLI):
   - Push migrations: `supabase db push`
   - Or run SQL manually in SQL Editor:
     - `supabase/migrations/20250229100000_create_content_items.sql`
     - `supabase/migrations/20250229110000_content_items_author_archived.sql`

### Migration files

- `20250229100000_create_content_items.sql` — Creates `content_items` table, indexes, RLS, trigger
- `20250229110000_content_items_author_archived.sql` — Adds `author`, `archived` status, `body NOT NULL`

---

## Manual test checklist

1. **Create draft content**
   - Go to `/[locale]/admin/content/new`
   - Fill title, slug (or let auto-generate), content type, summary, body (markdown)
   - Add hero image URL (optional)
   - For podcast: add episode URL
   - Select related items (routes/events/camps) from picker
   - Click **Save Draft**
   - Verify it appears under **Luonnokset / Drafts**

2. **Preview**
   - In edit page, click **Esikatsele / Preview**
   - Verify title, summary, hero image, markdown-rendered body
   - For podcast, verify "Kuuntele jakso" button when episode URL present
   - Verify "Takaisin sisältöön / Back to content" link

3. **Publish**
   - Click **Julkaise / Publish**
   - Verify status becomes published, `published_at` is set
   - Verify item appears under **Julkaistut / Published**

4. **Public list & detail**
   - Go to `/[locale]/content`
   - Verify published item appears in list
   - Filter by type (blog/review/podcast/comparison)
   - Open detail page
   - Verify markdown body, hero image, related items section ("Liittyy"), "Kuuntele jakso" for podcast

5. **Archive**
   - In edit page, click **Arkistoi / Archive**
   - Confirm dialog
   - Verify item moves to **Arkistoidut / Archived**
   - Verify it disappears from `/[locale]/content` and `/[locale]/content/[slug]` (404)

---

## Changed / added files

### Added
- `supabase/migrations/20250229110000_content_items_author_archived.sql`
- `components/admin/RelatedItemsPicker.tsx`
- `CONTENT_CMS.md` (this file)

### Modified
- `lib/db/content-types.ts` — `author`, `archived`, `body` not null
- `lib/data/content-items.ts` — `getAdminContentItems("archived")`, body types
- `lib/data/items-supabase.ts` — `getItemsForContentPicker()`
- `app/api/admin/content/route.ts` — `author`, `body` default, `published_at` on publish
- `app/api/admin/content/[id]/route.ts` — `author`, `published_at` on publish
- `app/[locale]/admin/content/page.tsx` — Archived tab
- `app/[locale]/admin/content/new/page.tsx` — Pass `items` to form
- `app/[locale]/admin/content/[id]/edit/page.tsx` — Pass `items` to form
- `components/admin/ContentItemForm.tsx` — Author, Archive, RelatedItemsPicker, Preview (hero, markdown, Back link), episode_url only for podcast
- `components/admin/AdminContentItemCard.tsx` — Archived status style
- `app/[locale]/content/[slug]/page.tsx` — Hero image, section label "Liittyy"
- `messages/fi.json` — `tabArchived`, `backToContent`, `related`, `noItemsToLink`, `heroImageUrl`, `author`
- `messages/en.json` — Same keys

### Unchanged / deprecated
- `lib/data/content.ts` — Deprecated (empty array), not used by UI

---

## Remaining TODOs

- **RLS admin write**: Admin CRUD uses server-side API routes with `admin_auth` cookie check. Supabase client uses service role, so RLS is bypassed server-side. For production, consider:
  - Dedicated admin policy if using Supabase Auth, or
  - Keep current pattern (cookie + API routes).
- **Restore from archive**: No "Restore" action yet; archived items stay archived. Can be added later.
- **Body translation**: Content body is not translated in MVP; single language per item.
