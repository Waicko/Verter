-- Add slug to events if table exists (for existing deployments)
alter table public.events add column if not exists slug text unique;
