-- Route trust and verification metadata
alter table public.routes add column if not exists submitted_by_strava_url text;
alter table public.routes add column if not exists approved_by_verter boolean default false;
alter table public.routes add column if not exists approved_by_name text;
alter table public.routes add column if not exists approved_at timestamptz;
alter table public.routes add column if not exists tested_by_team boolean default false;
alter table public.routes add column if not exists tested_notes text;
