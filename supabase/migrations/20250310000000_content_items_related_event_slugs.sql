-- Add canonical field for content → event linking.
-- Uses event slugs (events.slug) for direct URL generation.
-- Mirrors related_route_slugs pattern.
alter table public.content_items
  add column if not exists related_event_slugs text[] default '{}';
