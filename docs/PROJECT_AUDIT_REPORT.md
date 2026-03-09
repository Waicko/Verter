# Verter Project Audit Report

Full codebase analysis as of March 2025.

---

## 1. PROJECT STRUCTURE

### Framework & Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| React | 19 |
| i18n | next-intl (FI/EN, locale prefix always) |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| Maps | Leaflet, MapLibre GL, @mapbox/togeojson |
| Charts | Chart.js (elevation profile) |
| Markdown | react-markdown |

### Main Folders

```
verter/
├── app/                    # Next.js App Router
│   ├── [locale]/           # Locale-prefixed routes (fi, en)
│   │   ├── page.tsx        # Homepage
│   │   ├── routes/         # Public routes list + [slug] detail
│   │   ├── events/         # Public events list + [slug] detail
│   │   ├── content/        # Public content list + [slug] detail
│   │   ├── podcast/        # Podcast hub
│   │   ├── about/          # Team/about page
│   │   ├── submit/         # Submission hub, event, route, success
│   │   ├── suggest/        # Redirects → /submit
│   │   ├── camps/          # Redirects → /events?type=camp
│   │   ├── leirit/         # Redirects → /events?type=camp
│   │   ├── disclaimer/
│   │   ├── podcast-guest/  # Guest request form
│   │   └── admin/          # Admin CRUD
│   ├── admin/              # Redirect → /fi/admin
│   ├── events/[slug]/       # Legacy redirect → /[locale]/events/[slug]
│   └── api/                # API routes
├── components/             # Shared UI components
│   ├── admin/              # Admin forms, nav
│   ├── filters/            # FilterBar, FilterSelect, FilterSort
│   ├── routes/             # RouteDetailWithGpx, ElevationProfile, RouteMap
│   └── ...                 # RouteCard, ContentCard, etc.
├── lib/                    # Business logic
│   ├── data/               # Supabase queries (routes-db, events-db, content-items, team, podcast)
│   ├── db/                 # Type definitions (content-types, team-types)
│   ├── search/             # Filter engine, content-filters, event-filters
│   ├── supabase/           # Client (browser) + server client
│   ├── route-gpx.ts        # Client-side GPX → GeoJSON + elevation
│   ├── route-gpx-stats.ts   # Server-side GPX stats (distance, ascent)
│   └── metadata-types.ts   # Source/rights/verification types
├── messages/               # en.json, fi.json (i18n)
├── i18n/                   # routing, navigation
└── supabase/migrations/    # SQL migrations
```

### Routing Structure

- **Default locale:** `fi`
- **Locales:** `fi`, `en` (from `i18n/routing.ts`)
- **Prefix:** `always` — all paths prefixed by locale (e.g. `/fi/routes`, `/en/events`)
- **Middleware:** `next-intl/middleware` — matcher excludes `api`, `_next`, `admin`, `events`, static assets

### Public vs Admin vs API

| Area | Path | Auth |
|------|------|------|
| Public | `/[locale]/*` | None |
| Admin | `/[locale]/admin/*` | Cookie `admin_auth` via `AdminGate` |
| API | `/api/*` | Admin routes use `checkAdmin()`; submit routes use service role |

### Where Things Live

| Concern | Location |
|--------|----------|
| Public pages | `app/[locale]/` (routes, events, content, podcast, about, submit) |
| Admin pages | `app/[locale]/admin/` (team, content, events, routes, podcast, submissions) |
| API routes | `app/api/` — `admin/*`, `routes/submit`, `ratings`, `podcast/guest-request` |
| Database queries | `lib/data/` — routes-db, events-db, content-items, team, podcast, admin-dashboard |
| Types | `lib/db/*-types.ts`, `lib/metadata-types.ts` |

---

## 2. DATA MODEL

### Database Tables (Supabase)

