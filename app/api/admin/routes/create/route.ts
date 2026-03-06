import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  return !!ADMIN_TOKEN && !!token && token === ADMIN_TOKEN;
}

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
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    area?: string;
    distance_km?: number;
    ascent_m?: number;
    description?: string;
    gpx_path?: string;
    status?: string;
    slug?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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
    status: body.status === "draft" ? "draft" : "published",
    slug,
  };

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("routes")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
