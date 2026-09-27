import { NextResponse } from "next/server";
import { get } from "@/lib/storage";

/** Serves an uploaded file from local storage (development). Immutable: names are UUIDs. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const file = await get(name);
  if (!file) return new NextResponse("Bulunamadı", { status: 404 });
  return new NextResponse(new Uint8Array(file.bytes), { headers: { "Content-Type": file.mime, "Cache-Control": "public, max-age=31536000, immutable" } });
}
