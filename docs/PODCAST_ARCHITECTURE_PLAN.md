# Podcast Architecture Plan

**Goal:** Introduce a dedicated podcast episode system without breaking the existing architecture. Separate podcast content from `content_items` (articles/blog).

---

## 1. Current Podcast Implementation Summary

### 1.1 Where the podcast page gets its data

| Page | Data source | Functions |
|------|-------------|-----------|
| `/podcast` | `podcast_guests` table | `getFeaturedPodcastGuest()`, `getPastPodcastGuests()` from `lib/data/podcast.ts` |

**The `/podcast` page does NOT use `content_items`.** It uses only `podcast_guests`.

### 1.2 Podcast vs content_items

| Aspect | Podcast page (`/podcast`) | Content page (`/content`) |
|--------|---------------------------|---------------------------|
| Table | `podcast_guests` | `content_items` |
| Model | Guest-centric: each guest has `episode_url`, `featured`, `published_at` | Article-centric: blog, review, **podcast**, comparison |
| Podcast type in content | — | `content_type = 'podcast'` exists; items appear on `/content` and `/content/[slug]` |

**Overlap:** `content_items` with `content_type = 'podcast'` are podcast-related articles stored as content. They link to `/content/[slug]` and can have `episode_url`. This mixes podcast episodes with general content.

### 1.3 Components that render podcast content

| Component | Used on | Data |
|-----------|---------|------|
| `PodcastGuestCard` | `/podcast` | `PodcastGuest` from `podcast_guests` |
| `AdminPodcastGuestCard` | `/admin/podcast` | `AdminPodcastGuest` |
| `AdminPodcastSection` | `/admin/podcast` | Guest requests + published/hidden guests |
| `ContentCard` | `/content`, homepage | `ContentItemPublic` — includes items with `type: "podcast"` |
| `ContentItemForm` | Admin content create/edit | Has `episode_url` field when `content_type === "podcast"` |

### 1.4 APIs related to podcast

| API | Method | Table | Purpose |
|-----|--------|-------|---------|
| `/api/admin/podcast/guests` | POST | `podcast_guests` | Create guest |
| `/api/admin/podcast/guests/[id]` | GET, PATCH | `podcast_guests` | Get/update guest (no DELETE) |
| `/api/podcast/guest-request` | POST | `podcast_guest_requests` | Public form: request to be guest |

### 1.5 Current podcast_guests schema (from migration)

```
id, name, role_fi, role_en, tagline_fi, tagline_en, image_url, links (jsonb),
episode_url, featured (bool), status ('published'|'hidden'), published_at,
created_at, updated_at
```

**Current model:** Each guest record = one person + one episode (via `episode_url`). No separate episode entity. "Featured" = one guest highlighted; "past" = others.

---

## 2. Recommended Schema Changes

### 2.1 New table: `podcast_episodes`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| title | text | NO | — | |
| slug | text | NO | — | UNIQUE |
| description | text | YES | — | |
| episode_number | integer | YES | — | |
| spotify_url | text | YES | — | |
| apple_url | text | YES | — | |
| youtube_url | text | YES | — | |
| audio_url | text | YES | — | Direct audio file |
| cover_image | text | YES | — | |
| published_at | date | YES | — | |
| status | text | NO | 'draft' | CHECK IN ('draft','published') |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

### 2.2 Optional relation: `podcast_episode_guests`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| episode_id | uuid | NO | FK → podcast_episodes(id) ON DELETE CASCADE |
| guest_id | uuid | NO | FK → podcast_guests(id) ON DELETE CASCADE |
| sort_order | integer | YES | 0 | Display order |

**Primary key:** (episode_id, guest_id) or composite unique.

### 2.3 Changes to `podcast_guests`

- **Keep** `episode_url` for backward compatibility during migration (optional; can deprecate once episodes are primary).
- **Keep** `featured` and `published_at` for guest-centric display (e.g. "featured guest" on landing) if desired.
- **No schema change required** for Phase 1; episodes can link to guests via `podcast_episode_guests`.

### 2.4 Changes to `content_items`

- **Remove** `podcast` from `content_type` CHECK constraint.
- **Valid values:** `'blog' | 'review' | 'comparison'` only.
- **Migration:** Update existing `content_type = 'podcast'` rows (reassign to `blog` or archive) before dropping the value.

---

## 3. Required Supabase SQL

