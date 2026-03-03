# Testing: Public Submissions with Mandatory Moderation

## Prerequisites

1. Supabase project with migrations applied:
   - `supabase/migrations/20250227000000_create_items.sql`
   - `supabase/migrations/20250228000000_add_submission_fields.sql`
2. `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`

## Flow: Submit → Admin review → Publish

### 1. Submit (public, no login)

1. Go to `/fi/routes` or `/en/routes` or `/fi/camps` or `/en/leirit`
2. Click **"Puuttuuko listalta? Lisää oma tapahtuma / reitti / leiri"** (FI) or **"Missing from the list? Submit an event / route / camp"** (EN)
3. Or go directly to `/fi/submit` or `/en/submit`
4. Fill the form:
   - Type: route | event | camp
   - Title *
   - Region, Country (optional), Location name
   - Official URL
   - Date + Recurring (only if event)
   - Short description (max 600 chars)
   - Contact email (optional)
5. Click **Submit**
6. Verify: redirected to `/submit/success` with thank-you message explaining review

### 2. Appears in admin

1. Go to `/fi/admin` (or `/en/admin`)
2. Enter `ADMIN_PASSWORD`
3. Click **Submissions**
4. Verify: the submitted item appears with status **pending**
5. Filters: use Type and Region dropdowns to filter
6. **Preview**: click "Preview" → goes to edit page
7. **Approve** → status becomes `published`
8. **Reject** → status becomes `rejected`

### 3. Appears publicly (after approve)

1. Go to `/fi/routes` or `/en/routes`
2. Verify: approved item appears in the list (when Supabase is used)
3. Verify: rejected items do NOT appear
4. Verify: pending items do NOT appear

## Core rules

- **Anyone can submit** – no login
- **All submissions** → `status = "pending"`
- **Public pages** show ONLY `status = "published"`
- **Admin** Approve → `published`, Reject → `rejected`
- Nothing auto-publishes

## Quick checklist

- [ ] Submit form inserts with status=pending
- [ ] Success page explains review
- [ ] Admin submissions list shows pending only
- [ ] Filters (type, region) work
- [ ] Preview links to edit page
- [ ] Approve sets published
- [ ] Reject sets rejected
- [ ] Public routes list shows only published (when Supabase configured)
- [ ] CTA text correct on routes, camps, leirit
