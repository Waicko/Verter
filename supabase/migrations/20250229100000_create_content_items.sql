-- Content items (blog, review, podcast, comparison)
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content_type text not null check (content_type in ('blog', 'review', 'podcast', 'comparison')),
  summary text,
  body text,
  hero_image text,
  related_item_ids jsonb default '[]',
  episode_url text,
  published_at date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_content_items_status on public.content_items (status);
create index idx_content_items_slug on public.content_items (slug);
create index idx_content_items_content_type on public.content_items (content_type);
create index idx_content_items_published on public.content_items (published_at desc) where status = 'published';

create trigger content_items_updated_at
  before update on public.content_items
  for each row execute function update_updated_at();

alter table public.content_items enable row level security;

create policy "Public can read published content"
  on public.content_items for select
  using (status = 'published');
