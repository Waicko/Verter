-- Add type column to events: 'race', 'camp', 'community'
-- Default 'community' for existing rows
alter table public.events add column if not exists type text default 'community';
update public.events set type = 'community' where type is null;
alter table public.events drop constraint if exists events_type_check;
alter table public.events add constraint events_type_check
  check (type in ('race', 'camp', 'community'));
create index if not exists idx_events_type on public.events (type) where type is not null;
