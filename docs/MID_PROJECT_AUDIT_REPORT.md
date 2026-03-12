# Verter — Mid-Project Audit Report

**Date:** March 2025  
**Scope:** Current codebase state, documentation accuracy, backlog priorities  
**Method:** Code inspection and doc review (no edits made)

---

## 1. CURRENT PRODUCT STATUS

### Public Pages

| Page | Status | Data Source | Notes |
|------|--------|-------------|-------|
| `/[locale]` (home) | ✅ Working | routes-db, content-items, team | Featured routes (3), latest content (3), podcast teaser, team |
| `/[locale]/routes` | ✅ Working | routes-db | Filters: area, distance, ascent, has_gpx, sort |
| `/[locale]/routes/[slug]` | ✅ Working | routes-db, content-items | GPX map, elevation, download; **Related articles** section |
| `/[locale]/events` | ✅ Working | events-db | Filter by type: race, camp, community |
| `/[locale]/events/[slug]` | ✅ Working | events-db, content-items | **Related articles**, EventRequestForm |
| `/[locale]/content` | ✅ Working | content-items | Excludes podcast-type; filters: content_type, author, sort |
| `/[locale]/content/[slug]` | ✅ Working | content-items, routes-db, events-db | **Related routes** and **related events** sections |
| `/[locale]/podcast` | ✅ Working | podcast (guests) | Featured guest + past guests; no `content_items` |
| `/[locale]/about` | ✅ Working | team | Team members |
| `/[locale]/submit`, `/submit/event`, `/submit/route`, `/submit/success` | ✅ Working | Direct Supabase / API | Public submission flow |
| `/[locale]/podcast-guest` | ✅ Working | POST /api/podcast/guest-request | Guest request form |
| `/[locale]/disclaimer` | ✅ Working | Static | |
| `/[locale]/camps`, `/leirit`, `/suggest` | ✅ Redirects | → events?type=camp or /submit | |

### Admin Pages

| Section | Path | CRUD | Status |
|---------|------|------|--------|
| Dashboard | `/admin` | Read | ✅ Counts: events, routes, content, team, podcast |
| Events | `/admin/events`, new, edit/[id] | Create, Read, Update, Delete, Publish, Unpublish | ✅ |
| Routes | `/admin/routes`, new, edit/[id] | Create, Read, Update, Delete, Publish, Unpublish, Upload GPX | ✅ |
| Content | `/admin/content`, new, [id]/edit | Create, Read, Update, Archive | ✅ No DELETE API |
| Team | `/admin/team`, new, [id]/edit | Create, Read, Update | ✅ No DELETE API |
| Podcast | `/admin/podcast`, guests/new, guests/[id]/edit | Create, Read, Update | ✅ No DELETE for guests |
| Submissions | `/admin/submissions` | — | ⚠️ Redirects to `/admin` (no moderation UI) |

### Submissions

| Flow | Status | Notes |
|------|--------|-------|
| Submit event | ✅ | Direct Supabase insert, `status: draft` |
| Submit route | ✅ | `POST /api/routes/submit`, GPX to `gpx/submissions/`, `status: draft` |
| Admin review | ⚠️ Partial | Drafts appear in events/routes lists; publish from edit page. No dedicated submissions queue. |

### Routes / GPX

| Feature | Status |
|---------|--------|
| GPX upload (admin) | ✅ `POST /api/admin/routes/upload` |
| GPX public submit | ✅ `POST /api/routes/submit` |
| Map + elevation profile | ✅ RouteDetailWithGpx, RouteMap, ElevationProfile |
| GPX download link | ✅ getGpxDownloadUrl() |
| Route trust badges | ✅ submitted_by_strava_url, approved_by_verter, tested_by_team |
| RLS on routes | ✅ Enabled (20250308000001) |

### Content

