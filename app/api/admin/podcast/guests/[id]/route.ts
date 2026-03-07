import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { checkAdmin } from "@/lib/admin-auth";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await _request.json();
  const supabase = getSupabaseServerClient();

  const raw: Record<string, unknown> = {
    name: body.name,
    role_fi: body.role_fi,
    role_en: body.role_en,
    tagline_fi: body.tagline_fi,
    tagline_en: body.tagline_en,
    image_url: body.image_url,
    links: body.links,
    episode_url: body.episode_url,
    featured: body.featured,
    status: body.status,
    published_at: body.published_at,
  };
  const updatePayload = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined)
  );

  const { error } = await supabase
    .from("podcast_guests")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("podcast_guests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("podcast_guests").delete().eq("id", id);
  if (error) {
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
