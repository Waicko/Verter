import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "admin_auth";

/** Create a signed session token. Used by login API. */
export function createAdminSessionToken(): string {
  const expiresAt = Date.now() + 60 * 60 * 24 * 1000; // 24h
  return signToken(expiresAt);
}

function signToken(expiresAt: number): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return "";
  const payload = String(expiresAt);
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifyToken(token: string): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;
  const i = token.indexOf(".");
  if (i <= 0) return false;
  const payload = token.slice(0, i);
  const actualSig = token.slice(i + 1);
  const payloadNum = parseInt(payload, 10);
  if (isNaN(payloadNum)) return false;
  if (payloadNum < Date.now()) return false; // expired
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (expected.length !== actualSig.length) return false;
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(actualSig, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Check if the request has valid admin auth (signed cookie). Use for all admin API routes. */
export async function checkAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  return verifyToken(value);
}