#### `routes`
**Purpose:** GPX routes for trail runners (distance, ascent, map, elevation profile).

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| title | text | |
| area | text | |
| distance_km | numeric | From GPX or manual |
| ascent_m | numeric | From GPX or manual |
| description | text | |
| gpx_path | text | Path in `gpx` bucket |
| status | text | `draft` \| `published` |
| slug | text | Unique, used in URL |
| created_at | timestamptz | |
| source_type, source_name, source_url | text | Source metadata |
| submitted_by_name, submitted_by_email | text | |
| rights_basis, license_name, license_url | text | |
| verification_status | text | |
| route_origin_type, route_origin_name, route_origin_url | text | Routes only |
| submitted_by_strava_url, approved_by_verter, approved_by_name, approved_at | text/boolean | Trust verification |
| tested_by_team, tested_notes | boolean/text | |

**RLS:** Policy defined but **RLS never enabled** — policies have no effect. App filters by `status='published'` at query level.

**Usage:** Public routes list/detail, admin CRUD, public route submission.

---

#### `events`
**Purpose:** Races, camps, community events.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| title | text | |
| slug | text | Unique, nullable |
| type | text | `race` \| `camp` \| `community` |
| date | date | |
| location | text | |
| registration_url | text | |
| description | text | |
| status | text | `draft` \| `published` |
| created_at, updated_at | timestamptz | |
| source_type … verification_status | text | Same as routes |

**RLS:** Enabled. Policies: public read published, anyone can insert draft.

**Usage:** Public events list/detail, admin CRUD, public event submission.

---

#### `content_items`
**Purpose:** Blog, review, comparison articles (podcast excluded from public `/content`).

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| title | text | |
| slug | text | Unique |
| content_type | text | `blog` \| `review` \| `podcast` \| `comparison` |
| summary | text | |
| body | text | Markdown |
| hero_image | text | URL |
| related_item_ids | jsonb | Array of IDs |
| episode_url | text | For podcast type |
| published_at | date | |
| author | text | |
| status | text | `draft` \| `published` \| `archived` |
| created_at, updated_at | timestamptz | |
| source_type … verification_status | text | Same pattern |

**RLS:** Enabled. Public read published.

**Usage:** Public content list/detail (podcast excluded), admin CRUD. Podcast-type managed via podcast admin.

---

#### `team_members`
**Purpose:** About-page team.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| name | text | |
| role_fi, role_en | text | |
| tagline_fi, tagline_en | text | |
| strava_url | text | |
| image_url | text | |
| sort_order | integer | |
| status | text | `draft` \| `published` \| `archived` |
| created_at, updated_at | timestamptz | |

**RLS:** Enabled. Public read published.

**Usage:** About page, admin team CRUD.

---

#### `podcast_guests`
**Purpose:** Podcast guests (episodes).

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| name | text | |
| role_fi, role_en | text | |
| tagline_fi, tagline_en | text | |
| image_url | text | |
| links | jsonb | |
| episode_url | text | |
| featured | boolean | |
| status | text | `published` \| `hidden` |
| published_at | date | |
| created_at, updated_at | timestamptz | |

**RLS:** Enabled. Public read published.

**Usage:** Podcast page, admin podcast CRUD.

---

#### `podcast_guest_requests`
**Purpose:** Guest request form submissions.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| name | text | |
| email | text | |
| message | text | |
| created_at | timestamptz | |

**RLS:** Enabled. Anyone can insert.

**Usage:** `/[locale]/podcast-guest` form → `POST /api/podcast/guest-request`.

---

#### `items` (Legacy)
**Purpose:** Old unified table for routes/events/camps. Superseded by `routes` and `events`.

**Status:** Deprecated. Admin items pages redirect to dashboard. Still referenced by `ratings`, `rating_aggregates`.

---

#### `ratings` (Broken)
**Purpose:** User ratings, one per user per item.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| item_id | uuid | FK → items(id) |
| user_id | uuid | |
| rating | integer | 1–5 |
| winter_run | boolean | |
| status | text | `active` \| `hidden` |
| created_at, updated_at | timestamptz | |

**Status:** Depends on `items`. Not migrated to `routes`. `getRatingAggregates()` exists but not used.

---

#### `rating_aggregates` (Broken)
**Purpose:** Cached rating stats per item.

