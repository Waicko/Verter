-- Events table for races, camps, and events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  date date,
  location text,
  registration_url text,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_events_status on public.events (status);
create index if not exists idx_events_date on public.events (date);
create index if not exists idx_events_slug on public.events (slug) where slug is not null;

create trigger events_updated_at
  before update on public.events
  for each row execute function update_updated_at();

alter table public.events enable row level security;

create policy "Public can read published events"
  on public.events for select
  using (status = 'published');
