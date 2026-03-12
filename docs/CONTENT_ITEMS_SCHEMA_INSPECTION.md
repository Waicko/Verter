# content_items schema inspection

Before running the localized-fields migration, verify the actual schema.

## 1. Run inspection queries (Supabase SQL Editor)

```sql
select
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'content_items'
order by ordinal_position;
```

```sql
select * from public.content_items limit 3;
```

## 2. Or run the Node script (requires env)

```bash
# Load .env.local first
export $(cat .env.local | xargs)
npx tsx scripts/inspect-content-items-schema.ts
```

## 3. Expected columns (from migrations)

| Column | Source migration | Notes |
|--------|------------------|-------|
| title | create_content_items | NOT NULL |
| slug | create_content_items | NOT NULL, unique |
| content_type | create_content_items | blog, review, podcast, comparison |
| summary | create_content_items | Short excerpt; may be missing if DB differs |
| body | create_content_items | NOT NULL (set by author migration) |
| hero_image | create_content_items | |
| related_item_ids | create_content_items | legacy |
| episode_url | create_content_items | |
| published_at | create_content_items | |
| status | create_content_items | draft, published, archived |
| author | content_items_author_archived | |
| source_type, source_name, source_url, etc. | add_source_rights_metadata | |
| related_route_slugs | content_items_related_route_slugs | |
| related_event_slugs | content_items_related_event_slugs | |

**Important:** There is no `excerpt` column in the canonical schema. The short-description field is `summary`.  
If your DB has `excerpt` instead of `summary`, the migration backfill handles both.

## 4. Migration behavior

The migration `20250311000000_content_items_localized_fields.sql`:

- Adds new columns only (`add column if not exists`)
- Runs backfill via a `DO` block that checks `information_schema` for each source column
- Backfills `excerpt_fi` from `summary` if it exists, or from `excerpt` if that exists
- Does not remove any existing columns
