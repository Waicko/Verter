import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * App-only: upsert rating for authenticated user.
 * Web must NOT post ratings; this endpoint requires Bearer token.
 *
 * POST /api/ratings
 * Body: { item_id: string, rating: number (1-5), winter_run?: boolean }
 * Headers: Authorization: Bearer <supabase_access_token>
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json(
      { error: "Authorization required. Use Bearer token from Supabase Auth." },
      { status: 401 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const itemId = body.item_id;
  const rating = typeof body.rating === "number" ? body.rating : parseInt(String(body.rating), 10);
  const winterRun = !!body.winter_run;

  if (!itemId || typeof itemId !== "string") {
    return NextResponse.json({ error: "item_id is required" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be 1-5" }, { status: 400 });
  }

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  const { error } = await supabase.from("ratings").upsert(
    {
      item_id: itemId,
      user_id: user.id,
      rating,
      winter_run: winterRun,
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "item_id,user_id" }
  );

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to save rating" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
