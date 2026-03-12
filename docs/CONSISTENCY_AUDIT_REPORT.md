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

### 1. Admin CRUD Gaps

| Section | Missing |
|---------|---------|
| Content | No DELETE API or UI |
| Team | No DELETE API or UI |
| Podcast guests | No DELETE API or UI |

### 2. Content vs Podcast Overlap

- `content_items` has `content_type = 'podcast'` — podcast-type articles appear on `/content` and homepage
- `/podcast` uses `podcast_guests` only (guest-centric model)
- **Result:** Two separate podcast representations; `content_type = 'podcast'` in content_items is for podcast-related articles, separate from guest listings. See `docs/PODCAST_ARCHITECTURE_PLAN.md` for future consolidation.

### 3. Filter System

- **Routes:** `RouteFilterBar` + `routes-filters.ts` — area, distance, ascent, has_gpx, sort — **working**
- **Content:** `FilterBar` (from `components/filters`) + `content-filters.ts` — content_type, author, sort — **working**
- **Events:** `FilterSelect` for `type` (race, camp, community) — **working**; `getPublishedEvents(typeFilter)` filters by `events.type`
- **Podcast:** `podcast-filters.ts` exists but **not wired into** `/podcast` UI

### 4. Sitemap Gaps

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

- Events type filter is **implemented** (race, camp, community).
- Podcast filter config exists but is not wired into `/podcast` UI.

### 5. `related_item_ids` (Deprecated)

- Legacy column in `content_items`; semantics unclear.
- **Canonical linking:** `related_route_slugs` and `related_event_slugs` (slug arrays) are used for content ↔ routes and content ↔ events. Admin uses slug-based pickers (`getAdminRoutes`, `getAdminEvents`).

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

| Current | Note |
|---------|------|
| `related_item_ids` (content_items) | Deprecated. Use `related_route_slugs` and `related_event_slugs` for linking. |
| `RouteFilterBar` imports from `FilterBar` | Consider extracting `DistanceRange`, `ElevationRange` to shared module if refactoring. |

### Legacy Tables (Do Not Use; Consider Migration Cleanup)

| Table | Status |
|-------|--------|
| `items` | Legacy; migrations exist but table may not be in DB; no active app code uses it |
| `ratings`, `rating_aggregates` | FK to `items`; broken if items removed |

---

## E. Recommended Next Implementation Order

1. **Add DELETE for content, team, podcast guests** — Small API + UI changes for completeness.

2. **Wire podcast filters** — `podcast-filters.ts` exists; connect to `/podcast` page if needed.

3. **Podcast architecture decision** — Choose one:
   - **Option A:** Implement `podcast_episodes` + `podcast_episode_guests` per plan; remove `podcast` from `content_items` content_type.
   - **Option B:** Keep current guest-centric model; document that `content_type = 'podcast'` in content_items is for podcast-related articles, separate from guest listings.

4. **Clean up legacy code** — Remove `ItemCard`, `SubmitForm`, legacy `FilterBar` (after extracting types), and unused types from `lib/types.ts`.

5. **Ratings** — Either migrate to `route_id` and `routes` table, or remove ratings feature if not in use.

6. **Expand sitemap** — Add `/events`, `/podcast`, `/submit`, `/podcast-guest` if desired for SEO.

---

## Summary

- **Public and admin pages are Supabase-backed** with no placeholder/static data in active use.
- **Tables in use:** `routes`, `events`, `content_items`, `team_members`, `podcast_guests`, `podcast_guest_requests`. Legacy `items` table is deprecated.
- **Admin auth:** Unified — signed `admin_auth` cookie (set via `/api/admin/auth`) used by all admin sections; requires `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
- **Content cross-linking:** Slug-based `related_route_slugs` and `related_event_slugs`; admin picker uses `getAdminRoutes` and `getAdminEvents`; public detail pages show related content/routes/events.
- **Events type:** `events.type` (race, camp, community) implemented; filter wired in UI.
- **GPX upload and route detail** work end-to-end with correct slug and GPX URL logic.
- **Admin CRUD** is complete for events and routes; content, team, and podcast lack delete.
- **Filter system** is implemented for routes, content, and events; podcast filter config exists but is not wired.
