# Verter Project Consistency Audit Report

**Date:** 2025-03-06  
**Scope:** Codebase, admin studio, and Supabase architecture alignment  
**Goal:** Verify single source of truth (Supabase) before implementing search, filtering, and further features.

---

## A. What is Fully Working

### Public Pages (Supabase-backed)

| Page | Data Source | Status |
|------|-------------|--------|
| `/` (homepage) | `getPublishedRoutes()`, `getPublishedContentItems()`, `getPublishedTeamMembers()` | ✅ All from Supabase |
| `/routes` | `getPublishedRoutes()` → `routes` table | ✅ |
| `/routes/[slug]` | `getPublishedRouteBySlug()` → `routes` table | ✅ Uses slug; GPX via `getGpxDownloadUrl()` |
| `/content` | `getPublishedContentItems()` → `content_items` table | ✅ |
| `/content/[slug]` | `getContentBySlug()` → `content_items` table | ✅ |
| `/events` | Direct Supabase query → `events` table | ✅ |
| `/events/[slug]` | `getEventBySlugOrId()` → `events` table | ✅ Slug preferred, id fallback |
| `/podcast` | `getFeaturedPodcastGuest()`, `getPastPodcastGuests()` → `podcast_guests` table | ✅ Uses dedicated table, not content_items |
| `/about` | `getPublishedTeamMembers()` → `team_members` table | ✅ |
| `/submit` | `SubmitEventForm` → inserts into `events` via anon client | ✅ |

### Admin Pages (Supabase-backed)

| Page | Table(s) | CRUD | Status |
|------|----------|------|--------|
| `/admin/events` | `events` | Create, Read, Update, Delete, Publish, Unpublish | ✅ |
| `/admin/routes` | `routes` | Create, Read, Update, Delete, Publish, Unpublish | ✅ |
| `/admin/content` | `content_items` | Create, Read, Update | ✅ |
| `/admin/content/[id]/edit` | `content_items` | Edit form exists | ✅ |
| `/admin/team` | `team_members` | Create, Read, Update | ✅ |
| `/admin/team/[id]/edit` | `team_members` | Edit form exists | ✅ |
| `/admin/podcast` | `podcast_guests`, `podcast_guest_requests` | Create, Read, Update (guests); Read (requests) | ✅ |

### GPX Flow

- **Upload:** `RouteForm` → `POST /api/admin/routes/upload` → Supabase Storage `gpx` bucket → returns `path`, `distance_km`, `ascent_m`
- **Create/Edit:** `gpx_path` stored in `routes` table
- **Public detail:** `RouteDetailWithGpx` uses `getGpxDownloadUrl(route.gpx_path)` → fetches and parses GPX for map/elevation
- **Download link:** Uses same `getGpxDownloadUrl()` for direct download

### Sitemap

- Uses `getPublishedRoutes()` and `getPublishedContentItems()` (Supabase)
- Includes static paths: `/`, `/routes`, `/content`, `/leirit`, `/camps`, `/about`

### Data Modules

- `lib/data/routes-db.ts` — routes, GPX URL logic
- `lib/data/events-db.ts` — events
- `lib/data/content-items.ts` — content_items
- `lib/data/team.ts` — team_members
- `lib/data/podcast.ts` — podcast_guests, podcast_guest_requests

---

## B. What is Partially Working

### 1. Admin Auth Inconsistency

- **Routes admin:** Uses `x-admin-token` header + `ADMIN_TOKEN` env var (token stored in `localStorage`)
- **Other admin (events, content, team, podcast):** Uses `admin_auth` cookie (set via `/api/admin/auth`)

**Impact:** Two different auth mechanisms; routes admin feels separate from the rest.

### 2. Admin CRUD Gaps

| Section | Missing |
|---------|---------|
| Content | No DELETE API or UI |
| Team | No DELETE API or UI |
| Podcast guests | No DELETE API or UI |

### 3. Content vs Podcast Overlap

- `content_items` has `content_type = 'podcast'` — podcast-type articles appear on `/content` and homepage
- `/podcast` uses `podcast_guests` only (guest-centric model)
- **Result:** Two separate podcast representations; `content_type = 'podcast'` in content_items is redundant with podcast_guests

### 4. Events: `?type=camp` Ignored

- `/events?type=camp` and `/leirit`, `/camps` redirect to `/events?type=camp`
- `events` table has **no `type` column** — all events are fetched; URL param is not used
- **Result:** "Camps" vs "events" distinction is not implemented in data or UI

### 5. Filter System

- **Routes:** `RouteFilterBar` + `routes-filters.ts` — area, distance, ascent, has_gpx, sort — **working**
- **Content:** `FilterBar` (from `components/filters`) + `content-filters.ts` — content_type, author, sort — **working**
- **Events:** `events-filters.ts` exists but **not wired into** `/events` UI
- **Podcast:** `podcast-filters.ts` exists but **not wired into** `/podcast` UI