### 3.1 Create `podcast_episodes`

```sql
-- Ensure update_updated_at exists (from items migration or standalone)
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  episode_number integer,
  spotify_url text,
  apple_url text,
  youtube_url text,
  audio_url text,
  cover_image text,
  published_at date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_podcast_episodes_status on public.podcast_episodes (status);
create index idx_podcast_episodes_slug on public.podcast_episodes (slug);
create index idx_podcast_episodes_published on public.podcast_episodes (published_at desc) where status = 'published';

create trigger podcast_episodes_updated_at
  before update on public.podcast_episodes
  for each row execute function update_updated_at();

alter table public.podcast_episodes enable row level security;

create policy "Public can read published podcast episodes"
  on public.podcast_episodes for select
  using (status = 'published');
```

### 3.2 Create `podcast_episode_guests` (optional)

```sql
create table if not exists public.podcast_episode_guests (
  episode_id uuid not null references public.podcast_episodes(id) on delete cascade,
  guest_id uuid not null references public.podcast_guests(id) on delete cascade,
  sort_order integer default 0,
  primary key (episode_id, guest_id)
);

create index idx_podcast_episode_guests_episode on public.podcast_episode_guests (episode_id);
create index idx_podcast_episode_guests_guest on public.podcast_episode_guests (guest_id);

alter table public.podcast_episode_guests enable row level security;

-- Service role used for admin; public only reads via episode
create policy "Public can read episode guests"
  on public.podcast_episode_guests for select
  using (
    exists (
      select 1 from public.podcast_episodes e
      where e.id = episode_id and e.status = 'published'
    )
  );
```

### 3.3 Remove `podcast` from `content_items`

```sql
-- Step 1: Migrate existing podcast content (choose one strategy)
-- Option A: Reassign to blog
update public.content_items set content_type = 'blog' where content_type = 'podcast';

-- Option B: Archive
update public.content_items set status = 'archived' where content_type = 'podcast';

-- Step 2: Drop and recreate constraint
alter table public.content_items drop constraint if exists content_items_content_type_check;
alter table public.content_items add constraint content_items_content_type_check
  check (content_type in ('blog', 'review', 'comparison'));
```

---

## 4. Required Admin Pages

### 4.1 Episodes

| Path | Purpose | Actions |
|------|---------|---------|
| `/admin/podcast/episodes` | List episodes | Filter by status, link to create/edit |
| `/admin/podcast/episodes/new` | Create episode | Form → POST API |
| `/admin/podcast/episodes/[id]/edit` | Edit episode | Form → PATCH API |
| Episodes support | — | create, edit, publish/unpublish, delete |

**API routes needed:**
- `POST /api/admin/podcast/episodes` — create
- `GET /api/admin/podcast/episodes` — list (all statuses for admin)
- `GET /api/admin/podcast/episodes/[id]` — single
- `PATCH /api/admin/podcast/episodes/[id]` — update
- `POST /api/admin/podcast/episodes/[id]/publish` — set status published
- `POST /api/admin/podcast/episodes/[id]/unpublish` — set status draft
- `DELETE /api/admin/podcast/episodes/[id]` — delete

### 4.2 Guests (existing, with additions)

| Path | Purpose | Actions |
|------|---------|---------|
| `/admin/podcast/guests` | List guests | Already under `/admin/podcast` via AdminPodcastSection |
| `/admin/podcast/guests/new` | Create guest | ✅ Exists |
| `/admin/podcast/guests/[id]/edit` | Edit guest | ✅ Exists |
| Guests support | — | create, edit, **delete** (add) |

**API addition:**
- `DELETE /api/admin/podcast/guests/[id]` — delete guest (currently missing)

### 4.3 Admin layout

```
/admin/podcast
├── Episodes (new section)
│   ├── List + filter
│   ├── /episodes/new
│   └── /episodes/[id]/edit
├── Guests (existing)
│   ├── List + filter
│   ├── /guests/new
│   └── /guests/[id]/edit
└── Guest requests (existing)
```

---

## 5. Required Public Pages

### 5.1 `/podcast`

- **Before:** Featured guest + past guests (from `podcast_guests`).
- **After:** List of `podcast_episodes` where `status = 'published'`, ordered by `published_at` desc.
- **Data:** `getPublishedPodcastEpisodes()` from new `lib/data/podcast-episodes.ts`.