| Feature | Status |
|---------|--------|
| Content types | blog, review, podcast, comparison |
| Public `/content` list | Excludes podcast (podcasts live on `/podcast`) |
| Markdown body + preview | ✅ |
| Related routes | ✅ `related_route_slugs` — slug-based picker, public section |
| Related events | ✅ `related_event_slugs` — slug-based picker, public section |
| Archive | ✅ Soft delete, hidden from public |
| Source/rights metadata | ✅ SourceMetadataDisplay, SourceRightsMetadataSection |

### Podcast

| Feature | Status |
|---------|--------|
| `/podcast` page | Guest-centric (podcast_guests) |
| Featured guest | ✅ One guest highlighted |
| Past guests | ✅ Gallery |
| Guest request form | ✅ `/podcast-guest` → `/api/podcast/guest-request` |
| Episode entity | ❌ No `podcast_episodes`; guest has `episode_url` |
| `content_type=podcast` in content_items | Still exists; such items appear on `/content` and homepage; not on `/podcast` |

### Team

| Feature | Status |
|---------|--------|
| About page | ✅ getPublishedTeamMembers() |
| Admin CRUD | Create, edit, publish/unpublish |
| Bilingual roles | role_fi, role_en, tagline_fi, tagline_en |

### Cross-Linking

| Link type | Status | Implementation |
|-----------|--------|----------------|
| Content → Routes | ✅ | `related_route_slugs`; public "Related routes" on content detail |
| Content → Events | ✅ | `related_event_slugs`; public "Related events" on content detail |
| Route → Content | ✅ | `getPublishedContentItemsByRouteSlug()`; "Related articles" on route detail |
| Event → Content | ✅ | `getPublishedContentItemsByEventSlug()`; "Related articles" on event detail |
| Content → Content | ❌ | No linking between content items |

---

## 2. RECENTLY COMPLETED WORK

| Item | Description |
|------|-------------|
| **related_route_slugs / related_event_slugs** | Slug-based linking; migrations 20250309, 20250310; replaces ambiguous `related_item_ids` |
| **Public related sections** | Content detail: related routes + events; Route detail: related articles; Event detail: related articles |
| **getPublishedContentItemsByRouteSlug** | Fetches content items that reference route slug |
| **getPublishedContentItemsByEventSlug** | Fetches content items that reference event slug |
| **Admin content form** | Slug-based route/event pickers (getAdminRoutes, getAdminEvents); chips for selected items |
| **Admin auth** | Signed session cookie (`ADMIN_SESSION_SECRET`); `checkAdmin()` for all admin APIs; no more x-admin-token |
| **Routes RLS** | Enabled via migration 20250308000001 |
| **Events type** | Column `type` (race, camp, community); filter in UI; `/events?type=camp` works |
| **Mobile overflow** | `min-w-0`, `break-words`, `overflow-x-hidden` on layout, prose, chips, SourceMetadataDisplay, related sections |
| **Route trust badges** | submitted_by_strava_url, approved_by_verter, tested_by_team, tested_notes |

---

## 3. PARTIALLY IMPLEMENTED AREAS

| Area | Current State | Gap |
|------|---------------|-----|
| **Bilingual admin** | Admin UI uses FI keys; no locale switcher in admin | Admin not localized; team/podcast have role_fi/role_en |
| **Author/team linking** | Content has `author` (text) | No FK to `team_members`; author is free text |
| **Route submitter linking** | submitted_by_name, submitted_by_email, submitted_by_strava_url | No public display of submitter; no linking to profile |
| **Content ↔ content** | No `related_content_slugs` | Cannot link blog to blog |
| **Event ↔ content UX** | Related articles shown | EventRequestForm exists; no polish for "suggest content for event" |
| **Podcast model** | Guest-centric; `podcast_guests.episode_url` | No episode entity; no `/podcast/[slug]`; plan in PODCAST_ARCHITECTURE_PLAN |
| **Submissions moderation** | Drafts in events/routes lists | No `/admin/submissions` queue; redirects to dashboard |
| **content_type=podcast** | Excluded from `/content` list; in content_items | Overlap with podcast_guests; PODCAST_ARCHITECTURE_PLAN suggests removal |
| **Legacy items** | `items` table exists in migrations | Not used by app; `items-supabase`, `items-loader`, `items-queries` are orphaned |

