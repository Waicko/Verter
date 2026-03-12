-- Add localized FI/EN fields for content_items.
-- Keep title, slug, summary, body for backward compatibility (do not remove).
-- excerpt_* mirrors summary; seo_* for future metadata use.

-- Localized title and slug
alter table public.content_items add column if not exists title_fi text;
alter table public.content_items add column if not exists title_en text;
alter table public.content_items add column if not exists slug_fi text;
alter table public.content_items add column if not exists slug_en text;

-- Localized excerpt (alias for summary)
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

-- Backfill: copy existing single-language content into FI columns
update public.content_items
set
  title_fi = coalesce(title_fi, title),
  slug_fi = coalesce(slug_fi, slug),
  excerpt_fi = coalesce(excerpt_fi, summary),
  body_fi = coalesce(body_fi, body)
where title is not null or slug is not null or summary is not null or body is not null;

-- Unique indexes for slug lookup (public routing: /fi/content/[slug_fi], /en/content/[slug_en])
create unique index if not exists idx_content_items_slug_fi_unique on public.content_items (slug_fi) where slug_fi is not null;
create unique index if not exists idx_content_items_slug_en_unique on public.content_items (slug_en) where slug_en is not null;