### 5.2 `/podcast/[slug]`

- **New page.** Single episode detail.
- **Data:** `getPublishedPodcastEpisodeBySlug(slug)`.
- **Content:**
  - Episode title
  - Description (markdown)
  - Embedded player (Spotify / YouTube / audio — choose first available)
  - Guest list (from `podcast_episode_guests` or fallback to episode metadata)
  - Published date

### 5.3 Guest display

- **Option A:** Keep guest-centric block on `/podcast` (e.g. "Featured guest" + "Past guests") in addition to episode list.
- **Option B:** Remove guest-centric display; show only episodes. Guests appear only on episode detail pages.

**Recommendation:** Option B for clarity. Episodes are primary; guests are shown per episode.

---

## 6. Migration Steps from Current System

### Phase 1: Add episodes (no breaking changes)

1. Create `podcast_episodes` table (migration).
2. Create `podcast_episode_guests` table (migration).
3. Add `lib/data/podcast-episodes.ts` with `getPublishedPodcastEpisodes`, `getPublishedPodcastEpisodeBySlug`.
4. Add admin episode pages and APIs.
5. Add `/podcast/[slug]` page.
6. Update `/podcast` to show episode list (keep guest section as secondary during transition, or remove).

### Phase 2: Remove podcast from content_items

1. Migrate existing `content_type = 'podcast'` rows (reassign or archive).
2. Run migration to drop `podcast` from content_items CHECK.
3. Update `ContentItemForm`, `ContentPageClient`, `ContentCard`, `lib/types`, `lib/db/content-types` to remove `podcast` from ContentType.
4. Update admin content new page: remove `podcast` from initial type options.

### Phase 3: Guest model (optional)

1. If using `podcast_episode_guests`, add guest picker to episode form.
2. Deprecate or repurpose `podcast_guests.episode_url` (each guest can appear on multiple episodes).
3. Add `DELETE /api/admin/podcast/guests/[id]` if needed.

### Phase 4: Cleanup

1. Remove guest-centric display from `/podcast` if not needed.
2. Update homepage "Latest content" to exclude podcast (or keep if you add podcast episodes to a combined feed).
3. Update sitemap to include `/podcast` and `/podcast/[slug]`.

---

## 7. File Change Summary (for implementation)

| Area | Files to create | Files to modify | Files to remove |
|------|-----------------|----------------|-----------------|
| **Data** | `lib/data/podcast-episodes.ts`, `lib/db/podcast-episode-types.ts` | `lib/data/podcast.ts` (add episode helpers or keep separate) | — |
| **Admin** | `app/[locale]/admin/podcast/episodes/page.tsx`, `episodes/new/page.tsx`, `episodes/[id]/edit/page.tsx`, `AdminPodcastEpisodeSection.tsx`, `PodcastEpisodeForm.tsx` | `AdminPodcastSection.tsx` (add episodes tab/section), `AdminNav.tsx` (link to episodes) | — |
| **API** | `api/admin/podcast/episodes/route.ts`, `api/admin/podcast/episodes/[id]/route.ts`, publish/unpublish/delete routes | — | — |
| **Public** | `app/[locale]/podcast/[slug]/page.tsx`, `PodcastEpisodeCard.tsx`, `PodcastEpisodeDetail.tsx` | `app/[locale]/podcast/page.tsx` | — |
| **Content** | — | `ContentItemForm.tsx`, `ContentPageClient.tsx`, `ContentCard.tsx`, `lib/types.ts`, `lib/db/content-types.ts`, `content-items.ts`, `app/[locale]/admin/content/new/page.tsx`, `app/[locale]/content/[slug]/page.tsx` | — |
| **Migrations** | `supabase/migrations/YYYYMMDD_create_podcast_episodes.sql`, `_create_podcast_episode_guests.sql`, `_content_items_remove_podcast.sql` | — | — |

---

## 8. Summary

| Current | Target |
|---------|--------|
| `/podcast` shows guests (featured + past) | `/podcast` shows published episodes |
| No episode entity; guest has `episode_url` | `podcast_episodes` table; optional `podcast_episode_guests` |
| `content_items` includes `podcast` type | `content_items` = blog, review, comparison only |
| Admin: guests only | Admin: episodes + guests |
| No `/podcast/[slug]` | `/podcast/[slug]` = episode detail with player, guests, date |
