-- Add submission fields and rejected status for mandatory moderation

-- Add columns for public submission form
alter table public.items add column if not exists official_url text;
alter table public.items add column if not exists short_description text;
alter table public.items add column if not exists reject_reason text;

-- Update status check to include 'rejected'
alter table public.items drop constraint if exists items_status_check;
alter table public.items add constraint items_status_check
  check (status in ('draft', 'pending', 'published', 'archived', 'rejected'));

-- Ensure we have indexes for admin submission filters
create index if not exists idx_items_status_type on public.items (status, type);
create index if not exists idx_items_region on public.items (region) where region is not null;