---

## 4. DOCUMENTATION AUDIT

### README.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| Project structure | ⚠️ Partial | Mentions `items` and `admin/items`; actual structure uses routes, events, content, team, podcast |
| Data model | ⚠️ Outdated | Describes "items" table with route/event/camp; real schema: `routes`, `events` (separate tables) |
| Admin structure | ⚠️ Partial | `admin/items` redirects; actual: events, routes, content, team, podcast |
| Scripts, env vars | ✅ | Correct |
| **Update needed** | | Replace items-centric description with routes/events/content/team/podcast |

### DATA_MODEL.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| Unified items | ❌ Outdated | Describes single `items` table; schema uses `routes` + `events` |
| Field names | ⚠️ Mixed | Some match (distance_km, elevation_gain_m); others differ (name vs title, region vs area) |
| **Update needed** | | Rewrite to reflect `routes`, `events`, `content_items`, `team_members`, `podcast_guests` |

### PRD.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| Items model | ❌ Outdated | Single items table |
| Content model | ⚠️ Partial | related_item_ids deprecated; now related_route_slugs, related_event_slugs |
| **Update needed** | | Align with actual tables and linking |

### SPEC.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| Unified items | ❌ Outdated | Same as DATA_MODEL |
| Content model | ⚠️ | related_item_ids mentioned; actual: related_route_slugs, related_event_slugs |
| **Update needed** | | Update data model section |

### ROADMAP.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| Phase 5 (current) | ✅ | SEO, structured data, admin logout, image strategy, RLS, production |
| Phase 6–9 | ✅ | Auth, podcast expansion, community, mobile app |
| **Update needed** | | Add "related content sections" and "mobile overflow" to Completed; Phase 5 partial progress |

### CONTENT_CMS.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| RelatedItemsPicker | ❌ Removed | Component does not exist; ContentItemForm uses slug-based select + chips |
| getItemsForContentPicker | ❌ Removed | Content form uses getAdminRoutes + getAdminEvents |
| items-supabase | ❌ | Not used by content |
| Migration list | ⚠️ | Missing 20250309, 20250310 (related_route_slugs, related_event_slugs) |
| **Update needed** | | Rewrite related-linking section; add new migrations |

### docs/PROJECT_AUDIT_REPORT.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| Structure, routing, auth | ✅ | Good snapshot |
| RLS | ⚠️ | Says routes RLS "never enabled"; migration 20250308000001 enables it |
| Auth | ⚠️ | Describes cookie `"1"`; actual: signed token via ADMIN_SESSION_SECRET |
| related_item_ids | ⚠️ | Still in schema but deprecated; slug-based linking is canonical |
| **Update needed** | | Refresh RLS and auth sections; add related slugs |

### docs/CONSISTENCY_AUDIT_REPORT.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| Routes admin auth | ❌ Outdated | Says routes use `x-admin-token` + ADMIN_TOKEN; actual: same cookie as other admin |
| Content picker | ❌ Outdated | Says getItemsForContentPicker; actual: getAdminRoutes, getAdminEvents |
| Events type | ⚠️ | Said "no type column"; migration 20250306200000 added it; filter now works |
| **Update needed** | | Fix auth claim; remove items-based picker; confirm events type |

### docs/PODCAST_ARCHITECTURE_PLAN.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| Current state | ✅ | Correct summary of guest-centric model |
| Plan | ✅ | Future episodes, podcast_episode_guests, remove podcast from content_items |
| **Update needed** | | None; use as reference for podcast expansion |

### docs/SUPABASE_SCHEMA_AUDIT.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| Auth | ⚠️ | Mentions x-admin-token; actual: cookie only |
| **Update needed** | | Update auth description |

