# Verter

Verter is a curated discovery platform for runners.

It helps runners find:
- Routes & trails
- Races and recurring events
- Camps
- Blog posts, reviews and podcasts

Built with a list-first UX, full localization (FI/EN), and a moderated CMS.

---

## 🧱 Architecture Overview

Verter consists of:

- **Public web app** (Next.js)
- **Admin Studio** (password-protected)
- **Supabase backend** (routes, events, content_items, team_members, podcast_guests)

Public users:
- Browse routes, events (races/camps/community), and content
- Submit route and event suggestions
- Apply to be podcast guest

Admin users:
- Create/edit/publish routes, events, content
- Manage blog posts, reviews, podcasts
- Manage team and podcast guests
- Publish or reject public submissions (drafts in events/routes lists)

App redirects to `/fi` by default.

---

## 🚀 Run locally

### Prerequisites

- Node.js 20+
- npm

### Local setup

1. Install deps and copy the example env file:

   ```bash
   npm install
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your Supabase values:
   - `NEXT_PUBLIC_SUPABASE_URL` – from your Supabase project (Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – the publishable anon key

3. Restart the dev server after changing env vars:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) (redirects to `/fi`).

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (prod) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (prod) | Supabase anon key (public read) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (admin ops) | Service role key (server-side only) |
| `ADMIN_PASSWORD` | Yes (MVP) | Password for `/admin` gate |
| `ADMIN_SESSION_SECRET` | Yes (admin) | Secret for signing admin session cookies |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional | Email for contact/guest CTA |

⚠️ **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.**

Without Supabase, the app uses static seed data.

---

## 📦 Project Structure

```
app/
├── [locale]/
│   ├── page.tsx                # Homepage
│   ├── routes/                 # Routes hub
│   ├── events/                 # Events & Camps hub
│   ├── content/                # Blog / Reviews / Podcasts
│   ├── podcast/                # Podcast hub (featured + gallery)
│   ├── about/                  # Story + Team + Guest CTA
│   ├── submit/                 # Public suggestion form
│   └── admin/                  # Admin Studio
│       ├── events/             # Events CRUD
│       ├── routes/             # Routes CRUD + GPX upload
│       ├── content/            # Blog/review/podcast CRUD
│       ├── team/               # Team management
│       ├── podcast/            # Podcast guests + requests
│       └── submissions/        # Redirects to dashboard
├── api/                        # Server routes
lib/
├── data/                       # routes-db, events-db, content-items, team, podcast
├── supabase/                   # Client + server config
components/
├── MapView.tsx
├── RouteCard.tsx
├── ContentCard.tsx
├── TeamSection.tsx
└── admin/
messages/                       # FI/EN translations
supabase/migrations/            # SQL migrations
```

---

## 🧠 Core Concepts

### Hubs

- `/routes` → Routes (GPX, map, elevation)
- `/events` → Events (races, camps, community) with type filter
- `/content` → Blog, reviews, comparisons (podcast-type excluded; podcasts live on `/podcast`)
- `/podcast` → Featured guest + past guests
- `/about` → Story + team
- `/admin` → Full CRUD for routes, events, content, team, podcast

### Data Model (Supabase)

| Table | Purpose | Status |
|-------|---------|--------|
| `routes` | GPX routes, distance, ascent, map | Published/draft |
| `events` | Races, camps, community events | Published/draft; `type` column |
| `content_items` | Blog, review, podcast, comparison | Published/draft/archived |
| `team_members` | About page team | Published/draft |
| `podcast_guests` | Podcast page guests | Published/hidden |

Content can link to routes and events via `related_route_slugs` and `related_event_slugs`. Routes and events show related articles.

### Admin Studio

Admin can:
- Create/edit/publish/archive routes, events, content
- Manage team members and podcast guests
- Publish draft submissions (from events/routes lists)

Admin auth: signed session cookie (password → `/api/admin/auth`). All admin APIs use `checkAdmin()`.

Future: Supabase Auth + roles.

---

## 🛠 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run seed` | Seed items (requires Supabase) |

---

## 📚 Documentation

- [SPEC.md](./SPEC.md) – Goals, scope, UX decisions
- [DATA_MODEL.md](./DATA_MODEL.md) – Routes, events, content, team, podcast schema
- [ROADMAP.md](./ROADMAP.md) – Phases and priorities

---

## 🌍 Deployment

Planned production platform: **Vercel**

Required in production:
- Supabase configured
- Environment variables set
- Admin password configured
- RLS policies tightened
