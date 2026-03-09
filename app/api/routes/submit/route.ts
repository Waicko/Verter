import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { calculateGpxStats } from "@/lib/route-gpx-stats";

const GPX_BUCKET = "gpx";

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
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const area = (formData.get("area") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const gpxFile = formData.get("gpx") as File | null;

  let gpxPath: string | null = null;
  let distance_km: number | null = null;
  let ascent_m: number | null = null;
  let start_lat: number | null = null;
  let start_lng: number | null = null;

  if (gpxFile && typeof (gpxFile as Blob).arrayBuffer === "function") {
    const ext = gpxFile.name.toLowerCase().endsWith(".gpx") ? "" : ".gpx";
    const safeName = gpxFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `submissions/${Date.now()}-${safeName}${ext}`;
    const arrayBuffer = await gpxFile.arrayBuffer();

    const supabase = getSupabaseServerClient();
    const { error: uploadError } = await supabase.storage
      .from(GPX_BUCKET)
      .upload(path, arrayBuffer, {
        contentType: gpxFile.type || "application/gpx+xml",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `GPX upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }
    gpxPath = path;

    try {
      const xmlText = new TextDecoder().decode(arrayBuffer);
      const stats = calculateGpxStats(xmlText);
      if (stats) {
        distance_km = stats.distance_km ?? null;
        ascent_m = stats.ascent_m ?? null;
        start_lat = stats.start_lat ?? null;
        start_lng = stats.start_lng ?? null;
      }
    } catch {
      // Ignore parse errors
    }
  }

  let slug = slugify(title);
  const supabase = getSupabaseServerClient();

  let insertError = (await supabase.from("routes").insert({
    title,
    area,
    description,
    gpx_path: gpxPath,
    distance_km,
    ascent_m,
    start_lat,
    start_lng,
    slug,
    status: "draft",
  })).error;

  if (insertError?.code === "23505") {
    slug = `${slug}-${Math.random().toString(36).slice(2, 8)}`;
    const retry = await supabase.from("routes").insert({
      title,
      area,
      description,
      gpx_path: gpxPath,
      distance_km,
      ascent_m,
      start_lat,
      start_lng,
      slug,
      status: "draft",
    });
    insertError = retry.error;
  }

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message ?? "Failed to save route" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
