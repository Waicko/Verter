-- Verter team_members table (editable via Admin Studio)
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_fi text,
  role_en text,
  tagline_fi text,
  tagline_en text,
  strava_url text,
  image_url text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_team_members_status on public.team_members (status);
create index idx_team_members_sort on public.team_members (sort_order);

create trigger team_members_updated_at
  before update on public.team_members
  for each row execute function update_updated_at();

alter table public.team_members enable row level security;

create policy "Public can read published team members"
  on public.team_members for select
  using (status = 'published');
