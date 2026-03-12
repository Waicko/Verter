-- Add localized FI/EN fields for content_items.
-- Does NOT remove any existing columns.
-- Backfill uses only columns that exist (checked via information_schema).

-- Localized title and slug
alter table public.content_items add column if not exists title_fi text;
alter table public.content_items add column if not exists title_en text;
alter table public.content_items add column if not exists slug_fi text;
alter table public.content_items add column if not exists slug_en text;

-- Localized excerpt (source: summary or excerpt, whichever exists)
alter table public.content_items add column if not exists excerpt_fi text;
alter table public.content_items add column if not exists excerpt_en text;

-- Localized body
alter table public.content_items add column if not exists body_fi text;
alter table public.content_items add column if not exists body_en text;

-- Localized SEO (for generateMetadata)
alter table public.content_items add column if not exists seo_title_fi text;
alter table public.content_items add column if not exists seo_title_en text;
alter table public.content_items add column if not exists seo_description_fi text;
alter table public.content_items add column if not exists seo_description_en text;

-- Backfill: only from columns that actually exist (avoids "column does not exist" errors)
do $$
declare
  has_title boolean;
  has_slug boolean;
  has_summary boolean;
  has_excerpt boolean;
  has_body boolean;
begin
  select exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'content_items' and column_name = 'title') into has_title;
  select exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'content_items' and column_name = 'slug') into has_slug;
  select exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'content_items' and column_name = 'summary') into has_summary;
  select exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'content_items' and column_name = 'excerpt') into has_excerpt;
  select exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'content_items' and column_name = 'body') into has_body;

  if has_title then
    update public.content_items set title_fi = coalesce(title_fi, title) where title is not null;
  end if;
  if has_slug then
    update public.content_items set slug_fi = coalesce(slug_fi, slug) where slug is not null;
  end if;
  if has_summary or has_excerpt then
    if has_summary then
      update public.content_items set excerpt_fi = coalesce(excerpt_fi, summary) where summary is not null;
    elsif has_excerpt then
      update public.content_items set excerpt_fi = coalesce(excerpt_fi, excerpt) where excerpt is not null;
    end if;
  end if;
  if has_body then
    update public.content_items set body_fi = coalesce(body_fi, body) where body is not null;
  end if;
end $$;

-- Unique indexes for slug lookup (public routing: /fi/content/[slug_fi], /en/content/[slug_en])
create unique index if not exists idx_content_items_slug_fi_unique on public.content_items (slug_fi) where slug_fi is not null;
create unique index if not exists idx_content_items_slug_en_unique on public.content_items (slug_en) where slug_en is not null;
