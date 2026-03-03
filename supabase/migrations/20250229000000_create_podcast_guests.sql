-- Podcast guests (public display on /podcast)
create table if not exists public.podcast_guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_fi text,
  role_en text,
  tagline_fi text,
  tagline_en text,
  image_url text,
  links jsonb default '{}',
  episode_url text,
  featured boolean not null default false,
  status text not null default 'hidden' check (status in ('published', 'hidden')),
  published_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_podcast_guests_status on public.podcast_guests (status);
create index idx_podcast_guests_featured on public.podcast_guests (featured) where featured = true;
create index idx_podcast_guests_published on public.podcast_guests (published_at desc);

create trigger podcast_guests_updated_at
  before update on public.podcast_guests
  for each row execute function update_updated_at();

alter table public.podcast_guests enable row level security;

create policy "Public can read published podcast guests"
  on public.podcast_guests for select
  using (status = 'published');

-- Podcast guest requests (form submissions, admin-only)
create table if not exists public.podcast_guest_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  message text,
  created_at timestamptz default now()
);

alter table public.podcast_guest_requests enable row level security;

-- Anyone can submit a guest request
create policy "Anyone can insert guest request"
  on public.podcast_guest_requests for insert
  with check (true);
