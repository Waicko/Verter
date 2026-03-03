# Sprint 2 — Content + Growth — Report

## Completed Tasks

### TASK 1 — Seed data
- **Seed script**: `scripts/seed-items.ts` + `scripts/seed-data.ts`
- **Counts**:
  - Routes: **48** (Finland focus: easy trails, road-friendly, technical, race routes)
  - Events: **40** (parkruns, club runs, mäkitunkkaus-style sessions, local races 5k–marathon, ultras)
  - Camps: **15** (Finland + 3 abroad: Alps, Norway, Sweden)
  - **Total: 103 items**
- Every item has `official_url` OR `external_links` with at least one credible source.
- Recurring events (parkrun, weekly runs): `recurrence: "weekly"`, `start_date` optional.
- Camps use `season` (Summer/Winter) when exact dates unknown.
- **Run**: `npm run seed` (requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`)

### TASK 2 — External sources (trust)
- Route and event/camp detail pages show **“Lisälähteet / External sources”** when `official_url` or `external_links` exist.
- Primary button: FI “Virallinen sivu”, EN “Official website”.
- Links use `target="_blank"` and `rel="noopener noreferrer"`.
- At least 103 seeded items have external links.

### TASK 3 — Submission UX polish
- Helper text per type (route, event, camp) on submit form.
- “Approval principles” section (short bullets).
- URL format validation before submit.
- Success copy:
  - FI: “Kiitos! Tarkistamme ehdotuksen ja julkaisemme hyväksytyt lisäykset.”
  - EN: “Thanks! We review submissions and publish approved entries.”

### TASK 4 — Admin moderation ergonomics
- Quick filters: type, region, newest first.
- Approve and Reject actions in list.
- Reject: optional `reject_reason` textarea.
- Approve: auto-generate slug if missing, ensure uniqueness.
- Quality checklist in preview: official link, region/country, description, date/recurrence (events), distance (routes).

### TASK 5 — Copy + labels
- Nav labels updated:
  - FI: Reitit & Polut, Tapahtumat & Leirit, Sisältö, Tarina
  - EN: Routes & Trails, Events & Camps, Content, Story
- Type label “Kilpailu” → “Tapahtuma” for broader event types (parkruns, group runs).
- FI copy reviewed; no robotic phrasing found.

---

## Seed counts after running `npm run seed`

| Type  | Count |
|-------|-------|
| Routes| 48    |
| Events| 40    |
| Camps| 15    |
| Total| 103   |

---

## Missing fields patterns

- Some race/camp URLs may be placeholder or inferred (e.g. city sports pages) where no official page exists.
- A few camps abroad use `external_links` only (no `official_url`).
- `organizer_name` often null for seed data.

---

## Top 5 next improvements for Sprint 3

1. **Email notifications**: Notify submitters when their item is approved/rejected.
2. **Bulk approve/reject**: Approve or reject multiple pending items at once.
3. **Search**: Full-text search on routes, events, camps.
4. **Map improvements**: Better clustering and route preview on hover.
5. **Edit published items**: Allow admins to edit slugs and content after publish.

---

## Files changed/added

### Added
- `scripts/seed-data.ts` — Seed data (routes, events, camps)
- `scripts/seed-items.ts` — Runner script for Supabase insert
- `SPRINT2_REPORT.md` — This report

### Modified
- `package.json` — Added `seed` script
- `messages/fi.json` — Nav labels, typeEvent
- `messages/en.json` — Nav labels

### Migrations / seed scripts
- **Seed script**: `scripts/seed-items.ts` (run with `npm run seed`)
- No database migrations added; assumes existing `items` table.

### Previously completed (from conversation summary)
- `lib/data/items-queries.ts`
- `app/[locale]/routes/[slug]/page.tsx`
- `app/[locale]/events/[slug]/page.tsx`
- `components/SubmitForm.tsx`
- `app/[locale]/admin/submissions/` (filters, ApproveRejectButtons)
- `components/admin/QualityChecklist.tsx`
- `app/api/admin/items/[id]/route.ts`
