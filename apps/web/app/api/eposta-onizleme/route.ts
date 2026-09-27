import { NextResponse } from "next/server";
import { dateChangeMail, verificationMail } from "@/lib/mail";

/** Development-only mail previews: /api/eposta-onizleme?tur=login|rsvp|tarih|anket */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse("Bulunamadı", { status: 404 });
  const tur = new URL(req.url).searchParams.get("tur");
  const html =
    tur === "tarih" || tur === "anket"
      ? dateChangeMail({ title: "Ece 30 Oluyor", code: "ece30", startsAt: "2026-10-17T17:00:00.000Z", district: "Moda, Kadıköy" }, "Oytun Bölükbaşı", tur === "anket" ? "picked" : "changed").html
      : verificationMail("ornek@getpartile.com", "482917", tur === "rsvp" ? "rsvp" : "login", "/e/ece30").html;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
