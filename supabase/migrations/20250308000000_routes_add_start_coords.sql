-- Add start coordinates for route map markers (first point from GPX track)
alter table public.routes add column if not exists start_lat numeric;
alter table public.routes add column if not exists start_lng numeric;

create index if not exists idx_routes_start_coords on public.routes (start_lat, start_lng)
  where start_lat is not null and start_lng is not null;
