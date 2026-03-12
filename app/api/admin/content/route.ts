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
  const body = (await request.json()) as DbContentItemInsert;
  const supabase = getSupabaseServerClient();

  let slug = body.slug?.trim();
  if (!slug && body.title) {
    slug = slugify(body.title);
  }
  if (!slug) {
    return NextResponse.json(
      { error: "Slug or title required" },
      { status: 400 }
    );
  }

  const isPublish = body.status === "published";
  const publishedAt = isPublish && !body.published_at
    ? new Date().toISOString().slice(0, 10)
    : (body.published_at ?? null);

  const { data, error } = await supabase
    .from("content_items")
    .insert({
      title: body.title,
      slug,
      content_type: body.content_type,
      summary: body.summary ?? null,
      body: body.body ?? "",
      hero_image: body.hero_image ?? null,
      related_route_slugs: Array.isArray(body.related_route_slugs) ? body.related_route_slugs : [],
      related_event_slugs: Array.isArray(body.related_event_slugs) ? body.related_event_slugs : [],
      episode_url: body.episode_url ?? null,
      author: body.author ?? null,
      published_at: publishedAt,
      status: body.status ?? "draft",
      source_type: (body as Record<string, unknown>).source_type ?? null,
      source_name: (body as Record<string, unknown>).source_name ?? null,
      source_url: (body as Record<string, unknown>).source_url ?? null,
      submitted_by_name: (body as Record<string, unknown>).submitted_by_name ?? null,
      submitted_by_email: (body as Record<string, unknown>).submitted_by_email ?? null,
      rights_basis: (body as Record<string, unknown>).rights_basis ?? null,
      license_name: (body as Record<string, unknown>).license_name ?? null,
      license_url: (body as Record<string, unknown>).license_url ?? null,
      verification_status: (body as Record<string, unknown>).verification_status ?? null,
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
