# Verter Architecture Audit

**Date:** 2025-03-06  
**Scope:** Full repository scan, Supabase tables, admin routes, API routes, static placeholders

---

## STEP 1 — CURRENT STATE ANALYSIS

### 1) Admin Routes Under `/admin/*`

| Route | File(s) | Status |
|-------|---------|--------|
| `/admin` | `app/[locale]/admin/page.tsx` | ✅ Functional (Dashboard: Team, Content) |
| `/admin/team/new` | `app/[locale]/admin/team/new/page.tsx` | ✅ Functional |
| `/admin/team/[id]/edit` | `app/[locale]/admin/team/[id]/edit/page.tsx` | ✅ Functional |
| `/admin/podcast` | `app/[locale]/admin/podcast/page.tsx` | ✅ Functional |
| `/admin/podcast/guests/new` | `app/[locale]/admin/podcast/guests/new/page.tsx` | ✅ Functional |
| `/admin/podcast/guests/[id]/edit` | `app/[locale]/admin/podcast/guests/[id]/edit/page.tsx` | ✅ Functional |
| `/admin/content` | `app/[locale]/admin/content/page.tsx` | ✅ Functional |
| `/admin/content/new` | `app/[locale]/admin/content/new/page.tsx` | ✅ Functional |
| `/admin/content/[id]/edit` | `app/[locale]/admin/content/[id]/edit/page.tsx` | ✅ Functional |
| `/admin/events` | `app/[locale]/admin/events/page.tsx` | ⚠️ Uses `events` table (no migration) |
| `/admin/events/new` | `app/[locale]/admin/events/new/page.tsx` | ⚠️ Same |
| `/admin/events/edit/[id]` | `app/[locale]/admin/events/edit/[id]/page.tsx` | ⚠️ Same |
| `/admin/routes` | `app/[locale]/admin/routes/page.tsx` | ✅ Functional |
| `/admin/routes/new` | `app/[locale]/admin/routes/new/page.tsx` | ✅ Functional |
| `/admin/routes/edit/[id]` | `app/[locale]/admin/routes/edit/[id]/page.tsx` | ✅ Functional |
| ~~`/admin/submissions`~~ | *Removed* | ❌ Previously broken (items table) |
| ~~`/admin/items/new`~~ | *Removed* | ❌ Previously broken (items table) |
| ~~`/admin/items/[id]/edit`~~ | *Removed* | ❌ Previously broken (items table) |

### 2) API Routes Under `/api/admin/*`

| Route | Method | Table Used | Status |
|-------|--------|------------|--------|
| `/api/admin/auth` | DELETE | — | ✅ Functional |
| `/api/admin/team` | GET, POST | `team_members` | ✅ Functional |
| `/api/admin/team/[id]` | GET, PUT, DELETE | `team_members` | ✅ Functional |
| `/api/admin/podcast/guests` | GET, POST | `podcast_guests` | ✅ Functional |
| `/api/admin/podcast/guests/[id]` | GET, PUT, DELETE | `podcast_guests` | ✅ Functional |
| `/api/admin/content` | GET, POST | `content_items` | ✅ Functional |
| `/api/admin/content/[id]` | GET, PUT, DELETE | `content_items` | ✅ Functional |
| `/api/admin/events` | GET | `events` | ⚠️ Uses `events` (no migration) |
| `/api/admin/events/create` | POST | `events` | ⚠️ Same |
| `/api/admin/events/update` | PUT | `events` | ⚠️ Same |
| `/api/admin/events/delete` | DELETE | `events` | ⚠️ Same |
| `/api/admin/events/publish` | POST | `events` | ⚠️ Same |
| `/api/admin/events/unpublish` | POST | `events` | ⚠️ Same |
| `/api/admin/routes` | GET | `routes` | ✅ Functional |
| `/api/admin/routes/create` | POST | `routes` | ✅ Functional |
| `/api/admin/routes/update` | PUT | `routes` | ✅ Functional |
| `/api/admin/routes/delete` | DELETE | `routes` | ✅ Functional |
| `/api/admin/routes/publish` | POST | `routes` | ✅ Functional |
| `/api/admin/routes/unpublish` | POST | `routes` | ✅ Functional |
| `/api/admin/routes/upload` | POST | Storage `gpx` | ✅ Functional |
| ~~`/api/admin/items`~~ | *Removed* | `items` | ❌ Broken (table missing) |
| ~~`/api/admin/items/[id]`~~ | *Removed* | `items` | ❌ Broken |

