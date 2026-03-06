# Supabase Schema Audit — Verter (Post-Cleanup)

Audit date: 2025-03-06. Scoped to the cleaned codebase after removal of legacy items CMS.

---

## 1. Required Supabase Schema

### Table: `events`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| title | text | NOT NULL | — | |
| slug | text | NULL | — | Unique; added by migration 20250306100001 |
| date | date | NULL | — | ISO date string |
| location | text | NULL | — | |
| registration_url | text | NULL | — | |
| description | text | NULL | — | |
| status | text | NOT NULL | 'draft' | CHECK (status IN ('draft', 'published')) |
| created_at | timestamptz | NULL | now() | |
| updated_at | timestamptz | NULL | now() | |

**Indexes:** `idx_events_status`, `idx_events_date`, `idx_events_slug` (partial, where slug IS NOT NULL)

**Trigger:** `events_updated_at` → `update_updated_at()`

**Queries:** Public list (events page), detail by slug/id (events-db), admin CRUD. **SubmitEventForm** inserts via anon client.

---

### Table: `routes`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| title | text | NOT NULL | — | |
| area | text | NULL | — | |
| distance_km | numeric | NULL | — | |
| ascent_m | numeric | NULL | — | |
| description | text | NULL | — | |
| gpx_path | text | NULL | — | Object path in gpx bucket (no bucket prefix) |
| status | text | NOT NULL | 'published' | CHECK (status IN ('draft', 'published')) |
| slug | text | NOT NULL | — | UNIQUE |
| created_at | timestamptz | NOT NULL | now() | |

**Indexes:** `idx_routes_status`, `idx_routes_slug`

**Queries:** Public list/detail (routes-db), admin CRUD. No `updated_at` in schema but not used in code.

---

### Table: `content_items`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| title | text | NOT NULL | — | |
| slug | text | NOT NULL | — | UNIQUE |
| content_type | text | NOT NULL | — | CHECK IN ('blog','review','podcast','comparison') |
| summary | text | NULL | — | |
| body | text | NOT NULL | '' | |
| hero_image | text | NULL | — | URL |
| related_item_ids | jsonb | NULL | '[]' | Array of string IDs |
| episode_url | text | NULL | — | |
| author | text | NULL | — | Added by migration 20250229110000 |
| published_at | date | NULL | — | |
| status | text | NOT NULL | 'draft' | CHECK IN ('draft','published','archived') |
| created_at | timestamptz | NULL | now() | |
| updated_at | timestamptz | NULL | now() | |

**Indexes:** `idx_content_items_status`, `idx_content_items_slug`, `idx_content_items_content_type`, `idx_content_items_published` (partial, status='published')

**Trigger:** `content_items_updated_at` → `update_updated_at()`

---

### Table: `team_members`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| name | text | NOT NULL | — | |
| role_fi | text | NULL | — | |
| role_en | text | NULL | — | |
| tagline_fi | text | NULL | — | |
| tagline_en | text | NULL | — | |
| strava_url | text | NULL | — | |
| image_url | text | NULL | — | URL |
| sort_order | integer | NOT NULL | 0 | |
| status | text | NOT NULL | 'draft' | CHECK IN ('draft','published','archived') |
| created_at | timestamptz | NULL | now() | |
| updated_at | timestamptz | NULL | now() | |

**Indexes:** `idx_team_members_status`, `idx_team_members_sort`

**Trigger:** `team_members_updated_at` → `update_updated_at()`

---

### Table: `podcast_guests`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| name | text | NOT NULL | — | |
| role_fi | text | NULL | — | |
| role_en | text | NULL | — | |
| tagline_fi | text | NULL | — | |
| tagline_en | text | NULL | — | |
| image_url | text | NULL | — | |
| links | jsonb | NULL | '{}' | Record<string, string> |
| episode_url | text | NULL | — | |
| featured | boolean | NOT NULL | false | |
| status | text | NOT NULL | 'hidden' | CHECK IN ('published','hidden') |
| published_at | date | NULL | — | |
| created_at | timestamptz | NULL | now() | |
| updated_at | timestamptz | NULL | now() | |

**Indexes:** `idx_podcast_guests_status`, `idx_podcast_guests_featured` (partial), `idx_podcast_guests_published`

**Trigger:** `podcast_guests_updated_at` → `update_updated_at()`

---

### Table: `podcast_guest_requests`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| name | text | NOT NULL | — | |
| email | text | NULL | — | |
| message | text | NULL | — | |
| created_at | timestamptz | NULL | now() | |

**Queries:** Public form (POST), admin list (getPodcastGuestRequests via service role).

---

### Supporting tables (optional / app-only)

| Table | Purpose | Used by |
|-------|---------|---------|
| ratings | User ratings (1–5, winter_run) | `/api/ratings` (app, Bearer auth) |
| rating_aggregates | Cached avg/count per item | `getRatingAggregates()` — **not called anywhere** in cleaned codebase |

**Note:** `ratings` and `rating_aggregates` reference `public.items(id)` in existing migrations. The `items` table is legacy. If ratings are kept, FKs must reference `routes(id)` (or similar).

---

## 2. Storage

| Bucket | Expected Name | Access | Usage |
|--------|---------------|--------|-------|
| GPX files | `gpx` | Public | Route GPX uploads via `/api/admin/routes/upload`; public URLs via `getGpxDownloadUrl()` |

