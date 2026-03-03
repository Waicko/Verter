# Verter – Production Readiness Audit

Strict architectural consistency and production-readiness check.

---

## 1) Documentation Consistency

### Alignment

| Doc | Aligned? | Notes |
|-----|----------|-------|
| SPEC.md | ✅ Mostly | Goals, hubs, items model match. Content model omits `author`, `archived` (added in migration). |
| PRD.md | ✅ Yes | Core principles, functional requirements, non-goals match. |
| ROADMAP.md | ✅ Yes | Phases 1–4 complete, Phase 5 hardening in focus. |
| README.md | ✅ Yes | Architecture, env vars, project structure, core concepts. |

### Mismatches / Outdated Statements

| Location | Issue |
|----------|-------|
| SPEC.md | Content model omits `author`, `archived` status. |
| SPEC.md | Podcast listed as "when implemented" but `/podcast` page exists. |
| DATA_MODEL.md | Events/Camps linking says `/events/[slug]`; should be `/[locale]/events/[slug]`. |
| README | "Without Supabase, app uses static seed data" – true for items only; content returns `[]`. |

---

## 2) Architecture Consistency

### Public Hubs & Data Sources

| Hub | Source | Fallback | status filter |
|-----|--------|----------|---------------|
| /routes | `loadRoutesData()` → Supabase | `lib/data/items.ts` (static) | published only |
| /events | `loadEventsData()` → Supabase | `lib/data/items.ts` (static) | published only |
| /content | `getPublishedContentItems()` | None (returns `[]`) | published only |
| /podcast | Supabase `podcast_guests` | — | published only |
| /about (team) | Supabase `team_members` | — | published only |

### Static Fallback Risk

- **Items**: `lib/data/items-loader.ts` uses `staticItems` when Supabase returns empty.
- **Content**: No static fallback.
- **Problem**: If Supabase is configured but empty, routes/events show static seed data. If Supabase has data, static is never used. Inconsistent: README implies "fallback" for dev, but in prod without Supabase you get mixed behavior.

### Deprecated Paths

| Path | Status |
|------|--------|
| `/[locale]/camps` | ✅ Redirects to `/[locale]/events?type=camp` |
| `/[locale]/leirit` | ✅ Redirects to `/[locale]/events?type=camp` |
| `/[locale]/suggest` | ✅ Redirects to `/[locale]/submit` |

### Routes Page Metadata

- **Missing**: `/[locale]/routes` has no `generateMetadata`. Events and content have it.

---

## 3) Security Review

### SUPABASE_SERVICE_ROLE_KEY

