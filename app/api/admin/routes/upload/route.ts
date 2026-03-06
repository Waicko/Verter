import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const GPX_BUCKET = "gpx";

function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  return !!ADMIN_TOKEN && !!token && token === ADMIN_TOKEN;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("gpx") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "GPX file is required (field: gpx)" },
      { status: 400 }
    );
  }

  const ext = file.name.toLowerCase().endsWith(".gpx") ? "" : ".gpx";
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${Date.now()}-${safeName}${ext}`;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(GPX_BUCKET)
    .upload(path, file, {
      contentType: file.type || "application/gpx+xml",
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ path: data.path });
}
