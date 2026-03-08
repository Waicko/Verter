-- Source, origin, rights and verification metadata
-- Applied to routes, events, content_items

-- Common metadata for routes, events, content_items
do $$
begin
  -- routes
  alter table public.routes add column if not exists source_type text;
  alter table public.routes add column if not exists source_name text;
  alter table public.routes add column if not exists source_url text;
  alter table public.routes add column if not exists submitted_by_name text;
  alter table public.routes add column if not exists submitted_by_email text;
  alter table public.routes add column if not exists rights_basis text;
  alter table public.routes add column if not exists license_name text;
  alter table public.routes add column if not exists license_url text;
  alter table public.routes add column if not exists verification_status text;

  -- routes-only: GPX/origin metadata
  alter table public.routes add column if not exists route_origin_type text;
  alter table public.routes add column if not exists route_origin_name text;
  alter table public.routes add column if not exists route_origin_url text;

  -- events
  alter table public.events add column if not exists source_type text;
  alter table public.events add column if not exists source_name text;
  alter table public.events add column if not exists source_url text;
  alter table public.events add column if not exists submitted_by_name text;
  alter table public.events add column if not exists submitted_by_email text;
  alter table public.events add column if not exists rights_basis text;
  alter table public.events add column if not exists license_name text;
  alter table public.events add column if not exists license_url text;
  alter table public.events add column if not exists verification_status text;

  -- content_items
  alter table public.content_items add column if not exists source_type text;
  alter table public.content_items add column if not exists source_name text;
  alter table public.content_items add column if not exists source_url text;
  alter table public.content_items add column if not exists submitted_by_name text;
  alter table public.content_items add column if not exists submitted_by_email text;
  alter table public.content_items add column if not exists rights_basis text;
  alter table public.content_items add column if not exists license_name text;
  alter table public.content_items add column if not exists license_url text;
  alter table public.content_items add column if not exists verification_status text;
end $$;