### 6. Sitemap Gaps

- Missing: `/events`, `/podcast`, `/submit`, `/podcast-guest`
- `/leirit` and `/camps` are in static paths but redirect to `/events` — acceptable

---

## C. What is Still Missing

### 1. Podcast Episodes (Planned, Not Implemented)

- `docs/PODCAST_ARCHITECTURE_PLAN.md` describes `podcast_episodes` and `podcast_episode_guests` tables
- **No migrations exist** for these tables
- Current model: guest-centric (one guest ≈ one episode via `episode_url`)

### 2. Content and Team Delete

- No `DELETE` handlers for `content_items` or `team_members`
- No delete buttons in admin UI

### 3. Podcast Guest Delete

- No `DELETE` handler for `podcast_guests`

### 4. Events/Podcast Filters in UI

- Filter configs exist but are not connected to the pages

### 5. `related_item_ids` Semantics

- Stored as array of string IDs; unclear whether they reference `routes`, legacy `items`, or something else
- No picker or validation that IDs exist

---

## D. What Should Be Removed or Renamed

### Remove (Orphaned / Broken)

| Item | Reason |
|------|--------|
| `components/ItemCard.tsx` | Never imported; uses `VerterItem` (route/camp/event union) — legacy |
| `components/SubmitForm.tsx` | Never imported; calls `/api/items/submit` which does not exist |
| `components/FilterBar.tsx` (root) | Only `DistanceRange`/`ElevationRange` types are used; full component with `VerterItemType` (route, camp, event) is legacy — consider extracting types to shared module and removing the component |
| `lib/types.ts` — `VerterItem`, `RouteItem`, `CampItem`, `EventItem`, `VerterItemBase` | Legacy; not used by active pages (routes use `DbRoute`, events use `DbEvent`, etc.) |
| `lib/types.ts` — `Route`, `RouteWithDensity` | Legacy; not used |
| `app/api/ratings/route.ts` | Uses `item_id` → `ratings` table FK to `items`; `items` is legacy. Either migrate to `route_id` or remove |

### Rename / Clarify

| Current | Suggested | Reason |
|---------|-----------|--------|
| `related_item_ids` (content_items) | `related_route_ids` or document as "route IDs" | Clarify that these reference `routes.id` |
| `RouteFilterBar` imports from `FilterBar` | Extract `DistanceRange`, `ElevationRange` to `lib/types/filters.ts` | Reduce coupling to legacy FilterBar |

### Legacy Tables (Do Not Use; Consider Migration Cleanup)

| Table | Status |
|-------|--------|
| `items` | Legacy; migrations exist but table may not be in DB; no active app code uses it |
| `ratings`, `rating_aggregates` | FK to `items`; broken if items removed |

---

## E. Recommended Next Implementation Order

1. **Unify admin auth** — Use either cookie or token consistently for all admin sections (recommend cookie to match events/content/team/podcast).

2. **Add DELETE for content, team, podcast guests** — Small API + UI changes for completeness.

3. **Wire events and podcast filters** — `events-filters.ts` and `podcast-filters.ts` already exist; connect to page components.

4. **Clarify or implement events type** — Either add `type` column to `events` (camp vs event) and filter by it, or remove `?type=camp` from URLs and docs.

5. **Podcast architecture decision** — Choose one:
   - **Option A:** Implement `podcast_episodes` + `podcast_episode_guests` per plan; remove `podcast` from `content_items` content_type.
   - **Option B:** Keep current guest-centric model; document that `content_type = 'podcast'` in content_items is for podcast-related articles, separate from guest listings.

6. **Clean up legacy code** — Remove `ItemCard`, `SubmitForm`, legacy `FilterBar` (after extracting types), and unused types from `lib/types.ts`.

7. **Ratings** — Either migrate to `route_id` and `routes` table, or remove ratings feature if not in use.

8. **Expand sitemap** — Add `/events`, `/podcast`, `/submit`, `/podcast-guest` if desired for SEO.

---

## Summary

- **Public and admin pages are Supabase-backed** with no placeholder/static data in active use.
- **No legacy `items` system** is used in app code; `items` table and related APIs are deprecated.
- **Podcast uses `podcast_guests`** (dedicated table), not `content_items` for the podcast page; overlap exists only via `content_type = 'podcast'` in content.
- **GPX upload and route detail** work end-to-end with correct slug and GPX URL logic.
- **Admin CRUD** is complete for events and routes; content, team, and podcast lack delete.
- **Filter system** is implemented for routes and content; events and podcast configs exist but are not wired.
