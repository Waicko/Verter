import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DbItemInsert } from "@/lib/db/types";

/** Public submission - always inserts with status=pending */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;

  const title = String(body.title || "").trim();
  const shortDesc = body.short_description
    ? String(body.short_description).trim().slice(0, 600)
    : null;
  const externalLinks = Array.isArray(body.external_links)
    ? body.external_links
    : body.official_url
      ? [{ url: String(body.official_url), label: "Official" }]
      : [];

  // Whitelist fields for public submission - always status=pending
  const payload: DbItemInsert = {
    type: (body.type as "route" | "event" | "camp") || "route",
    status: "pending",
    title,
    slug: String(body.slug || "").trim() || slugify(title),
    region: body.region ? String(body.region) : null,
    country: body.country ? String(body.country) : null,
    location_name: body.location_name ? String(body.location_name) : null,
    official_url: body.official_url ? String(body.official_url) : null,
    short_description: shortDesc,
    reject_reason: null,
    start_lat: typeof body.start_lat === "number" ? body.start_lat : null,
    start_lng: typeof body.start_lng === "number" ? body.start_lng : null,
    summary: shortDesc,
    description: shortDesc,
    tags: Array.isArray(body.tags) ? body.tags : [],
    external_links: externalLinks,
    distance_km: typeof body.distance_km === "number" ? body.distance_km : null,
    elevation_gain_m:
      typeof body.elevation_gain_m === "number" ? body.elevation_gain_m : null,
    technicality_1_5:
      typeof body.technicality_1_5 === "number" ? body.technicality_1_5 : null,
    winter_score_1_5:
      typeof body.winter_score_1_5 === "number" ? body.winter_score_1_5 : null,
    gpx_url: null,
    route_origin: null,
    start_date: body.start_date ? String(body.start_date) : null,
    end_date: body.end_date ? String(body.end_date) : null,
    recurrence: body.recurrence ? String(body.recurrence) : null,
    distance_options: Array.isArray(body.distance_options) ? body.distance_options : [],
    organizer_name: body.organizer_name ? String(body.organizer_name) : null,
    season: body.season ? String(body.season) : null,
    duration_days:
      typeof body.duration_days === "number" ? body.duration_days : null,
    focus: body.focus ? String(body.focus) : null,
    submitter_name: body.submitter_name ? String(body.submitter_name) : null,
    submitter_email: body.submitter_email ? String(body.submitter_email) : null,
    submitter_role: body.submitter_role ? String(body.submitter_role) : null,
    update_for_slug: body.update_for_slug ? String(body.update_for_slug).trim() || null : null,
  };

  if (!payload.title) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("items")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message || "Submit failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ id: data.id });
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
