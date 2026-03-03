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
     - `/podcast` (when enabled)
   - No single mega-list

4. **App-ready backend**
   - Supabase as unified data layer
   - Clear item types
   - Status-based publishing

---

## Functional Requirements

### Public

Users can:

- Browse routes with filters
- Browse events and camps
- Read blog posts and reviews
- Listen to podcasts
- Submit new route/event/camp suggestions
- Apply to be podcast guest (if enabled)

Public visibility rule:
- Only `status='published'` content is visible

---

### Admin

Admin can:

- Create/edit/publish/archive:
  - Routes
  - Events
  - Camps
  - Content (blog/review/podcast/comparison)
- Moderate submissions
- Manage team profiles
- Manage podcast guest requests
- Feature podcast guests

Admin protected via password gate (MVP).
Future: Supabase Auth.

---

## Data Model Overview

### Items
Single `items` table:

- type: route | event | camp
- shared base fields
- type-specific fields
- status: draft | pending | published | archived

### Content
`content_items` table:

- blog
- review
- podcast
- comparison
- markdown body
- related item linking

### Team
`team_members` table (if DB-driven)

### Podcast
- `podcast_guest_requests`
- `podcast_guests`

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
