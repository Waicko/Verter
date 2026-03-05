import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  return !!ADMIN_TOKEN && !!token && token === ADMIN_TOKEN;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    id?: string;
    title?: string;
    date?: string;
    location?: string;
    registration_url?: string;
    description?: string;
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

  const payload = {
    title,
    date,
    location: body.location?.trim() || null,
    registration_url: body.registration_url?.trim() || null,
    description: body.description?.trim() || null,
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
