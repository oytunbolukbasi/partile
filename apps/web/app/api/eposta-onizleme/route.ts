import { NextResponse } from "next/server";
import { verificationMail } from "@/lib/mail";

/** Development-only preview of the verification mail: /api/eposta-onizleme?tur=rsvp */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse("Bulunamadı", { status: 404 });
  const tur = new URL(req.url).searchParams.get("tur") === "rsvp" ? "rsvp" : "login";
  const m = verificationMail("ornek@getpartile.com", "482917", tur, "/e/ece30");
  return new NextResponse(m.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
