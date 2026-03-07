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
    status?: string;
    slug?: string;
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
    status: body.status === "published" ? "published" : "draft",
    slug,
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