- **Usage**: Only in `lib/supabase/server.ts`.
- **Callers**: Server components, API routes (`/api/admin/*`).
- **Client**: `lib/supabase/client.ts` uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` only.
- **Verdict**: ✅ Not exposed client-side.

### Public Access to Draft/Pending

- **RLS**: `items` and `content_items` have `status = 'published'` policy for SELECT.
- **Server client**: Uses service role, which bypasses RLS. But all public queries explicitly filter `status='published'` in application code.
- **Verdict**: ✅ Public cannot see draft/pending via normal flows. Double protection (RLS + app filter).

### Admin Protection

- **Mechanism**: Cookie `admin_auth` with value `"1"` after password check.
- **Layout**: `app/[locale]/admin/layout.tsx` checks cookie before rendering.
- **API routes**: `/api/admin/*` check `checkAdmin()` (same cookie).
- **Weak points**:
  - Cookie value is trivial (`"1"`). Anyone who sets this cookie (e.g. via DevTools) gains admin access.
  - No logout: cookie persists until browser clears it.
  - No rate limiting on `/api/admin/auth`.
  - No CSRF protection on admin API routes.
- **Verdict**: ⚠️ Adequate for MVP, weak for production. Single shared password, trivial bypass.

---

## 4) Data Integrity

### Slug Uniqueness

| Table | Constraint | Handling |
|-------|------------|----------|
| items | `unique (slug)` | DB enforces. Approve flow auto-generates slug. |
| content_items | `slug text not null unique` | DB enforces. API returns error on duplicate. |

- **Content POST**: No pre-check for duplicate slug. Relies on DB; error returned to client.
- **Items approve**: Slug generated; uniqueness not explicitly verified before update. DB would reject.
- **Verdict**: ✅ DB constraints in place. UX could be improved (friendly error messages).

### related_item_ids

- **Storage**: JSONB array of UUIDs.
- **Usage**: `getPublishedItemsByIds(ids)` – filters by `status='published'` and `in("id", ids)`.
- **Stale IDs**: If an item is archived, it won't appear. No broken links; section simply omits it.
- **Invalid UUIDs**: Supabase `.in("id", ids)` filters invalid; returns empty. No crash.
- **Verdict**: ✅ Safe. Graceful degradation.

### Markdown (XSS)

- **Renderer**: `react-markdown` (no `rehype-raw`).
- **Behavior**: Standard markdown only; raw HTML not rendered by default.
- **Risks**: `javascript:` URLs in links, `data:` URIs – depends on react-markdown version and plugins.
- **Verdict**: ⚠️ Low risk without raw HTML. Consider `remark-gfm` only; avoid `rehype-raw`. Audit if adding HTML support.

---

## 5) Performance & SEO

### generateMetadata

| Page | Has Metadata? |
|------|---------------|
| /routes | ❌ No |
| /events | ✅ Yes |
| /content | ✅ Yes |
| /content/[slug] | ✅ Yes (dynamic) |
| /routes/[slug] | ✅ Yes (dynamic) |
| /events/[slug] | ✅ Yes (dynamic) |
| /about | ✅ Yes |
| /podcast | ✅ Yes |
| /disclaimer | ✅ Yes |

**Action**: Add `generateMetadata` to `/[locale]/routes/page.tsx`.

### Missing SEO Improvements

- No `sitemap.xml` generator.
- No `robots.txt` customization.
- No Open Graph images for content/items.
- No canonical URLs for localized pages.
- No `hreflang` for FI/EN alternates.

### schema.org

- No structured data for:
  - Events (Event schema)
  - Routes (Place or custom)
  - Organization
  - PodcastEpisode (for content)

**Verdict**: Basic metadata present. Significant SEO upside untapped.

---

## 6) Technical Debt

### Static Fallbacks to Remove

| Location | Action |
|----------|--------|
| `lib/data/items-loader.ts` | Consider removing static fallback when `NEXT_PUBLIC_SUPABASE_URL` is set. Or make explicit: "dev without Supabase" vs "prod". |
| `lib/data/items.ts` | Keep for seed script; remove from runtime if Supabase is required in prod. |
| `lib/data/content.ts` | Already deprecated (empty). Can delete; verify no imports. |

### Duplication / Simplification

- `items-loader` imports `items` from `lib/data/items` which merges `routes` + `events` from separate files. Static structure is complex.
- `getPublishedItemsFromSupabase` and `getPublishedItemsByIds` both fetch and transform items. Consider shared mapper.
- Admin API routes repeat `checkAdmin()`; could be middleware.

### Other

- `Events/Camps` link in DATA_MODEL: `/[locale]/events/[slug]`.
- Middleware matcher excludes `admin` and `events` – verify locale routing for `/fi/admin` and `/fi/events` still works (next-intl may handle).

---

## 7) Production Readiness Score

| Area | Score | Notes |
|------|-------|-------|
| **Architecture** | 7/10 | Clear hubs, Supabase-first. Static fallback for items is inconsistent. |
| **Security** | 5/10 | Service role protected. Password gate is trivial to bypass. No rate limit, no logout. |
| **CMS maturity** | 8/10 | Full CRUD for items, content, team, podcast. Moderation flow works. Preview, related items. |
| **Scalability** | 6/10 | No pagination on lists. 200+ items may slow filters. No CDN strategy for images. |

### Overall: **6.5/10**

### Critical Risks

1. **Admin bypass**: Cookie-based auth is weak. Replace with Supabase Auth before exposing to untrusted users.
2. **Empty Supabase**: Items fall back to static; content shows nothing. Unclear behavior in prod if DB is misconfigured.
3. **No pagination**: Large item lists will increase load times and memory.

### Recommended Next Steps (Priority)

1. Add `generateMetadata` to routes page.
2. Implement admin logout (clear cookie).
3. Add sitemap generator.
4. Remove or formalize static fallback (document when it applies).
5. Plan Supabase Auth migration for admin.
