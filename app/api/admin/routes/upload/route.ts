import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { calculateGpxStats } from "@/lib/route-gpx-stats";
import { checkAdmin } from "@/lib/admin-auth";

const GPX_BUCKET = "gpx"; // Must match Supabase Storage bucket name exactly

export async function POST(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("gpx") as File | null;
  if (!file || typeof (file as Blob).arrayBuffer !== "function") {
    return NextResponse.json(
      { error: "GPX file is required (field: gpx)" },
      { status: 400 }
    );
  }

  const ext = file.name.toLowerCase().endsWith(".gpx") ? "" : ".gpx";
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${Date.now()}-${safeName}${ext}`;

  // Convert to ArrayBuffer for Node.js/serverless compatibility (File from FormData may not work)
  const arrayBuffer = await file.arrayBuffer();

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(GPX_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type || "application/gpx+xml",
      upsert: true,
    });

  if (error) {
    const errorMsg = error.message || String(error);
    console.error("[routes/upload] Supabase storage error:", {
      message: errorMsg,
      bucket: GPX_BUCKET,
      path,
    });
    return NextResponse.json(
      { error: `Storage upload failed: ${errorMsg}` },
      { status: 500 }
    );
  }

  // Parse GPX and calculate distance/ascent/start coords for form prefilling
  let distance_km: number | undefined;
  let ascent_m: number | null | undefined;
  let start_lat: number | undefined;
  let start_lng: number | undefined;
  try {
    const xmlText = new TextDecoder().decode(arrayBuffer);
    const stats = calculateGpxStats(xmlText);
    if (stats) {
      distance_km = stats.distance_km;
      ascent_m = stats.ascent_m; // null when GPX has no elevation data
      start_lat = stats.start_lat;
      start_lng = stats.start_lng;
    }
  } catch (parseErr) {
    console.warn("[routes/upload] GPX stats parse failed:", parseErr);
  }

  const payload: {
    path: string;
    distance_km?: number;
    ascent_m?: number | null;
    start_lat?: number;
    start_lng?: number;
  } = { path: data.path };
  if (distance_km != null) payload.distance_km = distance_km;
  if (ascent_m !== undefined) payload.ascent_m = ascent_m;
  if (start_lat != null) payload.start_lat = start_lat;
  if (start_lng != null) payload.start_lng = start_lng;
  return NextResponse.json(payload);
}