**Status:** Same as `ratings` — tied to legacy `items`, not used.

---

### Status Fields Summary

| Table | Status Values | Use |
|-------|---------------|-----|
| routes | draft, published | Draft = unreviewed submission |
| events | draft, published | Same |
| content_items | draft, published, archived | Archive = soft delete |
| team_members | draft, published, archived | Same |
| podcast_guests | published, hidden | No draft; hidden = not shown |

### Slug Usage

| Table | Slug | Unique | Nullable |
|-------|------|--------|----------|
| routes | slug | Yes | No |
| events | slug | Yes | Yes |
| content_items | slug | Yes | No |

### Relations

- No FKs between `routes`, `events`, `content_items`, `team_members`, `podcast_guests`.
- `related_item_ids` in content_items: array of UUIDs; semantics ambiguous (routes vs content items).
- `ratings` / `rating_aggregates` → `items` (legacy).

---

## 3. STORAGE

### Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `gpx` | Yes | GPX route files |

### What Is Stored

- **GPX files only** — route tracks for map and elevation.

### Uploads

1. **Admin routes**
   - `POST /api/admin/routes/upload`
   - Path: `{timestamp}-{sanitized-name}.gpx`
   - Returns `path`, `distance_km`, `ascent_m` for form prefilling

2. **Public route submit**
   - `POST /api/routes/submit`
   - Path: `submissions/{timestamp}-{sanitized-name}.gpx`

### Downloads

- `getGpxDownloadUrl(gpx_path)` in `lib/data/routes-db.ts`
- Uses `supabase.storage.from("gpx").getPublicUrl(path)`
- No signed URLs; bucket is public.

### Other Media

- `hero_image`, `image_url`, `image_url` (team, podcast): stored as URLs, not in Supabase Storage. External or Supabase URLs. No dedicated image bucket.

---

## 4. PUBLIC FEATURES

### Public Pages

| Page | Data Source | Filters | UI |
|------|-------------|---------|-----|
| `/[locale]` (home) | routes, team, content | — | Hero, manifesto, featured routes (3), latest content (3), podcast teaser, team (6) |
| `/[locale]/routes` | getPublishedRoutes() | area, distance, ascent, has_gpx, sort | RoutesPageClient, FilterBar, RouteCard |
| `/[locale]/routes/[slug]` | getPublishedRouteBySlug() | — | RouteDetailWithGpx, map, elevation, SourceMetadataDisplay |
| `/[locale]/events` | getPublishedEvents() | type (race/camp/community) | EventsPageClient, FilterSelect |
| `/[locale]/events/[slug]` | getPublishedEventBySlug/ById() | — | Event detail, SourceMetadataDisplay |
| `/[locale]/content` | getPublishedContentItems() | content_type, author, sort | ContentPageClient, ContentCard (podcast excluded) |
| `/[locale]/content/[slug]` | getContentBySlug() | — | Content detail, SourceMetadataDisplay |
| `/[locale]/podcast` | getFeaturedPodcastGuest, getPastPodcastGuests() | — | Podcast hub |
| `/[locale]/about` | getPublishedTeamMembers() | — | TeamMemberCard |
| `/[locale]/submit` | Static | — | Links to event/route submit |
| `/[locale]/submit/event` | Direct Supabase insert | — | SubmitEventForm |
| `/[locale]/submit/route` | POST /api/routes/submit | — | SubmitRouteForm |
| `/[locale]/submit/success` | Static | — | Success message |
| `/[locale]/podcast-guest` | POST /api/podcast/guest-request | — | Guest request form |
| `/[locale]/disclaimer` | Static | — | Legal text |
| `/[locale]/camps` | Redirect | — | → /events?type=camp |
| `/[locale]/leirit` | Redirect | — | → /events?type=camp |
| `/[locale]/suggest` | Redirect | — | → /submit |

### Map Behavior

- `RoutesPageClient`: map exists but `mapRoutes` is hardcoded `[]` because routes lack `start_lat`/`start_lng`. Map always empty.

