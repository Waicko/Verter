/**
 * Seed Verter items (routes, events, camps) into Supabase.
 *
 * Run: npx tsx scripts/seed-items.ts
 *
 * Requires env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY for read; service role needed for insert)
 */

import { createClient } from "@supabase/supabase-js";
import {
  routeSeeds,
  eventSeeds,
  campSeeds,
  allSeeds,
} from "./seed-data";
import type { DbItemInsert } from "../lib/db/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

/** Build insert row – only include defined fields, fill nulls for required columns */
function toInsertRow(seed: DbItemInsert): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    type: seed.type,
    status: seed.status ?? "published",
    title: seed.title,
    slug: seed.slug,
    region: seed.region ?? null,
    country: seed.country ?? null,
    location_name: seed.location_name ?? null,
    official_url: seed.official_url ?? null,
    short_description: seed.short_description ?? null,
    reject_reason: seed.reject_reason ?? null,
    start_lat: seed.start_lat ?? null,
    start_lng: seed.start_lng ?? null,
    summary: seed.summary ?? null,
    description: seed.description ?? null,
    tags: Array.isArray(seed.tags) ? seed.tags : [],
    external_links: Array.isArray(seed.external_links) ? seed.external_links : [],

    distance_km: seed.distance_km ?? null,
    elevation_gain_m: seed.elevation_gain_m ?? null,
    technicality_1_5: seed.technicality_1_5 ?? null,
    winter_score_1_5: seed.winter_score_1_5 ?? null,
    gpx_url: seed.gpx_url ?? null,
    route_origin: seed.route_origin ?? null,

    start_date: seed.start_date ?? null,
    end_date: seed.end_date ?? null,
    recurrence: seed.recurrence ?? null,
    distance_options: Array.isArray(seed.distance_options) ? seed.distance_options : [],
    organizer_name: seed.organizer_name ?? null,

    season: seed.season ?? null,
    duration_days: seed.duration_days ?? null,
    focus: seed.focus ?? null,

    submitter_name: seed.submitter_name ?? null,
    submitter_email: seed.submitter_email ?? null,
    submitter_role: seed.submitter_role ?? null,

    created_at: now,
    updated_at: now,
  };
}

async function main() {
  console.log("Verter seed script");
  console.log("Routes:", routeSeeds.length);
  console.log("Events:", eventSeeds.length);
  console.log("Camps:", campSeeds.length);
  console.log("Total:", allSeeds.length);
  console.log("");

  const rows = allSeeds.map(toInsertRow);

  const { data, error } = await supabase.from("items").insert(rows).select("id, type, slug");

  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log(`Inserted ${data?.length ?? 0} items.`);
  const byType = (data ?? []).reduce(
    (acc, r) => {
      const t = String(r.type);
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  console.log("By type:", byType);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
