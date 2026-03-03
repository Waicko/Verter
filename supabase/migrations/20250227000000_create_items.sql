-- Verter items table: routes, events, camps (unified content)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('route', 'event', 'camp')),
  status text not null default 'draft' check (status in ('draft', 'pending', 'published', 'archived')),

  -- Common fields
  title text not null,
  slug text not null,
  region text,
  country text,
  location_name text,
  start_lat numeric,
  start_lng numeric,
  summary text,
  description text,
  tags text[] default '{}',
  external_links jsonb default '[]',

  -- Route fields
  distance_km numeric,
  elevation_gain_m numeric,
  technicality_1_5 numeric check (technicality_1_5 is null or (technicality_1_5 >= 1 and technicality_1_5 <= 5)),
  winter_score_1_5 numeric check (winter_score_1_5 is null or (winter_score_1_5 >= 1 and winter_score_1_5 <= 5)),
  gpx_url text,
  route_origin text,

  -- Event fields
  start_date date,
  end_date date,
  recurrence text,
  distance_options jsonb default '[]',
  organizer_name text,

  -- Camp fields
  season text,
  duration_days integer,
  focus text,

  -- Submission fields (for public submissions)
  submitter_name text,
  submitter_email text,
  submitter_role text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique (slug)
);

create index idx_items_type on public.items (type);
create index idx_items_status on public.items (status);
create index idx_items_slug on public.items (slug);
create index idx_items_status_type on public.items (status, type);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_updated_at
  before update on public.items
  for each row execute function update_updated_at();

-- Enable RLS (optional for MVP; can restrict later)
alter table public.items enable row level security;

-- Policy: allow public read of published items
create policy "Public can read published items"
  on public.items for select
  using (status = 'published');

-- Policy: allow anonymous insert for public submission (status must be pending)
create policy "Anyone can insert pending submissions"
  on public.items for insert
  with check (status = 'pending');

-- Policy: allow anonymous update (admin will use service role; for MVP we use service key client-side for admin)
-- For proper MVP, admin uses service role key which bypasses RLS.
-- These policies allow anon/authenticated to insert; admin will need service_role or we use a different approach.
-- Simplest: use service_role key in server-side admin; anon key for client with insert policy.
