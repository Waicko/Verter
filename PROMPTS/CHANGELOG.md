# Cursor Prompts & Decisions Changelog

Log of major prompts and architectural decisions made via Cursor. Update when implementing significant features.

---

## 2025-02-27

### Unified items model
**Prompt**: Extend data model to support all running-related entries; replace routes-only with unified "items" (route | camp | event); add Type filter; conditional card rendering; URL params for type.

**Outcome**: `lib/types.ts` VerterItem union; `lib/data/items.ts` unified source; FilterBar with type multi-select; ItemCard with type-specific blocks. Default = all types selected.

---

### Filtering system expansion
**Prompt**: Add distance range, elevation range, recurring filter; keep region and training.

**Outcome**: FilterBar extended with min/max inputs for distance (km) and elevation (m); recurring toggle for events; all filters in URL (distanceMin, distanceMax, elevationMin, elevationMax, recurring=1).

---

### Admin + CMS (Supabase)
**Prompt**: Content management workflow; Supabase items table; admin UI (dashboard, create, edit, submissions); public submission; password gate.

**Outcome**:
- Migration: `supabase/migrations/20250227000000_create_items.sql`
- Admin: `app/[locale]/admin/` with layout, items/new, items/[id]/edit, submissions
- Public: "Suggest" button → `app/[locale]/suggest` → POST `/api/items/submit` (status=pending)
- Auth: `ADMIN_PASSWORD` + cookie-based gate
- Routes list: `loadItemsData()` fetches published from Supabase, fallback to static

---

### Project documentation
**Prompt**: Create/update README.md, SPEC.md, DATA_MODEL.md, ROADMAP.md, PROMPTS/CHANGELOG.md as source of truth.

**Outcome**: All files created; populated with goals, non-goals, UX decisions, data model, roadmap phases, and this changelog.

---

### Public submit form (simplified)
**Prompt**: Implement "Add your event/route/camp" submission; CTA on routes, camps, events pages; form at /[locale]/submit; success message; admin submissions.

**Outcome**:
- New `/submit` page with simplified form (Type, Title, Location, Date for events, Official URL, Short description, Contact email)
- CTA "Add your event, route or camp" on Routes, Camps, Leirit pages
- Submit → insert into Supabase items (status=pending)
- Success page at `/submit/success` with thank-you message
- `/suggest` redirects to `/submit`
- Admin submissions at `/admin/submissions` (already existed)

---

## Convention

**From now on**: When implementing a major feature, update SPEC.md and ROADMAP.md accordingly, and add an entry here.