---

## 5. COMMUNITY SUBMISSIONS

### Event Submission

- **Form:** SubmitEventForm at `/[locale]/submit/event`
- **Flow:** Direct Supabase insert via anon client
- **Row:** `status: 'draft'`, plus type, title, date, location, etc.
- **Policy:** "Anyone can insert draft events"
- **Redirect:** `/submit/success`

### Route Submission

- **Form:** SubmitRouteForm at `/[locale]/submit/route`
- **Flow:** `POST /api/routes/submit` (service role)
- **Data:** title, area, description, optional GPX
- **Storage:** GPX in `gpx/submissions/`
- **Row:** `status: 'draft'`, slug from title; random suffix on conflict
- **Redirect:** `{locale}/submit/success`

### Draft Status

- Draft items appear in admin (events, routes)
- Publish/unpublish via API:
  - `/api/admin/events/publish`, `unpublish`
  - `/api/admin/routes/publish`, `unpublish`

### Admin Review

- **Events:** Admin events list shows draft; publish from edit page
- **Routes:** Admin routes list shows draft; publish from edit page
- **Submissions page:** `/[locale]/admin/submissions` redirects to `/[locale]/admin` (legacy items page removed)

---

## 6. ADMIN SYSTEM

### Authentication

- **Method:** Cookie `admin_auth` = `"1"`
- **Check:** `checkAdmin()` in `lib/admin-auth.ts`
- **Gate:** `AdminGate` wraps admin layout; redirects unauthenticated users
- **Risk:** Cookie is trivial to forge; no real auth.

### Admin Pages and CRUD

| Section | Paths | Create | Read | Update | Delete | Publish |
|---------|-------|--------|------|--------|--------|---------|
| Events | events, new, edit/[id] | ✓ | ✓ | ✓ | ✓ | ✓ |
| Routes | routes, new, edit/[id] | ✓ | ✓ | ✓ | ✓ | ✓ |
| Content | content, new, [id]/edit | ✓ | ✓ | ✓ | ✓ (API) | ✓ |
| Team | team, new, [id]/edit | ✓ | ✓ | ✓ | ✓ (API) | ✓ |
| Podcast | podcast, guests/new, [id]/edit | ✓ | ✓ | ✓ | ✓ (API) | ✓ |

### Nav (Hallinta Hidden)

- Team, Podcast, Content, Events, Routes
- No Hallinta/dashboard link (hidden until static-pages system exists)

### API Routes

- **Events:** create, update, delete, publish, unpublish
- **Routes:** create, update, delete, publish, unpublish, upload
- **Content:** POST, PATCH, DELETE
- **Team:** POST, PATCH, DELETE
- **Podcast guests:** POST, PATCH, DELETE

### Security Concerns

1. Admin auth is a single cookie value; easily spoofed
2. Routes RLS not enabled; anon client could see drafts
3. Service role used for submissions and admin; must stay server-only

---

## 7. GPX SYSTEM

### Upload

- **Admin:** `POST /api/admin/routes/upload` → `gpx` bucket, path `{timestamp}-{name}.gpx`
- **Public submit:** `POST /api/routes/submit` → `gpx/submissions/` prefix
- Both parse GPX server-side for distance/ascent (`lib/route-gpx-stats.ts`)

### Storage

- Bucket: `gpx`
- Admin paths: root. Submit paths: `submissions/`
- No explicit size limit in code

### Display

- **Component:** `RouteDetailWithGpx`
- **Flow:** `getGpxDownloadUrl(gpx_path)` → fetch → `parseGpxToGeoJson` (client, `lib/route-gpx.ts`)
- **Map:** `RouteMap` (Leaflet/MapLibre) from GeoJSON
- **Elevation:** `ElevationProfile` (Chart.js) from `elevationProfile`

### Elevation Profile

- **Client:** `lib/route-gpx.ts` — `toGeoJSON` → points with `ele` → cumulative distance + elevation
- **Output:** `{ distanceKm, elevationM }[]`
- **Chart:** `ElevationProfile` renders with Chart.js

