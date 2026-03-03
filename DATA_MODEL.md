# Verter Data Model

Source of truth for the unified items model (routes, events, camps).

## Unified item types

| Type | Description |
|------|-------------|
| `route` | Self-guided running route |
| `event` | Race, competition, or recurring run |
| `camp` | Multi-day camp or workshop |

## Base fields (all types)

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier |
| `type` | Yes | `route` \| `event` \| `camp` |
| `name` | Yes | Display title |
| `slug` | Yes | URL-friendly identifier |
| `region` | Yes (display) | Region/country for display |
| `training_tags` | No | Tags for filtering (e.g. Base, Hills, PK) |
| `description` | No | Full description |

## Route-specific fields

| Field | Required | Description |
|-------|----------|-------------|
| `distance_km` | Yes | Distance in kilometers |
| `elevation_gain_m` | Yes | Elevation gain in meters |
| `elevation_density` | No | m/km (derived) |
| `technicality` | No | 1–5 scale |
| `winter_score` | No | 1–5 winter suitability |
| `start_lat` | No | Start latitude (for map) |
| `start_lng` | No | Start longitude (for map) |

## Event-specific fields

| Field | Required | Description |
|-------|----------|-------------|
| `date` | No | Single date (ISO) |
| `distance_or_format` | No | e.g. "25 km", "5 km, 10 km" |
| `distance_km` | No | Parsed for filtering |
| `elevation_gain_m` | No | Elevation if known |
| `recurring` | No | true for parkrun, weekly runs |

## Camp-specific fields

| Field | Required | Description |
|-------|----------|-------------|
| `season` | No | e.g. Winter, Summer |
| `duration` | No | e.g. "5-day camp" |
| `focus` | No | e.g. "Trail intro", "Winter running" |
| `elevation_gain_m` | No | Elevation if known |

## Supabase items table

For admin and CMS, items are stored in `public.items` with:

- **Status**: `draft` | `pending` | `published` | `archived`
- **Common**: title, slug, region, country, location_name, start_lat, start_lng, summary, description, tags, external_links
- **Route**: distance_km, elevation_gain_m, technicality_1_5, winter_score_1_5, gpx_url, route_origin
- **Event**: start_date, end_date, recurrence, distance_options (jsonb), organizer_name
- **Camp**: season, duration_days, focus
- **Submission**: submitter_name, submitter_email, submitter_role

See `lib/db/types.ts` and `supabase/migrations/` for the full schema.

## Card display by type

| Type | Card shows |
|------|------------|
| route | Distance, elevation, density, winter badge |
| event | Date (or “Recurring”), distance options |
| camp | Duration, focus |

## Linking

- **Routes** → `/[locale]/routes/[slug]`
- **Events/Camps** → `/events/[slug]`
