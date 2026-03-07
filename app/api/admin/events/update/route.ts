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
