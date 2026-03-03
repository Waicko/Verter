-- Ratings: app-sourced, one per user per item (upsert in app)
-- Web is read-only; aggregates shown on RouteCard and detail

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  user_id uuid not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  winter_run boolean not null default false,
  status text not null default 'active' check (status in ('active', 'hidden')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique (item_id, user_id)
);

create index idx_ratings_item_id on public.ratings (item_id);
create index idx_ratings_user_id on public.ratings (user_id);

-- Aggregate cache for fast display
create table if not exists public.rating_aggregates (
  item_id uuid primary key references public.items(id) on delete cascade,
  avg_rating numeric not null default 0,
  rating_count integer not null default 0,
  winter_count integer not null default 0,
  updated_at timestamptz default now()
);

create or replace function update_rating_aggregates()
returns trigger as $$
declare
  v_item_id uuid;
  v_avg numeric;
  v_count integer;
  v_winter integer;
begin
  if tg_op = 'DELETE' then
    v_item_id := old.item_id;
  else
    v_item_id := new.item_id;
  end if;

  select
    coalesce(round(avg(rating)::numeric, 2), 0),
    count(*)::integer,
    count(*) filter (where winter_run)::integer
  into v_avg, v_count, v_winter
  from public.ratings
  where item_id = v_item_id and status = 'active';

  insert into public.rating_aggregates (item_id, avg_rating, rating_count, winter_count, updated_at)
  values (v_item_id, coalesce(v_avg, 0), coalesce(v_count, 0), coalesce(v_winter, 0), now())
  on conflict (item_id) do update set
    avg_rating = excluded.avg_rating,
    rating_count = excluded.rating_count,
    winter_count = excluded.winter_count,
    updated_at = excluded.updated_at;

  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger ratings_updated_at
  before update on public.ratings
  for each row execute function update_updated_at();

create trigger ratings_aggregate_trigger
  after insert or update or delete on public.ratings
  for each row execute function update_rating_aggregates();

-- RLS: ratings are app-only (authenticated); web reads aggregates via service/anon
alter table public.ratings enable row level security;
alter table public.rating_aggregates enable row level security;

-- Public read of aggregates (web displays)
create policy "Public can read rating aggregates"
  on public.rating_aggregates for select
  using (true);

-- App: authenticated users can upsert own rating (one per user per item)
create policy "Users can insert own rating"
  on public.ratings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own rating"
  on public.ratings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
