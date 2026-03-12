-- Add canonical field for content → route linking.
-- Uses route slugs (routes.slug) for direct URL generation.
-- The legacy related_item_ids column is kept for now.
alter table public.content_items
  add column if not exists related_route_slugs text[] default '{}';
