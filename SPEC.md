# Verter – Product Specification

Source of truth for goals, scope, and key UX decisions.

---

## Goals

1. **Curated discovery** – Routes, events, camps and content in structured hubs
2. **SEO-first** – Public pages are crawlable, localized, and indexable
3. **List-first UX** – No mandatory overlays; content always accessible
4. **Clear brand voice** – Story, manifesto, team and podcast presence
5. **Moderated CMS** – Public suggestions → draft → admin approval
6. **App-ready backend** – Shared Supabase backend for future mobile app

---

## Non-goals (Current)

- No public user accounts (web)
- No web-based ratings (app-only in future)
- No complex RBAC (signed cookie for admin for now)
- No training planner in web
- No social features (comments, feeds)

---

## Web App Scope

| Area | Description |
|------|-------------|
| **Routes** | Self-guided routes and trails (distance required, elevation optional, GPX optional) |
| **Events** | Races and recurring runs (type: race/camp/community; date required) |
| **Camps** | Multi-day camps — shown in events hub with `type=camp` filter |
| **Content** | Blog, reviews, podcasts, comparisons (admin-managed CMS) |
| **Podcast** | Featured guest + past guests gallery (guest-centric model) |
| **Team** | Admin-editable team profiles |
| **Story** | About / manifesto page |
| **Admin Studio** | Full CRUD for routes, events, content, team, guest requests |

---

## Architecture Decisions

### Hubs (Separated, not unified list)

- `/routes` → `routes` table only
- `/events` → `events` table (type: race, camp, community)
- `/content` → blog/review/podcast/comparison (excludes podcast from list; podcast lives on `/podcast`)
- `/about` → story + team
- `/admin` → content management

Routes and Events are separate hubs by design.

---

### Database Tables

**routes**
- title, slug, area, distance_km, ascent_m, description
- gpx_path (Supabase Storage)
- status: draft | published

**events**
- title, slug, type (race|camp|community), date, location
- registration_url, description
- status: draft | published

**content_items**
- title, slug, content_type (blog|review|podcast|comparison)
- summary, body (markdown), hero_image
- **related_route_slugs** — array of route slugs
- **related_event_slugs** — array of event slugs
- episode_url (podcast only)
- status: draft | published | archived

**team_members**
- name, role_fi, role_en, tagline_fi, tagline_en
- status: draft | published | archived

**podcast_guests**
- name, role_fi, role_en, episode_url, featured
- status: published | hidden

See `lib/db/*`, `supabase/migrations/` for full schema.

---

### Content Model

- `related_route_slugs` and `related_event_slugs` — slug-based; link to routes.id/events.id via slug
- `related_item_ids` — **deprecated**; kept for migration compatibility; do not use
- Public content list excludes `content_type=podcast` (podcasts live on `/podcast`)

---

### Admin Workflow

1. Public submission → `status=draft`
2. Admin review → publish from edit page
3. Admin can: Create, Edit, Save draft, Publish, Archive
4. Admin protected via signed session cookie (`ADMIN_SESSION_SECRET`)

Future:
- Supabase Auth + RLS

---

### Map UX

- Map is optional
- List-first interface
- Toggle shows map
- Only routes with GPX appear on map (coordinates parsed from GPX)
- Map state persisted in URL/localStorage

---

### Localization

- FI / EN via `next-intl`
- Locale prefix required (`/fi/...`, `/en/...`)
- Default locale: `fi`

---

## Security Model (Current)

- Admin protected via signed session cookie (HMAC; 24h expiry)
- Public cannot access non-published data
- Supabase public key read-only for published data
- RLS enabled on routes, events, content_items, team_members, podcast_guests

Future:
- Proper Supabase Auth for admin
- Role-based access

---

## Tech Stack

- Next.js 15 (App Router)
- next-intl
- Tailwind CSS
- Leaflet, MapLibre GL
- Supabase (routes, events, content_items, team, podcast)
- Vercel (planned production deployment)

---

## Maintenance Rules

When implementing major features:

1. Update this SPEC
2. Update ROADMAP.md
3. Update DATA_MODEL.md if schema changes
4. Log architectural decisions in PROMPTS/CHANGELOG.md

---

## References

- DATA_MODEL.md
- ROADMAP.md
- SCOPE.md (legacy app split context)
