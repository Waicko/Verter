import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { checkAdmin } from "@/lib/admin-auth";

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/[ö]/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    id?: string;
    title?: string;
    area?: string;
    distance_km?: number;
    ascent_m?: number;
    description?: string;
    gpx_path?: string;
    start_lat?: number;
    start_lng?: number;
    status?: string;
    slug?: string;
    source_type?: string;
    source_name?: string;
    source_url?: string;
    submitted_by_name?: string;
    submitted_by_email?: string;
    rights_basis?: string;
    license_name?: string;
    license_url?: string;
    verification_status?: string;
    route_origin_type?: string;
    route_origin_name?: string;
    route_origin_url?: string;
    submitted_by_strava_url?: string;
    approved_by_verter?: boolean;
    approved_by_name?: string;
    approved_at?: string;
    tested_by_team?: boolean;
    tested_notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = body.id;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }

  const slug =
    body.slug?.trim() && slugify(body.slug)
      ? slugify(body.slug)
      : slugify(title);

  const payload = {
    title,
    area: body.area?.trim() || null,
    distance_km: body.distance_km != null ? Number(body.distance_km) : null,
    ascent_m: body.ascent_m != null ? Number(body.ascent_m) : null,
    description: body.description?.trim() || null,
    gpx_path: body.gpx_path?.trim() || null,
    start_lat: body.start_lat != null ? Number(body.start_lat) : null,
    start_lng: body.start_lng != null ? Number(body.start_lng) : null,
    status: body.status === "published" ? "published" : "draft",
    slug,
    source_type: body.source_type?.trim() || null,
    source_name: body.source_name?.trim() || null,
    source_url: body.source_url?.trim() || null,
    submitted_by_name: body.submitted_by_name?.trim() || null,
    submitted_by_email: body.submitted_by_email?.trim() || null,
    rights_basis: body.rights_basis?.trim() || null,
    license_name: body.license_name?.trim() || null,
    license_url: body.license_url?.trim() || null,
    verification_status: body.verification_status?.trim() || null,
    route_origin_type: body.route_origin_type?.trim() || null,
    route_origin_name: body.route_origin_name?.trim() || null,
    route_origin_url: body.route_origin_url?.trim() || null,
    submitted_by_strava_url: body.submitted_by_strava_url?.trim() || null,
    approved_by_verter: body.approved_by_verter === true,
    approved_by_name: body.approved_by_name?.trim() || null,
    approved_at: body.approved_at?.trim() || null,
    tested_by_team: body.tested_by_team === true,
    tested_notes: body.tested_notes?.trim() || null,
  };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("routes")
    .update(payload)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
