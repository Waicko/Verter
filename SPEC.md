# Verter – Product Specification

Source of truth for goals, scope, and key UX decisions.

---

## Goals

1. **Curated discovery** – Routes, events, camps and content in structured hubs
2. **SEO-first** – Public pages are crawlable, localized, and indexable
3. **List-first UX** – No mandatory overlays; content always accessible
4. **Clear brand voice** – Story, manifesto, team and podcast presence
5. **Moderated CMS** – Public suggestions → pending → admin approval
6. **App-ready backend** – Shared Supabase backend for future mobile app

---

## Non-goals (Current)

- No public user accounts (web)
- No web-based ratings (app-only in future)
- No complex RBAC (password gate for admin for now)
- No training planner in web
- No social features (comments, feeds)

---

## Web App Scope

| Area | Description |
|------|-------------|
| **Routes** | Self-guided routes and trails (distance required, elevation optional, GPX optional) |
| **Events** | Races and recurring runs (date required, multiple distances supported) |
| **Camps** | Multi-day camps and workshops |
| **Content** | Blog, reviews, podcasts, comparisons (admin-managed CMS) |
| **Podcast** | Featured guest + past guests gallery (when implemented) |
| **Team** | Admin-editable team profiles |
| **Story** | About / manifesto page |
| **Admin Studio** | Full CRUD for items, content, team, guest requests |

---

## Architecture Decisions

### Hubs (Separated, not unified list)

- `/routes` → type=route only
- `/events` → type=event + type=camp
- `/content` → blog/review/podcast/comparison
- `/about` → story + team + guest CTA
- `/admin` → content management

Routes and Events are separate hubs by design.

---

### Unified Items Model

Single `items` table with `type`:

- `route`
- `event`
- `camp`

Shared base fields:
- id
- type
- title
- slug
- region
- country
- short_description
- official_url
- status

Type-specific:

**Route**
- distance_km (required)
- elevation_gain_m (optional)
- technicality
- terrain_type
- gpx_url

**Event**
- start_date (required)
- distance_options (array, required)
- event_kind
- recurrence (optional)

**Camp**
- start_date OR season
- duration_days
- focus

Public pages only show `status='published'`.

---

### Content Model

`content_items` table:

- title
- slug
- content_type (blog|review|podcast|comparison)
- summary
- body (markdown)
- hero_image
- episode_url (podcast only)
- related_item_ids
- status
- published_at

Static `content.ts` is deprecated.

---

### Admin Workflow

1. Public submission → `status=pending`
2. Admin review → approve → `published`
3. Admin can:
   - Create
   - Edit
   - Save draft
   - Publish
   - Archive
4. Admin protected by password gate (temporary solution)

Future:
- Supabase Auth + RLS

---

### Map UX

- Map is optional
- List-first interface
- Toggle shows map
- Only routes with coordinates appear on map
- Map state persisted in URL/localStorage

---

### Localization

- FI / EN via `next-intl`
- Locale prefix required (`/fi/...`, `/en/...`)
- Default locale: `fi`

---

## Security Model (Current)

- Admin protected via password gate
- Public cannot access non-published items
- Supabase public key read-only for published data

Future:
- Proper Supabase Auth for admin
- Role-based access

---

## Tech Stack

- Next.js 15 (App Router)
- next-intl
- Tailwind CSS
- Leaflet
- Supabase (items, content, team, guest requests)
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
