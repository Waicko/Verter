-- Allow anonymous insert for public event submissions (status=draft only)
-- Client-side SubmitEventForm uses anon key; route submit goes via API (service role)

create policy "Anyone can insert draft events"
  on public.events for insert
  to anon, authenticated
  with check (status = 'draft');
