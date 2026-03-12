# Content CMS — Implementation Summary

## Overview

Content (blog/review/podcast/comparison) is fully managed in Supabase and Admin Studio. Static `lib/data/content.ts` is deprecated; all production content comes from the `content_items` table.

---

## Data Model

| Field | Notes |
|-------|-------|
| title, slug | Unique slug for URL |
| content_type | `blog` \| `review` \| `podcast` \| `comparison` |
| summary, body | Markdown body; preview in admin |
| hero_image | URL (external or Supabase) |
| episode_url | For podcast type only |
| related_route_slugs | Array of route slugs (`routes.slug`) — **implemented** |
| related_event_slugs | Array of event slugs (`events.slug`) — **implemented** |
| related_item_ids | **Deprecated.** Legacy; use related_route_slugs / related_event_slugs |
| author | Free text |
| status | `draft` \| `published` \| `archived` |
| published_at | Set on publish |

**Public `/content` list** excludes `content_type = 'podcast'` — those live on `/podcast` via `podcast_guests`.

---

## Cross-Linking (Implemented)

| Direction | Field | Public display |
|-----------|-------|----------------|
| Content → Routes | `related_route_slugs` | "Related routes" section on content detail |
| Content → Events | `related_event_slugs` | "Related events" section on content detail |
| Route → Content | — | "Related articles" (content items where `related_route_slugs` contains route slug) |
| Event → Content | — | "Related articles" (content items where `related_event_slugs` contains event slug) |

**Admin form:** Slug-based selectors. Routes from `getAdminRoutes()`, events from `getAdminEvents()`. Chips for selected items. No `RelatedItemsPicker` or `getItemsForContentPicker()`.

---

## Migrations

| Migration | Purpose |
|-----------|---------|
| `20250229100000_create_content_items.sql` | Create table, indexes, RLS, trigger |
| `20250229110000_content_items_author_archived.sql` | Add author, archived status, body NOT NULL |
| `20250309000000_content_items_related_route_slugs.sql` | Add related_route_slugs (text[]) |
| `20250310000000_content_items_related_event_slugs.sql` | Add related_event_slugs (text[]) |

### Run migrations

**Supabase local:**
```bash
supabase db reset   # applies all
# or
supabase migration up
```

**Supabase hosted:** `supabase db push` or run SQL manually.

---

## Manual Test Checklist

1. **Create draft content**
   - Go to `/[locale]/admin/content/new`
   - Fill title, slug (or auto-generate), content type, summary, body (markdown)
   - Add hero image URL (optional)
   - For podcast: add episode URL
   - Select related routes/events from slug-based pickers
   - Click **Save Draft**
   - Verify under **Luonnokset / Drafts**

2. **Preview**
   - Click **Esikatsele / Preview**
   - Verify title, summary, hero image, markdown-rendered body
   - For podcast: "Kuuntele jakso" when episode URL present

3. **Publish**
   - Click **Julkaise / Publish**
   - Verify published_at set; appears under **Julkaistut / Published**

4. **Public list & detail**
   - Go to `/[locale]/content` — podcast-type excluded
   - Filter by blog/review/comparison
   - Open detail — verify "Related routes" and "Related events" sections when set

5. **Archive**
   - Click **Arkistoi / Archive**
   - Verify moves to archived; disappears from public

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/data/content-items.ts` | getPublishedContentItems, getContentBySlug, getPublishedContentItemsByRouteSlug, getPublishedContentItemsByEventSlug |
| `components/admin/ContentItemForm.tsx` | Slug-based route/event pickers, chips, preview |
| `app/[locale]/admin/content/new/page.tsx` | Passes availableRoutes (getAdminRoutes), availableEvents (getAdminEvents) |
| `app/[locale]/admin/content/[id]/edit/page.tsx` | Same |

---

## Remaining TODOs

- **Admin auth:** Server-side API routes use signed `admin_auth` cookie (`ADMIN_SESSION_SECRET`). RLS bypassed via service role.
- **Restore from archive:** No "Restore" action; archived items stay archived.
- **Body translation:** Single language per item (no FI/EN body).
- **DELETE API:** No delete for content; archive only.
