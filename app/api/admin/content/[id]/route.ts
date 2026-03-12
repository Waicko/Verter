import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { checkAdmin } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const supabase = getSupabaseServerClient();

  const isPublish = body.status === "published";
  const publishedAt = body.published_at !== undefined
    ? body.published_at
    : isPublish
      ? new Date().toISOString().slice(0, 10)
      : undefined;

  const raw: Record<string, unknown> = {
    title: body.title,
    slug: body.slug,
    content_type: body.content_type,
    summary: body.summary,
    body: body.body,
    hero_image: body.hero_image,
    related_route_slugs: body.related_route_slugs,
    related_event_slugs: body.related_event_slugs,
    episode_url: body.episode_url,
    author: body.author,
    published_at: publishedAt,
    status: body.status,
    source_type: body.source_type,
    source_name: body.source_name,
    source_url: body.source_url,
    submitted_by_name: body.submitted_by_name,
    submitted_by_email: body.submitted_by_email,
    rights_basis: body.rights_basis,
    license_name: body.license_name,
    license_url: body.license_url,
    verification_status: body.verification_status,
  };
  const updatePayload = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined)
  );

  const { error } = await supabase
    .from("content_items")
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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) {
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