**Other API routes:**
| Route | Table Used | Status |
|-------|------------|--------|
| `/api/items/submit` | `items` | ❌ Broken (table missing) |
| `/api/ratings` | `ratings` | ✅ Functional |
| `/api/podcast/guest-request` | `podcast_guest_requests` | ✅ Functional |

### 3) Supabase Tables Referenced in Code

| Table | Migration Exists | Used By |
|-------|------------------|---------|
| `routes` | ✅ `20250306000000_create_routes.sql` | Admin routes, public routes page, routes-db |
| `content_items` | ✅ `20250229100000_create_content_items.sql` | Admin content, public content pages |
| `team_members` | ✅ `20250228120000_create_team_members.sql` | Admin team, about page |
| `podcast_guests` | ✅ `20250229000000_create_podcast_guests.sql` | Admin podcast, podcast page |
| `podcast_guest_requests` | ✅ (same migration) | Guest request form |
| `ratings` | ✅ `20250227100000_create_ratings.sql` | Ratings API |
| `rating_aggregates` | ✅ (same migration) | items-supabase, items-queries |
| `items` | ✅ `20250227000000_create_items.sql` | **May not exist in DB** — admin-items, items-supabase, items-queries, api/items/submit. Error: "Could not find table 'public.items'" |
| `events` | ❌ **No migration** | Events page, admin events, SubmitEventForm. Table may exist if created manually |

### 4) Static Placeholder Content

| File | Content | Used By |
|------|---------|---------|
| `lib/data/routes.ts` | 8 hardcoded routes (Paloheinä, Nuuksio, etc.) | `lib/data/items.ts`, `app/sitemap.ts`, `app/[locale]/page.tsx`, `app/[locale]/routes/[slug]/page.tsx` |
| `data/events.ts` | ~20 hardcoded events/camps | `lib/data/items.ts` |
| `lib/data/items.ts` | Merges routes + events into `items` array | `lib/data/items-loader.ts`, `lib/data/items-queries.ts`, `app/[locale]/events/[slug]/page.tsx` |
| `lib/data/content.ts` | Empty array (deprecated) | `app/sitemap.ts` |

### 5) Admin Pages Referencing Missing/Broken Tables

| Page/Component | Table | Issue |
|----------------|-------|-------|
| ~~Admin Dashboard (items sections)~~ | `items` | Removed — was broken |
| ~~/admin/submissions~~ | `items` | Removed — was broken |
| Content admin — RelatedItemsPicker | `items` | `getItemsForContentPicker()` returns `[]` if items missing |
| Content detail — related items | `items` | `getPublishedItemsByIds()` fails silently |
| `/submit` form (SubmitEventForm) | `events` | Inserts into `events` — table may not exist |
| `/api/items/submit` | `items` | **Broken** — inserts into non-existent `items` |

---

## STEP 2 — TARGET ARCHITECTURE

### Supabase Tables (Final Structure)

| Table | Purpose | CRUD Support |
|-------|---------|--------------|
| `events` | Races, camps, events | create, edit, publish/unpublish, delete |
| `routes` | GPX routes | create, edit, publish/unpublish, delete |
| `podcast_guests` | Podcast guests | create, edit, publish/hide, delete |
| `content_items` | Articles, blog, reviews | create, edit, publish/unpublish, delete |
| `team_members` | About / team | create, edit, publish/unpublish, delete |

**Supporting tables:** `podcast_guest_requests`, `ratings`, `rating_aggregates`, Storage bucket `gpx`

### Admin Sections (Target)

| Section | Route | Table |
|---------|-------|-------|
| Events | `/admin/events` | `events` |
| Routes | `/admin/routes` | `routes` |
| Podcast | `/admin/podcast` | `podcast_guests` |
| Content | `/admin/content` | `content_items` |
| Team | `/admin/team` | `team_members` |

### Public Pages (Target)

| Page | Data Source |
|------|-------------|
| `/` | content_items, team_members, routes (DB) |
| `/events` | `events` |
| `/events/[slug]` | `events` (or merge into single events table) |
| `/routes` | `routes` |
| `/routes/[slug]` | `routes` |
| `/podcast` | `podcast_guests` |
| `/content` (or `/articles`) | `content_items` |
| `/content/[slug]` | `content_items` |
| `/about` | `team_members` |

