#!/usr/bin/env npx tsx
/**
 * Inspect real schema of public.content_items.
 * Run: npx tsx scripts/inspect-content-items-schema.ts
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *
 * If the table is empty, run these queries manually in Supabase SQL Editor:
 *
 *   select column_name, data_type
 *   from information_schema.columns
 *   where table_schema = 'public' and table_name = 'content_items'
 *   order by ordinal_position;
 *
 *   select * from public.content_items limit 3;
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Load .env.local or set env."
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { data: rows, error } = await supabase
    .from("content_items")
    .select("*")
    .limit(3);

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log("No rows in content_items. Run the SQL queries manually in Supabase Dashboard:");
    console.log("\n  select column_name, data_type");
    console.log("  from information_schema.columns");
    console.log("  where table_schema = 'public' and table_name = 'content_items'");
    console.log("  order by ordinal_position;\n");
    process.exit(0);
  }

  const cols = Object.keys(rows[0]).sort();
  const localizedExpected = [
    "title_fi", "title_en", "slug_fi", "slug_en",
    "excerpt_fi", "excerpt_en", "body_fi", "body_en",
    "seo_title_fi", "seo_title_en", "seo_description_fi", "seo_description_en",
  ];
  const legacyExpected = ["title", "slug", "summary", "body"];

  console.log("=== Localized columns (code expects these) ===\n");
  let allLocalizedPresent = true;
  localizedExpected.forEach((c) => {
    const has = cols.includes(c);
    if (!has) allLocalizedPresent = false;
    console.log(`  ${c}: ${has ? "OK" : "MISSING"}`);
  });
  console.log("\n=== Legacy columns (backfill source) ===\n");
  legacyExpected.forEach((c) => {
    const has = cols.includes(c);
    console.log(`  ${c}: ${has ? "OK" : "MISSING"}`);
  });
  console.log("\n=== Migration status ===\n");
  console.log(`  All localized columns present: ${allLocalizedPresent ? "YES - migration applied" : "NO - run migration"}`);
}

main();
