import { NextResponse } from "next/server";
import { exportUserData } from "@partile/db";
import { getViewer } from "@/lib/auth";

/** KVKK "Verilerim → İndir": the signed-in user's data as a JSON download. */
export async function GET() {
  const v = await getViewer();
  if (!v) return NextResponse.json({ error: "Önce giriş yap." }, { status: 401 });
  const data = await exportUserData(v.id);
  if (!data) return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="partile-verilerim-${day}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