---

## STEP 3 — FILES TO REMOVE (Unused / Broken)

### Remove Entirely

| File | Reason |
|------|--------|
| `lib/data/admin-items.ts` | References `items` table — orphaned |
| `components/admin/AdminItemCard.tsx` | Only used for items — orphaned |
| `components/admin/ItemForm.tsx` | Only used for items — orphaned |
| `lib/data/items-supabase.ts` | References `items` — used by content picker & events loader; refactor or remove |
| `lib/data/items-queries.ts` | References `items` — used by route/event detail fallbacks; refactor |
| `lib/db/types.ts` | DbItem types for `items` — orphaned |
| `app/api/items/submit/route.ts` | Inserts into `items` — broken |
| `scripts/seed-items.ts` | Seeds `items` — table doesn't exist |
| `data/events.ts` | Static events — placeholder |
| `lib/data/items.ts` | Merges static routes+events — placeholder |
| `lib/data/routes.ts` | Static routes — placeholder |
| `lib/data/content.ts` | Deprecated empty — remove |
| `components/EventCard.tsx` | Uses `Event` from data/events — check usage |
| `components/ItemCard.tsx` | Uses VerterItem/RouteItem — check if still needed |
| `components/admin/ItemDetailPreview.tsx` | If items-only — remove |
| `components/admin/RelatedItemsPicker.tsx` | Depends on items — refactor or remove |
| `lib/data/rating-aggregates.ts` | Used only by items — evaluate |
| `lib/data/items-loader.ts` | loadEventsData uses items — refactor |

### Refactor (Do Not Delete Yet)

| File | Action |
|------|--------|
| `app/sitemap.ts` | Replace `routesWithDensity` with DB routes; replace `contentItems` with `getPublishedContentItems()` |
| `app/[locale]/page.tsx` | Replace `routesWithDensity` with `getPublishedRoutes()` |
| `app/[locale]/routes/[slug]/page.tsx` | Remove `getRouteBySlug` items fallback; use only `getPublishedRouteBySlug`; remove static `routes` import |
| `app/[locale]/events/[slug]/page.tsx` | Switch to `events` table or remove items fallback |
| `lib/data/content-items.ts` | Remove or replace `getItemsForContentPicker`; simplify `related_item_ids` (could point to routes only) |
| `app/[locale]/admin/content/new/page.tsx` | Remove `getItemsForContentPicker` or replace with routes-only picker |
| `app/[locale]/admin/content/[id]/edit/page.tsx` | Same |
| `components/admin/ContentItemForm.tsx` | Replace items picker with routes picker or remove |
| `app/[locale]/content/[slug]/page.tsx` | Replace `getPublishedItemsByIds` with routes-only or remove related section |

---

## STEP 4 — DATA SOURCE CONSISTENCY

| Public Page | Current Source | Target | Status |
|-------------|-----------------|--------|--------|
| `/events` | `events` table (direct) | `events` | ✅ OK if table exists; ❌ no migration |
| `/events/[slug]` | `items` + static fallback | `events` or items | ❌ Inconsistent |
| `/routes` | `routes` (Supabase) | `routes` | ✅ OK |
| `/routes/[slug]` | `routes` + items + static | `routes` only | ⚠️ Remove fallbacks |
| `/podcast` | `podcast_guests` | `podcast_guests` | ✅ OK |
| `/content` | `content_items` | `content_items` | ✅ OK |
| `/content/[slug]` | `content_items` + items (related) | `content_items` + routes | ⚠️ Refactor related |
| `/about` | `team_members` | `team_members` | ✅ OK |
| `/` (home) | routes (static), content, team | routes (DB), content, team | ⚠️ Replace routes |

---

## STEP 5 — OUTPUT SUMMARY

