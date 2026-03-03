-- Add author, archived status, body NOT NULL to content_items
alter table public.content_items add column if not exists author text;

-- Update existing null body to empty string
update public.content_items set body = '' where body is null;

-- Make body not null with default
alter table public.content_items alter column body set default '';
alter table public.content_items alter column body set not null;

-- Add archived to status check
alter table public.content_items drop constraint if exists content_items_status_check;
alter table public.content_items add constraint content_items_status_check
  check (status in ('draft', 'published', 'archived'));
