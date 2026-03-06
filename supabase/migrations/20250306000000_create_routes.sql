-- Routes table for GPX-enabled route management
create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text,
  distance_km numeric,
  ascent_m numeric,
  description text,
  gpx_path text,
  status text not null default 'published' check (status in ('draft', 'published')),
  slug text unique not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_routes_status on public.routes (status);
create index if not exists idx_routes_slug on public.routes (slug);

-- Allow public read for published routes
drop policy if exists "Public can read published routes" on public.routes;
create policy "Public can read published routes"
  on public.routes
  for select
  using (status = 'published');
