import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PlanCode, formatDayShort, formatTime } from "@partile/core";
import { themeById } from "@partile/ui-tokens";
import { getPlanByCode } from "@partile/db";

export const runtime = "nodejs";
export const alt = "Davetiye";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Title font per plan (same files as the site; traced into the standalone build via next.config). */
const TITLE_FONTS: Record<string, { file: string; name: string; weight: 400 | 700 | 800; style?: "italic"; upper?: boolean }> = {
  klasik: { file: "schibsted-grotesk-800.woff", name: "Title", weight: 800 },
  eklektik: { file: "fraunces-800.woff", name: "Title", weight: 800 },
  sik: { file: "pinyon-script-400.woff", name: "Title", weight: 400 },
  edebi: { file: "libre-baskerville-700.woff", name: "Title", weight: 700 },
  dijital: { file: "space-mono-700.woff", name: "Title", weight: 700, upper: true },
  zarif: { file: "cormorant-garamond-400-italic.woff", name: "Title", weight: 400, style: "italic" },
};
const font = (file: string) => readFile(join(process.cwd(), "app/fonts", file)).then((b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);

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
  // Each theme's gradient ends in its solid ground colour; light themes (Limonata, Pudra) get a light card.
  const lastHex = (css: string, fallback: string) => css.match(/#[0-9A-Fa-f]{6}(?![0-9A-Fa-f])/g)?.pop() ?? fallback;
  const base = lastHex(t.bg, "#160804");
  const posterBase = lastHex(t.poster ?? t.bg, base);
  const tf = TITLE_FONTS[plan?.titleFont ?? "klasik"] ?? TITLE_FONTS.klasik!;
  // If the font files are missing (tracing), fall back to Satori's default font rather than failing the card.
  const loaded = await Promise.all([font(tf.file), font("hanken-grotesk-700.woff"), font("hanken-grotesk-500.woff"), font("unbounded-800.woff")]).catch((e) => {
    console.error("[og] font load failed", e);
    return null;
  });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: base, color: t.fg, fontFamily: "Body", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, backgroundImage: `radial-gradient(circle at 15% 10%, ${rgba(t.accent, 0.4)} 0%, ${rgba(base, 0)} 60%), radial-gradient(circle at 90% 85%, ${rgba(t.accent, 0.25)} 0%, ${rgba(base, 0)} 60%)` }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, padding: "64px 72px", width: 720 }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 6, opacity: 0.8 }}>PARTİLE</div>
          <div style={{ fontFamily: "Title", fontWeight: tf.weight, fontStyle: tf.style ?? "normal", fontSize: title.length > 24 ? 60 : 76, lineHeight: 1.05, letterSpacing: tf.name && tf.weight === 800 ? -2 : 0 }}>{tf.upper ? title.toLocaleUpperCase("tr-TR") : title}</div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{when}</div>
          {plan?.location?.district && <div style={{ fontSize: 28, fontWeight: 500, opacity: 0.85 }}>{plan.location.district}</div>}
          <div style={{ display: "flex", marginTop: 18 }}>
            <div style={{ background: t.accent, color: t.tone === "light" ? "#FFFFFF" : "#160804", fontSize: 30, fontWeight: 800, padding: "16px 34px", borderRadius: 999 }}>Geliyor musun?</div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 64, top: 95, width: 440, height: 440, borderRadius: 28, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: posterBase, boxShadow: "0 30px 60px rgba(0,0,0,0.45)" }}>
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" width={440} height={440} style={{ objectFit: "cover" }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: posterBase, backgroundImage: `radial-gradient(circle at 25% 20%, ${rgba(t.accent, 0.6)} 0%, ${rgba(posterBase, 0)} 65%)`, color: t.fg, fontFamily: numeral ? "Poster" : "Title", fontSize: numeral ? 220 : 64, fontWeight: numeral ? 800 : tf.weight, letterSpacing: numeral ? -10 : 0, textAlign: "center", padding: 24 }}>
              {numeral ?? (plan?.posterText ?? "").replace(/\n/g, " ")}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: loaded
        ? [
            { name: "Title", data: loaded[0], weight: tf.weight, style: tf.style ?? "normal" },
            { name: "Body", data: loaded[1], weight: 700, style: "normal" },
            { name: "Body", data: loaded[2], weight: 500, style: "normal" },
            { name: "Poster", data: loaded[3], weight: 800, style: "normal" },
          ]
        : undefined,
    },
  );
}
