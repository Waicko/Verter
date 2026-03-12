# Verter – Product Requirements Document (PRD)

## Overview

Verter is a curated discovery platform for runners.

It enables discovery of:
- Routes & trails
- Races and recurring events
- Camps
- Blog posts, reviews and podcasts

The platform is:
- SEO-first
- Localized (FI/EN)
- Moderated via Admin Studio
- Built for future mobile app integration

---

## Core Product Principles

1. **List-first UX**
   - No forced overlays
   - Filters visible and persistent
   - Map optional

2. **Curated, not social**
   - No public ratings (web)
   - No comments
   - No open editing
   - All public additions are moderated

3. **Structured discovery**
   - Separate hubs:
     - `/routes`
     - `/events`
     - `/content`
     - `/podcast`
   - No single mega-list

4. **App-ready backend**
   - Supabase as unified data layer
   - Clear table boundaries
   - Status-based publishing

---

## Functional Requirements

### Public

Users can:

- Browse routes with filters
- Browse events and camps (filter by type: race, camp, community)
- Read blog posts and reviews
- Listen to podcasts
- Submit new route/event suggestions
- Apply to be podcast guest

Public visibility rule:
- Only `status='published'` content is visible

---

### Admin

Admin can:

- Create/edit/publish/archive:
  - Routes
  - Events
  - Content (blog/review/podcast/comparison)
- Moderate submissions (drafts appear in lists; publish from edit pages)
- Manage team profiles
- Manage podcast guest requests
- Feature podcast guests

Admin protected via signed session cookie.
Future: Supabase Auth.

---

## Data Model Overview

### Routes
`routes` table:

- Self-guided running routes
- distance_km, ascent_m, gpx_path
- status: draft | published

### Events
`events` table:

- Races, camps, community events
- type: race | camp | community
- date, location, registration_url
- status: draft | published

### Content
`content_items` table:

- blog, review, podcast, comparison
- markdown body
- **related_route_slugs** — slug-based links to routes
- **related_event_slugs** — slug-based links to events
- status: draft | published | archived

### Team
`team_members` table (DB-driven):

- name, role_fi, role_en, tagline_fi, tagline_en
- status: draft | published | archived

### Podcast
- `podcast_guests` — featured + past guests (guest-centric model)
- `podcast_guest_requests` — public form submissions

---

## Cross-Linking (Implemented)

- **Content → Routes:** `related_route_slugs`; public "Related routes" section
- **Content → Events:** `related_event_slugs`; public "Related events" section
- **Route → Content:** Content items that reference the route slug; "Related articles" on route detail
- **Event → Content:** Content items that reference the event slug; "Related articles" on event detail

---

## Non-Goals (Current Phase)

- No public user accounts
- No web ratings
- No training planner (web)
- No social feed
- No marketplace

---

## Technical Stack

- Next.js (App Router)
- TypeScript
- Tailwind
- next-intl
- Supabase
- Leaflet
- Vercel (deployment)

---

## Future Expansion

- Proper authentication
- App-only ratings
- Saved routes
- Mobile training planner
- Role-based admin system
