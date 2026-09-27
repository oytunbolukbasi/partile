import { ImageResponse } from "next/og";
import { PlanCode, formatDayShort, formatTime } from "@partile/core";
import { themeById } from "@partile/ui-tokens";
import { getPlanByCode } from "@partile/db";

export const runtime = "nodejs";
export const alt = "Davetiye";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** WhatsApp / iMessage link card: theme gradient, title, date, "Geliyor musun?". Uploaded posters are shown when absolute. */
export default async function Image({ params }: { params: Promise<{ kod: string }> }) {
  const { kod } = await params;
  const plan = PlanCode.safeParse(kod).success ? await getPlanByCode(kod) : null;
  const t = themeById(plan?.themeId ?? "kor");
  const title = plan?.title ?? "partile";
  const when = plan?.startsAt && !plan.dateTbd ? `${formatDayShort(plan.startsAt)} · ${formatTime(plan.startsAt)}` : "Tarih netleşmedi";
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getpartile.com";
  const poster = plan?.posterUrl ? (plan.posterUrl.startsWith("http") ? plan.posterUrl : `${site}${plan.posterUrl}`) : null;
  const numeral = plan?.posterText && /^\d+$/.test(plan.posterText) ? plan.posterText : null;
  // Satori wants rgba(), not 8-digit hex, and a plain colour goes in backgroundColor.
  const rgba = (hex: string, a: number) => {
    const n = parseInt(hex.slice(1, 7), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  };
  const base = "#160804";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: base, color: t.fg, fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, backgroundImage: `radial-gradient(circle at 15% 10%, ${rgba(t.accent, 0.4)} 0%, ${rgba(base, 0)} 60%), radial-gradient(circle at 90% 85%, ${rgba(t.accent, 0.25)} 0%, ${rgba(base, 0)} 60%)` }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, padding: "64px 72px", width: 720 }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 6, opacity: 0.8 }}>PARTİLE</div>
          <div style={{ fontSize: title.length > 24 ? 60 : 76, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>{title}</div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{when}</div>
          {plan?.location?.district && <div style={{ fontSize: 28, opacity: 0.85 }}>{plan.location.district}</div>}
          <div style={{ display: "flex", marginTop: 18 }}>
            <div style={{ background: t.accent, color: "#160804", fontSize: 30, fontWeight: 800, padding: "16px 34px", borderRadius: 999 }}>Geliyor musun?</div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 64, top: 95, width: 440, height: 440, borderRadius: 28, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: base, boxShadow: "0 30px 60px rgba(0,0,0,0.45)" }}>
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" width={440} height={440} style={{ objectFit: "cover" }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: base, backgroundImage: `radial-gradient(circle at 25% 20%, ${rgba(t.accent, 0.6)} 0%, ${rgba(base, 0)} 65%)`, color: t.fg, fontSize: numeral ? 240 : 64, fontWeight: 800, letterSpacing: numeral ? -14 : -2, textAlign: "center", padding: 24 }}>
              {numeral ?? (plan?.posterText ?? "").replace(/\n/g, " ")}
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
