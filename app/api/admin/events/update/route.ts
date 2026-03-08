import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { checkAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    id?: string;
    title?: string;
    date?: string;
    location?: string;
    registration_url?: string;
    description?: string;
    type?: string;
    status?: string;
    source_type?: string;
    source_name?: string;
    source_url?: string;
    submitted_by_name?: string;
    submitted_by_email?: string;
    rights_basis?: string;
    license_name?: string;
    license_url?: string;
    verification_status?: string;
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
  const date = body.date?.trim();
  if (!title || !date) {
    return NextResponse.json(
      { error: "title and date are required" },
      { status: 400 }
    );
  }

  const slug = slugify(title);
  const eventType =
    body.type === "race" || body.type === "camp" || body.type === "community"
      ? body.type
      : "race";
  const payload = {
    title,
    slug,
    date,
    location: body.location?.trim() || null,
    registration_url: body.registration_url?.trim() || null,
    description: body.description?.trim() || null,
    type: eventType,
    status: body.status === "published" ? "published" : "draft",
    source_type: body.source_type?.trim() || null,
    source_name: body.source_name?.trim() || null,
    source_url: body.source_url?.trim() || null,
    submitted_by_name: body.submitted_by_name?.trim() || null,
    submitted_by_email: body.submitted_by_email?.trim() || null,
    rights_basis: body.rights_basis?.trim() || null,
    license_name: body.license_name?.trim() || null,
    license_url: body.license_url?.trim() || null,
    verification_status: body.verification_status?.trim() || null,
  };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
