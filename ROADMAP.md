# Verter Roadmap

Phases, sprints, and priorities.
Update whenever architecture or scope changes.

---

## ✅ Completed

### Phase 1: Foundation
- [x] Next.js App Router + Tailwind
- [x] FI/EN localization (next-intl)
- [x] Routes hub (list-first + optional map)
- [x] Events & Camps hub
- [x] Story/About page

---

### Phase 2: Unified Items Model
- [x] Unified items table (route | event | camp)
- [x] Supabase integration
- [x] Public lists show only `published`
- [x] Filters (region, type, distance, recurring)
- [x] URL query params for filters
- [x] Detail pages resolve from Supabase
- [x] Legacy redirects (leirit, camps, suggest)

---

### Phase 3: Admin Studio
- [x] Admin dashboard (Published / Pending / Drafts)
- [x] Create / Edit / Archive items
- [x] Submission moderation (approve/reject)
- [x] Preview toggle (Edit / Preview)
- [x] Password gate protection for /admin
- [x] Public submit flow at /[locale]/submit
- [x] Redirect /suggest → /submit

---

### Phase 4: Full CMS
- [x] Content moved to Supabase (blog / review / podcast / comparison)
- [x] Content admin CRUD
- [x] Markdown rendering + preview
- [x] Related items linking
- [x] Team section (admin editable or structured)
- [x] Podcast guest request intake (admin-managed)

---

## 🔄 Current Focus

### Phase 5: Platform Hardening

- [ ] SEO metadata for dynamic items
- [ ] Structured data (schema.org for events and podcasts)
- [ ] Admin logout (clear cookie)
- [ ] Image handling strategy (public vs Supabase storage)
- [ ] Production deployment (Vercel)
- [ ] Environment variable audit
- [ ] Tighten Supabase RLS policies
- [ ] Remove static content fallback where unnecessary

---

## 🚀 Upcoming

### Phase 6: Auth + Roles

- [ ] Supabase Auth for admin (replace password gate)
- [ ] Role-based permissions
- [ ] Optional contributor roles
- [ ] Audit logging (who changed what)

---

### Phase 7: Podcast Expansion

- [ ] Dedicated /podcast hub page
- [ ] Featured guest (viikon vieras)
- [ ] Past guests gallery (kunniagalleria)
- [ ] Episode linking improvements

---

### Phase 8: Community Layer

- [ ] App-only ratings (authenticated users)
- [ ] Saved routes
- [ ] Favorites
- [ ] Basic user profiles

---

### Phase 9: Mobile App (separate repo)

- [ ] Lightweight training planner
- [ ] Saved routes sync
- [ ] Shared Supabase + shared types
- [ ] Unified design system across web & app

---

## 🎯 Strategic Priorities (Now)

1. Secure and harden admin + Supabase access
2. Stabilize CMS workflows
3. Improve SEO and discoverability
4. Prepare backend for future app integration
