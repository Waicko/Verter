import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DbContentItemInsert } from "@/lib/db/content-types";
import { checkAdmin } from "@/lib/admin-auth";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as DbContentItemInsert & Record<string, unknown>;
  const supabase = getSupabaseServerClient();

  const titleFi = (body.title_fi as string | undefined)?.trim();
  const slugFi = (body.slug_fi as string | undefined)?.trim();
  const bodyFi = (body.body_fi as string | undefined)?.trim();

  let slug = (body.slug as string | undefined)?.trim() ?? slugFi;
  if (!slug && titleFi) {
    slug = slugify(titleFi);
  }
  if (!slug && body.title) {
    slug = slugify(body.title as string);
  }
  if (!slug) {
    return NextResponse.json(
      { error: "Slug or title required" },
      { status: 400 }
    );
  }

  const isPublish = body.status === "published";
  if (isPublish && (!titleFi || !slugFi || !bodyFi)) {
    return NextResponse.json(
      { error: "Publish requires Finnish title, slug and body (title_fi, slug_fi, body_fi)" },
      { status: 400 }
    );
  }

  const publishedAt = isPublish && !body.published_at
    ? new Date().toISOString().slice(0, 10)
    : (body.published_at ?? null);

  const { data, error } = await supabase
    .from("content_items")
    .insert({
      title: (body.title as string) ?? titleFi ?? "",
      slug,
      content_type: body.content_type,
      summary: (body.summary as string | null) ?? (body.excerpt_fi as string | null) ?? null,
      body: (body.body as string) ?? bodyFi ?? "",
      hero_image: body.hero_image ?? null,
      related_route_slugs: Array.isArray(body.related_route_slugs) ? body.related_route_slugs : [],
      related_event_slugs: Array.isArray(body.related_event_slugs) ? body.related_event_slugs : [],
      episode_url: body.episode_url ?? null,
      author: body.author ?? null,
      published_at: publishedAt,
      status: body.status ?? "draft",
      title_fi: titleFi || null,
      title_en: (body.title_en as string | undefined)?.trim() || null,
      slug_fi: slugFi || null,
      slug_en: (body.slug_en as string | undefined)?.trim() || null,
      excerpt_fi: (body.excerpt_fi as string | undefined)?.trim() || null,
      excerpt_en: (body.excerpt_en as string | undefined)?.trim() || null,
      body_fi: bodyFi || null,
      body_en: (body.body_en as string | undefined)?.trim() || null,
      seo_title_fi: (body.seo_title_fi as string | undefined)?.trim() || null,
      seo_title_en: (body.seo_title_en as string | undefined)?.trim() || null,
      seo_description_fi: (body.seo_description_fi as string | undefined)?.trim() || null,
      seo_description_en: (body.seo_description_en as string | undefined)?.trim() || null,
      source_type: body.source_type ?? null,
      source_name: body.source_name ?? null,
      source_url: body.source_url ?? null,
      submitted_by_name: body.submitted_by_name ?? null,
      submitted_by_email: body.submitted_by_email ?? null,
      rights_basis: body.rights_basis ?? null,
      license_name: body.license_name ?? null,
      license_url: body.license_url ?? null,
      verification_status: body.verification_status ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message || "Insert failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ id: data?.id });
}
