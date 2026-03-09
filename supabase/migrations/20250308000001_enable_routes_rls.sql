-- Enable Row Level Security for routes table.
-- The policy "Public can read published routes" (created in 20250306000000) restricts
-- SELECT to status = 'published' for anon/authenticated.
-- Admin and API use service_role which bypasses RLS.
alter table public.routes enable row level security;
