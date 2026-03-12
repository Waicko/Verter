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
  const titleFi = body.title_fi?.trim();
  const slugFi = body.slug_fi?.trim();
  const bodyFi = body.body_fi?.trim();
  if (isPublish) {
    const hasFi =
      (titleFi ?? "").length > 0 && (slugFi ?? "").length > 0 && (bodyFi ?? "").length > 0;
    if (!hasFi) {
      return NextResponse.json(
        { error: "Publish requires Finnish title, slug and body (title_fi, slug_fi, body_fi)" },
        { status: 400 }
      );
    }
  }

  const publishedAt = body.published_at !== undefined
    ? body.published_at
    : isPublish
      ? new Date().toISOString().slice(0, 10)
      : undefined;

  const raw: Record<string, unknown> = {
    title: body.title ?? (titleFi || body.title_en?.trim() || ""),
    slug: body.slug ?? slugFi ?? body.slug,
    content_type: body.content_type,
    summary: body.summary ?? body.excerpt_fi,
    body: body.body ?? bodyFi ?? body.body,
    hero_image: body.hero_image,
    related_route_slugs: body.related_route_slugs,
    related_event_slugs: body.related_event_slugs,
    episode_url: body.episode_url,
    author: body.author,
    published_at: publishedAt,
    status: body.status,
    title_fi: body.title_fi?.trim() || null,
    title_en: body.title_en?.trim() || null,
    slug_fi: slugFi || null,
    slug_en: body.slug_en?.trim() || null,
    excerpt_fi: body.excerpt_fi?.trim() || null,
    excerpt_en: body.excerpt_en?.trim() || null,
    body_fi: bodyFi || null,
    body_en: body.body_en?.trim() || null,
    seo_title_fi: body.seo_title_fi?.trim() || null,
    seo_title_en: body.seo_title_en?.trim() || null,
    seo_description_fi: body.seo_description_fi?.trim() || null,
    seo_description_en: body.seo_description_en?.trim() || null,
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
