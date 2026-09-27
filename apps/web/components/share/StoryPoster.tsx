"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime, planUrl } from "@partile/core";
import { themeById } from "@partile/ui-tokens";
import { Mark } from "@/components/brand/Mark";
import { Poster } from "@/components/plan/Poster";
import { DownloadIcon } from "@/components/shell/icons";
import { Modal, btnGhost, btnPrimary, modalFooter } from "@/components/ui/Modal";
import type { Plan } from "@partile/core";
import { titleFontStyle } from "@/lib/fonts";

const dayNum = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", timeZone: "Europe/Istanbul" });
const weekday = new Intl.DateTimeFormat("tr-TR", { weekday: "long", timeZone: "Europe/Istanbul" });

/** `Story` artboard: 540×960 preview of the 1080×1920 Instagram story flyer; PNG export via html-to-image. */
export function StoryPoster({ plan, open, onClose }: { plan: Plan; open: boolean; onClose: () => void }) {
  const node = useRef<HTMLDivElement>(null);
  const [qr, setQr] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const t = themeById(plan.themeId);
  const url = planUrl(plan.code);

  useEffect(() => {
    if (!open) return;
    import("qrcode").then((q) => q.toDataURL(url, { margin: 0, width: 192, color: { dark: "#160804", light: "#FFF1E3" } })).then(setQr).catch(() => setQr(""));
  }, [open, url]);

  const download = async () => {
    if (!node.current) return;
    setBusy(true);
    try {
      await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node.current, { pixelRatio: 2, cacheBust: true, width: 540, height: 960 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${plan.code}-hikaye.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Hikâye afişi" width={640}>
      <div className="flex flex-col items-center gap-4 p-5">
        <p className="text-center text-sm text-muted">1080×1920 PNG. Üst ve alt 250 px güvenli alan boş bırakıldı; QR ve link kayıtlı.</p>
        <div className="overflow-hidden rounded-xl" style={{ width: 270, height: 480 }}>
          <div style={{ transform: "scale(0.5)", transformOrigin: "top left" }}>
            <div ref={node} className="relative flex flex-col justify-between overflow-hidden" style={{ width: 540, height: 960, padding: "72px 44px 56px", background: t.bg, color: t.fg, fontFamily: "var(--font-hanken), sans-serif" }}>
              <div className="flex flex-col gap-1">
                {plan.startsAt && !plan.dateTbd ? (
                  <>
                    <span className="display text-[64px] leading-[0.95] tracking-[-0.04em]">{dayNum.format(new Date(plan.startsAt)).toLocaleUpperCase("tr-TR")}</span>
                    <span className="display text-2xl tracking-normal opacity-90">{weekday.format(new Date(plan.startsAt)).toLocaleUpperCase("tr-TR")} · {formatTime(plan.startsAt)}</span>
                  </>
                ) : (
                  <span className="display text-[48px] leading-[0.95] tracking-tight">TARİH NETLEŞMEDİ</span>
                )}
              </div>
              <Poster themeId={plan.themeId} text={plan.posterText ?? "30"} src={plan.posterUrl} topLeft="PARTİLE" bottomRight={plan.location?.district?.split(",")[0]?.toLocaleUpperCase("tr-TR")} className="w-[380px] self-center shadow-[0_40px_80px_rgba(0,0,0,0.5)]" />
              <div className="flex flex-col gap-4">
                <span className="text-[52px] leading-none tracking-tight" style={titleFontStyle(plan.titleFont)}>{plan.title}</span>
                <div className="flex items-end justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="display text-[22px] tracking-normal">Geliyor musun?</span>
                    <span className="text-[15px] opacity-85">{plan.location?.district} · linke dokun</span>
                    <span className="text-[13px] opacity-70">{url.replace("https://", "")}</span>
                  </div>
                  {qr ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qr} alt="QR kod" width={96} height={96} className="shrink-0 rounded-xl bg-[#FFF1E3] p-2" />
                  ) : (
                    <span className="size-24 shrink-0 rounded-xl bg-[#FFF1E3]" />
                  )}
                </div>
                <span className="flex items-center gap-2 text-[13px] opacity-85"><Mark size={20} color={t.fg} hole="#160804" solid /> <strong>partile</strong> ile davet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={modalFooter}>
        <button type="button" onClick={onClose} className={btnGhost}>Kapat</button>
        <button type="button" onClick={download} disabled={busy} className={`${btnPrimary} gap-2 disabled:opacity-50`}><DownloadIcon size={16} /> {busy ? "Hazırlanıyor…" : "PNG indir"}</button>
      </div>
    </Modal>
  );
}
