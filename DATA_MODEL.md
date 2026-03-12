# Verter Data Model

Source of truth for the Supabase schema. The app uses **separate tables** for routes, events, content, team, and podcast — not a unified items table.

---

## Tables

### `routes`

Self-guided running routes with optional GPX for map and elevation.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| title | text | |
| slug | text | Unique, URL identifier |
| area | text | Region/location |
| distance_km | numeric | From GPX or manual |
| ascent_m | numeric | From GPX or manual |
| description | text | |
| gpx_path | text | Path in `gpx` bucket |
| status | text | `draft` \| `published` |
| source_type, source_name, source_url | text | Source metadata |
| submitted_by_*, rights_basis, license_*, verification_status | text | Rights and verification |
| route_origin_type, route_origin_name | text | Route origin (routes only) |
| submitted_by_strava_url, approved_by_verter, tested_by_team, tested_notes | — | Trust badges |

**Status:** `draft` (unreviewed submission) or `published`.

**Linking:** `/[locale]/routes/[slug]`

---

### `events`

Races, camps, and community events.

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
| source_type … verification_status | text | Same pattern as routes |

**Status:** `draft` or `published`.

**Filtering:** `/events?type=race`, `?type=camp`, `?type=community` — `type` column used in queries.

**Linking:** `/[locale]/events/[slug]` (id fallback when slug null)

---

### `content_items`

Blog posts, reviews, comparisons, and podcast-related articles.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| title | text | |
| slug | text | Unique |
| content_type | text | `blog` \| `review` \| `podcast` \| `comparison` |
| summary | text | |
| body | text | Markdown |
| hero_image | text | URL |
| episode_url | text | For podcast type |
| published_at | date | |
| author | text | Free text |
| status | text | `draft` \| `published` \| `archived` |
| related_route_slugs | text[] | Slugs of linked routes |
| related_event_slugs | text[] | Slugs of linked events |
| related_item_ids | jsonb | **Deprecated.** Use related_route_slugs / related_event_slugs |
| source_type … verification_status | text | Same pattern |

**Public `/content` list:** Excludes `content_type='podcast'` (podcasts live on `/podcast`).

**Cross-linking:** Content can link to routes and events via slug arrays. Route and event detail pages show "Related articles" by querying content that references their slug.

---

### `team_members`

Team profiles for the About page.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| name | text | |
| role_fi, role_en | text | Bilingual |
| tagline_fi, tagline_en | text | Bilingual |
| strava_url, image_url | text | |
| sort_order | integer | |
| status | text | `draft` \| `published` \| `archived` |

---

### `podcast_guests`

Guest-centric podcast model: each guest has an episode_url.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| name | text | |
| role_fi, role_en, tagline_fi, tagline_en | text | Bilingual |
| image_url, links | text/jsonb | |
| episode_url | text | Link to episode |
| featured | boolean | One featured guest |
| status | text | `published` \| `hidden` |
| published_at | date | |

**Note:** No separate `podcast_episodes` table. See `docs/PODCAST_ARCHITECTURE_PLAN.md` for a planned episode-centric model.

---

### `podcast_guest_requests`

Public guest request form submissions.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| name, email, message | text | |
| created_at | timestamptz | |

---

## Cross-Linking (Implemented)

| From | To | Field | Usage |
|------|-----|-------|-------|
| content_items | routes | `related_route_slugs` | Admin picker; public content detail shows "Related routes" |
| content_items | events | `related_event_slugs` | Admin picker; public content detail shows "Related events" |
| routes | content_items | — | Public route detail shows "Related articles" via `getPublishedContentItemsByRouteSlug(slug)` |
| events | content_items | — | Public event detail shows "Related articles" via `getPublishedContentItemsByEventSlug(slug)` |

All linking uses **slugs**, not IDs. Functions: `getPublishedRoutesBySlugs`, `getPublishedEventsBySlugs`, `getPublishedContentItemsByRouteSlug`, `getPublishedContentItemsByEventSlug`.

---

## Legacy (Not Used by Active App)

| Table / Code | Status |
|--------------|--------|
| `items` | Deprecated; migrations exist; no app code uses it |
| `ratings`, `rating_aggregates` | FK to `items`; broken |
| `lib/data/items-supabase.ts`, `items-loader.ts`, `items-queries.ts` | Orphaned; not imported |

---

## Storage

- **`gpx` bucket:** Route GPX files. Admin uploads: root; public submits: `submissions/` prefix.
- **Images:** `hero_image`, `image_url` stored as URLs (external or Supabase). No dedicated image bucket.

---

## Migrations

See `supabase/migrations/` for schema. Key content-related:

- `20250229100000_create_content_items.sql`
- `20250229110000_content_items_author_archived.sql`
- `20250309000000_content_items_related_route_slugs.sql`
- `20250310000000_content_items_related_event_slugs.sql`
