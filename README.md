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
- **Supabase backend** (items, content, team, guest requests)

Public users:
- Browse routes, events, camps, and content
- Submit suggestions

Admin users:
- Create/edit/publish routes, events, camps
- Manage blog posts, reviews, podcasts
- Moderate submissions
- Manage team and podcast guests

App redirects to `/fi` by default.

---

## 🚀 Run locally

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
npm install

cp .env.example .env.local
# Edit .env.local with your values

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/fi`).

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (prod) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (prod) | Supabase anon key (public read) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (admin ops) | Service role key (server-side only) |
| `ADMIN_PASSWORD` | Yes (MVP) | Password for `/admin` gate |
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
│       ├── items/              # Routes/events/camps CRUD
│       ├── content/            # Blog/review/podcast CRUD
│       ├── team/               # Team management
│       ├── podcast/            # Guest + requests
│       └── submissions/        # Moderation
├── api/                        # Server routes
lib/
├── data/                       # Loaders & queries
├── supabase/                   # Client + server config
├── db/types.ts
├── types.ts
components/
├── ItemCard.tsx
├── MapView.tsx
├── TeamSection.tsx
├── PodcastGuestSection.tsx
└── admin/
messages/                       # FI/EN translations
supabase/migrations/            # SQL migrations
```

---

## 🧠 Core Concepts

### Hubs

- `/routes` → type=route only
- `/events` → type=event + camp
- `/content` → blog / review / podcast
- `/about` → story + team
- `/admin` → content management

### Items Model

Single `items` table with `type`:
- `route`
- `event`
- `camp`

Only `status='published'` is shown publicly.

### Content Model

`content_items` table:
- blog
- review
- podcast
- comparison

Markdown body + preview in admin.

### Admin Studio

Admin can:
- Create/edit/publish/archive items
- Moderate public submissions
- Manage content
- Manage team members
- Manage podcast guest requests

Admin is protected by password gate (temporary solution).

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
- [DATA_MODEL.md](./DATA_MODEL.md) – Unified items model
- [ROADMAP.md](./ROADMAP.md) – Phases and priorities

---

## 🌍 Deployment

Planned production platform: **Vercel**

Required in production:
- Supabase configured
- Environment variables set
- Admin password configured
- RLS policies tightened