---

## 8. SOURCE + RIGHTS METADATA

### Schema (from migration 20250307000000)

- **routes, events, content_items:** source_type, source_name, source_url, submitted_by_name, submitted_by_email, rights_basis, license_name, license_url, verification_status
- **routes only:** route_origin_type, route_origin_name, route_origin_url

### Admin Forms

- `SourceRightsMetadataSection` — source_type, source_name, source_url, rights_basis, license_name, license_url, verification_status
- Used in: EventForm, RouteForm, ContentItemForm, route/event admin forms

### Public Display

- **Component:** `SourceMetadataDisplay` — source_name, source_type, verification_status, route_origin_name (optional)
- **Places:** `/[locale]/routes/[slug]`, `/[locale]/events/[slug]`, `/[locale]/content/[slug]`

### Enums

- **source_type:** team, organizer, community, third_party, editorial
- **rights_basis:** own, permission, licensed, public_linked_only, unknown
- **verification_status:** unverified, verified_by_team, organizer_confirmed
- **route_origin_type:** team_route, race_route, organizer_route, community_route, imported

---

## 9. KNOWN BUGS

### Fixed (Recent)

- Slug generation in content admin — was using first letter only; now uses `slugManuallyEdited` like RouteForm
- Team admin 404 — router.push with locale prefix; fixed to use locale-aware paths
- Content/podcast separation — podcast excluded from `/content`; filters and admin form updated
- Filter labels — `filters.author`, `content.clearAll` added
- Hallinta — hidden from nav until static-pages system exists

### Remaining

1. **Routes RLS:** Never enabled; policies ineffective
2. **Map on routes list:** Always empty (`mapRoutes = []`) — routes lack start coordinates
3. **related_item_ids:** Semantics unclear; no validation against routes/content
4. **Events slug:** Nullable; migration adds slug but old rows can be null
5. **Podcast filters:** `podcast-filters.ts` exists but not wired to UI

---

## 10. MISSING / PARTIAL / LEGACY FEATURES

### Missing

- Pagination on routes, events, content
- CDN/image strategy for hero_image, team images
- `generateMetadata` on several pages
- Sitemap coverage for events, podcast, submit, podcast-guest
- Admin logout UI (API exists; nav may not expose it clearly)

### Partial

- `related_item_ids` — semantics and validation unclear
- Map on routes list — component present but data empty

### Legacy / Unused

- `components/SubmitForm.tsx` — not imported; uses non-existent `/api/items/submit`
- `components/ItemCard.tsx` — not imported; uses legacy `VerterItem`
- `lib/types.ts` — `VerterItem`, `RouteItem` — legacy types
- `items` table — deprecated; admin items redirect to dashboard
- `ratings` / `rating_aggregates` — FK to items; broken without migration
- `getRatingAggregates()` — defined but not used

---

## 11. ARCHITECTURE SUMMARY

### Strengths

- Clear Next.js App Router structure with locale-aware routing
- Supabase as main data source with typed queries
- GPX flow (upload → storage → parse → map + elevation) implemented
- Source/rights metadata across routes, events, content
- Admin CRUD for events, routes, content, team, podcast
- Separation of podcast (podcast admin, podcast page) vs content (blog, review, comparison)

### Stability

- Core flows work; recent fixes addressed slug, redirects, and filters
- Legacy `items` and ratings add confusion; no hard breaks if unused

### Code Quality

- Most code typed; some legacy types remain
- Consistent patterns in admin forms and data layer
- Existing audit docs (CONSISTENCY_AUDIT, PRODUCTION_READINESS) align with this report

### Technical Risks

1. **Auth:** Cookie-based admin auth is weak
2. **RLS:** Routes table RLS disabled
3. **Legacy:** items, ratings, rating_aggregates create dead code and migration ambiguity
4. **Scalability:** No pagination; large datasets may degrade

### Scalability

- No pagination on list pages
- No CDN for images
- Static generation where used; some dynamic data fetching

---

*Report generated from codebase analysis. No files were modified.*
