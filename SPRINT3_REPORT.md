# Sprint 3 — Trust, Quality & UX Polish — Report

## Completed Tasks

### 1) Map UX refinement (Routes hub)
- **Map OFF by default** — Initial state is `false`; only shown when URL has `?map=1` or localStorage has stored preference
- **Show map / Hide map toggle** — Clear button in header
- **Persist in URL + localStorage** — `?map=1` in URL; `routes-map-visible` key in localStorage
- **Map never blocks filters on mobile** — Map moved from fullscreen overlay to inline section below the list; filters and list remain visible
- **Marker ref cleanup** — Added explicit `marker.remove()` before clearing `markersMap` and on unmount to avoid ref warnings

### 2) Organizer / Owner improvement CTA
- **Route detail** — CTA: FI "Tiedätkö paremman kuvauksen tai GPX:n? Täydennä tietoja." / EN "Know a better description or GPX? Improve the listing."
- **Event/camp detail** — CTA: FI "Onko tämä sinun tapahtumasi? Täydennä tietoja." / EN "Is this your event? Improve the listing."
- **Link to submit** — `/submit?type=route&itemId=slug` (or `type=event`, `type=camp`)
- **Update suggestion tracking** — New `update_for_slug` column; migration: `supabase/migrations/20250227000000_add_update_for_slug.sql`
- **Submit form prefills** — `initialType` and `updateForSlug` from URL params

### 3) Data quality gates in Admin
- **Required fields per type:**
  - **Route**: title, region or country, short_description (or description/summary), at least one link (official_url or external_links)
  - **Event**: title, region or country, short_description, official_url, and either start_date or recurrence
  - **Camp**: title, region or country, short_description, official_url, and season or dates
- **Missing-field warnings** — Amber box lists required fields when incomplete
- **Publish disabled** until all requirements met; **Save Draft** always allowed

### 4) UX polish + performance
- **Loading states** — `loading.tsx` for `/routes` and `/events` with skeleton layout
- **Empty state component** — Localized EmptyState with icon, message, and "Clear filters" when filters are active
- **Filtering** — Client-side useMemo; remains fast for 200+ items (O(n) per filter)

---

## Implemented quality rules (Admin)

| Type  | Required fields                                                                 |
|-------|----------------------------------------------------------------------------------|
| Route | title, region or country, short_description (or description/summary), at least one link |
| Event | title, region or country, short_description, official_url, start_date or recurrence    |
| Camp  | title, region or country, short_description, official_url, season or dates             |

---

## Test checklist

- [ ] Map: Default off, toggle on/off, refresh with `?map=1`, close and reopen
- [ ] Map: Mobile — filters visible, map below list, no overlay
- [ ] Route detail: Click improvement CTA → submit form prefill with `type=route` and itemId
- [ ] Event detail: Click improvement CTA → submit form prefill with `type=event`/`camp` and itemId
- [ ] Submit with `updateForSlug` → pending row has `update_for_slug` set
- [ ] Admin: Item missing required fields → Publish disabled, warnings shown
- [ ] Admin: Fill all required fields → Publish enabled
- [ ] Admin: Save Draft works regardless of completeness
- [ ] Routes/Events: Loading skeleton during navigation
- [ ] Routes/Events: Empty state with filters → Clear button
- [ ] Filter 200+ items → instant response

---

## Files changed/added

### Added
- `lib/admin/quality-rules.ts` — Validation rules for publishing
- `components/EmptyState.tsx` — Empty state component
- `app/[locale]/routes/loading.tsx` — Routes loading skeleton
- `app/[locale]/events/loading.tsx` — Events loading skeleton
- `supabase/migrations/20250227000000_add_update_for_slug.sql` — Add `update_for_slug` to items

### Modified
- `app/[locale]/routes/RoutesPageClient.tsx` — Map off by default, inline map, EmptyState
- `app/[locale]/routes/[slug]/page.tsx` — Removed RouteRatingSection, added improvement CTA
- `app/[locale]/events/[slug]/page.tsx` — Added improvement CTA
- `components/MapView.tsx` — Marker cleanup on unmount
- `app/[locale]/submit/page.tsx` — Accept searchParams, pass to form
- `components/SubmitForm.tsx` — initialType, updateForSlug, send update_for_slug
- `app/api/items/submit/route.ts` — Accept and store update_for_slug
- `lib/db/types.ts` — Add update_for_slug
- `components/admin/ItemForm.tsx` — Quality gates, missing-field warnings, Publish disabled
- `components/admin/QualityChecklist.tsx` — external_links, camp season, hasSeasonOrDates
- `messages/fi.json`, `messages/en.json` — New keys for CTAs, empty state, admin