**GPX bucket:**
- **Public:** Yes (getPublicUrl used for downloads)
- **Upload:** Service role (admin upload route)
- **MIME:** `application/gpx+xml` or `file.type` from FormData
- **Path format:** `{timestamp}-{sanitized_filename}.gpx` (no `gpx/` prefix in path)
- **File size:** No explicit limit in code

**Other storage:** `hero_image`, `image_url` in content_items, team_members, podcast_guests are URLs (external or Supabase storage); no dedicated bucket defined in code.

---

## 3. RLS requirements

### Public-facing tables (anon/authenticated read)

| Table | Policy needed | Current migration |
|-------|---------------|-------------------|
| events | SELECT where status='published' | ✅ "Public can read published events" |
| routes | SELECT where status='published' | ⚠️ Policy exists but **RLS not enabled** on routes |
| content_items | SELECT where status='published' | ✅ "Public can read published content" |
| team_members | SELECT where status='published' | ✅ "Public can read published team members" |
| podcast_guests | SELECT where status='published' | ✅ "Public can read published podcast guests" |
| podcast_guest_requests | — | Admin read only (service role) |
| rating_aggregates | SELECT (all) | ✅ "Public can read rating aggregates" |

### Public writes (anon)

| Table | Operation | Policy needed | Current |
|-------|-----------|---------------|---------|
| events | INSERT | Allow insert with status='draft' | ❌ **Missing** — SubmitEventForm uses anon client |
| podcast_guest_requests | INSERT | Allow insert | ✅ "Anyone can insert guest request" |

---

## 4. Admin-managed tables (service role)

Admin APIs use `getSupabaseServerClient()` → **SUPABASE_SERVICE_ROLE_KEY**. Service role bypasses RLS.

- **events:** create, update (publish/unpublish), delete
- **routes:** create, update (publish/unpublish), delete, upload GPX
- **content_items:** create, update
- **team_members:** create, update
- **podcast_guests:** create, update

No RLS policies are required for admin as long as the service role key is used. Admin auth is enforced by cookie (`admin_auth`) or `x-admin-token` in API routes, not by RLS.

---

## 5. Missing or likely missing pieces

### Critical

1. **events INSERT policy for anon**
   - `SubmitEventForm` uses `getSupabaseClient()` (anon).
   - Events table has only `"Public can read published events"` (SELECT).
   - No INSERT policy → anonymous event submissions will fail.
   - **Fix:** Add policy, e.g. `"Anyone can insert draft events"` with `WITH CHECK (status = 'draft')`.

2. **routes RLS not enabled**
   - Routes migration defines a SELECT policy but does not run `ALTER TABLE routes ENABLE ROW LEVEL SECURITY`.
   - Effect: policy is ignored; table is fully accessible. Enabling RLS without additional policies would break anon reads unless the SELECT policy is in place.
   - **Fix:** Add `ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY` before creating the policy. Policy is already correct.

### Dependency / legacy

3. **update_updated_at()**
   - Defined in `20250227000000_create_items.sql`.
   - Used by events, content_items, team_members, podcast_guests, ratings.
   - If `items` migration is skipped/removed, the function must be created elsewhere.

4. **ratings / rating_aggregates**
   - Migrations reference `public.items(id)`.
   - `items` table removed from model.
   - `getRatingAggregates()` exists but is not imported anywhere.
   - **Options:** (a) Drop ratings/rating_aggregates if unused; (b) Migrate FKs to `routes(id)` if ratings should apply to routes; (c) Leave as-is if items table still exists for backward compatibility.

### Minor

5. **podcast_guest_requests — admin read**
   - Admin reads via service role → RLS bypassed. No policy needed.

6. **routes.updated_at**
   - Routes table has no `updated_at` column. Admin update route does not set it. Not blocking but inconsistent with other tables.

---

## 6. Recommended SQL statements

### Fix 1: Events INSERT for public submissions

```sql
create policy "Anyone can insert draft events"
  on public.events for insert
  with check (status = 'draft');
```

### Fix 2: Routes RLS

```sql
alter table public.routes enable row level security;
-- Policy "Public can read published routes" should already exist
```

### Fix 3: Ensure update_updated_at exists (if items migration removed)

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

### Fix 4 (optional): Ratings for routes (if items removed)

If ratings should apply to routes:

```sql
-- Requires dropping old ratings/rating_aggregates first or migrating data
alter table public.ratings drop constraint if exists ratings_item_id_fkey;
alter table public.ratings add constraint ratings_item_id_fkey
  foreign key (item_id) references public.routes(id) on delete cascade;

alter table public.rating_aggregates drop constraint if exists rating_aggregates_item_id_fkey;
alter table public.rating_aggregates add constraint rating_aggregates_item_id_fkey
  foreign key (item_id) references public.routes(id) on delete cascade;
```

### Storage: GPX bucket

```sql
-- Via Supabase Dashboard or API: create bucket "gpx", set to public
insert into storage.buckets (id, name, public)
values ('gpx', 'gpx', true)
on conflict (id) do update set public = true;
```

---

## 7. Summary

| Item | Status |
|------|--------|
| events schema | ✅ OK |
| routes schema | ✅ OK (RLS not enabled) |
| content_items schema | ✅ OK |
| team_members schema | ✅ OK |
| podcast_guests schema | ✅ OK |
| podcast_guest_requests schema | ✅ OK |
| gpx storage bucket | Required, must be public |
| events INSERT policy | ❌ Missing |
| routes RLS | ⚠️ Not enabled |
| update_updated_at | Depends on items migration |
| ratings/rating_aggregates | Legacy; FK to items; unused in web |