### SPRINT2_REPORT.md, SPRINT3_REPORT.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| Items, ItemForm, SubmitForm | ❌ Legacy | Refer to old items model; current: RouteForm, EventForm, SubmitRouteForm, SubmitEventForm |
| Quality rules, update_for_slug | ⚠️ | May apply to items; routes/events use different forms |
| **Update needed** | | Archive or mark as historical; current flows differ |

### SCOPE.md

| Aspect | Accurate? | Notes |
|--------|-----------|-------|
| Web app focus | ✅ | Routes, content, SEO |
| **Update needed** | | Minor; still accurate |

---

## 5. BACKLOG / NEXT STEPS

### Stabilize / Cleanup

1. **Remove or archive legacy items code** — `lib/data/items-supabase.ts`, `items-loader.ts`, `items-queries.ts` are not imported; `items` table unused. Either remove or document as deprecated.
2. **Update documentation** — README, DATA_MODEL, PRD, SPEC, CONTENT_CMS, CONSISTENCY_AUDIT to reflect current schema and flows.
3. **Submissions moderation UI** — Either build a real `/admin/submissions` queue or remove the redirect and document that review happens from events/routes lists.
4. **related_item_ids** — Column still exists; consider migration to drop or clearly deprecate in schema comments.

### Admin UX

5. **DELETE APIs** — Add DELETE for content, team, podcast guests (currently only archive/unpublish where applicable).
6. **Admin logout** — Logout API exists; ensure nav/layout exposes it clearly.
7. **Admin locale** — Optional: add locale switcher or document FI-only admin.

### Mobile / Responsive

8. **Mobile testing** — Verify overflow fixes on real devices; use checklist from overflow fix session.
9. **Map on routes list** — PROJECT_AUDIT noted `mapRoutes = []`; routes lack start_lat/lng. Either populate from GPX or accept empty map.

### Content Model

10. **Content ↔ content linking** — Add `related_content_slugs` if cross-linking articles is desired.
11. **Author ↔ team** — Decide: keep free text or add FK to team_members.
12. **content_type=podcast** — Align with PODCAST_ARCHITECTURE_PLAN: either remove from content_items or document overlap clearly.

### Community / Submissions

13. **Ratings** — `ratings`, `rating_aggregates` FK to `items`; broken. Migrate to routes or remove.
14. **Submit route/event UX** — Prefill from `?update_for_slug` if that flow exists; verify submit forms match current API.

---

## 6. RISKS / TECH DEBT

| Risk | Severity | Description |
|------|----------|-------------|
| **Legacy items** | Medium | `items` table, items-supabase, items-loader, items-queries create confusion. Docs still describe items model. |
| **Documentation drift** | High | Multiple docs outdated: auth, related linking, events type, content picker. New contributors will be misled. |
| **Submissions UX** | Low | No dedicated moderation page; works via lists but not obvious. |
| **Podcast overlap** | Medium | `content_type=podcast` vs `podcast_guests`; two representations; plan exists but not implemented. |
| **Ratings** | Low | Broken (items FK); unused; dead code. |
| **Missing migrations** | Low | All current features have migrations; no known missing migrations for active tables. |
| **Admin auth** | Medium | Signed cookie is better than plain "1" but still single-factor; production should move to Supabase Auth. |
| **Sitemap gaps** | Low | Missing `/events`, `/podcast`, `/submit`, `/podcast-guest`; easy to add. |

---

## Summary

- **Core product works**: Public and admin flows for routes, events, content, podcast, team are live. Cross-linking (content ↔ routes, content ↔ events) is implemented with slug-based fields.
- **Recent work**: Admin auth (signed cookie), routes RLS, related slugs, public related sections, mobile overflow fixes.
- **Documentation**: README, DATA_MODEL, PRD, SPEC, CONTENT_CMS, and audit docs are outdated in several places. Priority: update schema and auth descriptions.
- **Legacy**: `items`, items-supabase, items-loader, items-queries, ratings are unused; remove or clearly deprecate.
- **Next focus**: Documentation refresh, legacy cleanup, DELETE APIs, submissions UX, and podcast/content model alignment.

---

*Report generated from codebase inspection. No code or documentation was modified.*