### 1) Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PUBLIC SITE                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  /              → routes (STATIC), content_items, team_members            │
│  /events        → events table (NO MIGRATION)                            │
│  /events/[slug] → items table (BROKEN) + static fallback                 │
│  /routes        → routes table ✅                                         │
│  /routes/[slug] → routes + items + static fallback                       │
│  /podcast       → podcast_guests ✅                                       │
│  /content       → content_items ✅                                        │
│  /content/[slug]→ content_items + items (related)                        │
│  /about         → team_members ✅                                         │
│  /submit        → events (insert) or items (api/submit - BROKEN)         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         ADMIN STUDIO                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  /admin           → Dashboard (Team, Content) ✅                          │
│  /admin/team      → team_members ✅                                       │
│  /admin/podcast   → podcast_guests ✅                                     │
│  /admin/content   → content_items ✅ (picker uses items - broken)         │
│  /admin/events    → events table ⚠️                                       │
│  /admin/routes    → routes ✅                                             │
│  (removed) submissions, items                                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE TABLES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  routes              ✅ Migration exists, used                           │
│  content_items        ✅ Migration exists, used                           │
│  team_members         ✅ Migration exists, used                           │
│  podcast_guests       ✅ Migration exists, used                           │
│  podcast_guest_requests ✅ Used                                           │
│  ratings, rating_aggregates ✅ Used                                        │
│  items                ⚠️ Migration exists, TABLE MAY NOT EXIST in DB     │
│  events               ❌ NO MIGRATION (may exist if created manually)    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2) Recommended Final Architecture

```
PUBLIC:                    ADMIN:                     SUPABASE:
/          ← routes,       /admin/events    ←→        events
  content,                   /admin/routes   ←→        routes
  team                      /admin/podcast  ←→        podcast_guests
/events    ← events        /admin/content   ←→        content_items
/routes    ← routes       /admin/team      ←→        team_members
/routes/[slug]
/podcast   ← podcast_guests
/content   ← content_items  (related: routes only)
/about     ← team_members
```

### 3) Files to Remove (Consolidated)

**Delete:**
- `lib/data/admin-items.ts`
- `lib/data/items-supabase.ts`
- `lib/data/items-queries.ts`
- `lib/data/items.ts`
- `lib/data/items-loader.ts` (after refactoring events/routes loaders)
- `lib/data/routes.ts`
- `lib/data/content.ts`
- `data/events.ts`
- `lib/db/types.ts` (DbItem)
- `app/api/items/submit/route.ts`
- `scripts/seed-items.ts`
- `components/admin/AdminItemCard.tsx`
- `components/admin/ItemForm.tsx`
- `components/admin/ItemDetailPreview.tsx` (if items-only)
- `components/admin/RelatedItemsPicker.tsx` (or refactor)
- `components/EventCard.tsx` (if unused)
- `components/ItemCard.tsx` (if unused after routes migration)

### 4) Files to Keep (Core)

**Data layer:**
- `lib/data/routes-db.ts`
- `lib/data/content-items.ts` (refactor: remove items picker)
- `lib/data/team.ts`
- `lib/data/podcast.ts`
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`

**Admin:**
- All admin pages for events, routes, podcast, content, team
- AdminNav, AdminDashboardClient (current state)
- RouteForm, AdminRoutesClient, etc.

**Public:**
- All page components
- Map, elevation, filter components

### 5) Missing Supabase Tables

| Table | Action |
|-------|--------|
| `events` | **Add migration** — used by events page, admin events, SubmitEventForm. Schema: id, title, date, location, registration_url, description, status |
| `items` | **Optional** — if table exists in DB, keep; if not, remove all references and rely on events + routes separately |

### 6) Broken Admin Sections

| Section | Issue |
|---------|-------|
| Content — Related items picker | `getItemsForContentPicker()` queries `items` — returns [] if table missing |
| Content detail — "Liittyy" section | `getPublishedItemsByIds()` queries `items` — fails |
| Events | May work if `events` table was created manually; no migration in repo |
| Submit page | SubmitEventForm inserts into `events`; api/items/submit inserts into `items` (broken) |

---

## RECOMMENDED IMPLEMENTATION ORDER

1. **Add `events` table migration** (if not exists)
2. **Remove items dependency** from content (routes-only related picker or remove)
3. **Refactor sitemap** to use DB routes and content
4. **Refactor homepage** to use DB routes
5. **Refactor routes/[slug]** to remove items/static fallbacks
6. **Refactor events/[slug]** to use events table only
7. **Remove or repurpose** `/api/items/submit` (submit could go to events only)
8. **Delete** static placeholder files and orphaned components
9. **Clean up** lib/data/* — consolidate loaders
