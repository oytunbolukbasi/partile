import { NextResponse } from "next/server";
import { ping } from "@partile/db";

export const dynamic = "force-dynamic";

/** Health check for Railway: the DB answers and migrations ran. */
export async function GET() {
  try {
    await ping();
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (e) {
    console.error("[saglik]", e);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
