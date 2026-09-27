"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDayShort, formatTime, planUrl } from "@partile/core";
import { themeById } from "@partile/ui-tokens";
import { Mark } from "@/components/brand/Mark";
import { Poster } from "@/components/plan/Poster";
import { StoryPoster } from "@/components/share/StoryPoster";
import { CheckIcon, ImageIcon, ShareIcon, UsersIcon } from "@/components/shell/icons";
import { Modal } from "@/components/ui/Modal";
import type { Plan } from "@partile/core";
import { titleFontStyle } from "@/lib/fonts";
import { routes } from "@/lib/routes";

const QrIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3zM20 14v0M17 20h4M20 17v4" />
  </svg>
);

const tile = "flex h-[60px] items-center justify-center gap-2.5 rounded-lg border border-white/14 bg-white/6 text-[15px] font-bold";

/** `Share` artboard: shown right after publishing and from the host toolbar. WhatsApp first; link, story flyer, QR, mutuals, native share. */
export function ShareModal({ plan, open, onClose, onSettings, mutuals = 14 }: { plan: Plan; open: boolean; onClose: () => void; onSettings?: (tab: "cost" | "hosts" | "questions" | "privacy") => void; mutuals?: number }) {
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [story, setStory] = useState(false);
  const url = planUrl(plan.code);
  const short = url.replace("https://", "");
  const t = themeById(plan.themeId);
  const when = plan.startsAt && !plan.dateTbd ? `${formatDayShort(plan.startsAt)} · ${formatTime(plan.startsAt)}` : "Tarih netleşmedi";
  const message = `${plan.title} — ${when}. Geliyor musun? ${url}`;

  useEffect(() => {
    if (!open) setQr(null);
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };
  const showQr = async () => {
    if (qr) return setQr(null);
    const q = await import("qrcode");
    setQr(await q.toDataURL(url, { margin: 1, width: 240, color: { dark: "#0C0C0D", light: "#F5F2EC" } }));
  };
  const native = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: plan.title, text: message, url });
      } catch {
        /* cancelled */
      }
    } else copy();
  };
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <>
      <Modal open={open} onClose={onClose} title="Paylaş" width={960}>
        <div className="flex min-h-0 flex-col md:flex-row">
          <section className="flex grow flex-col gap-5 p-5 md:border-r md:border-line md:p-8">
            <div className="flex items-center gap-2.5 text-[15px] font-bold text-[#1EC9B0]"><span className="flex size-8 items-center justify-center rounded-pill bg-[#1EC9B0] text-bg"><CheckIcon size={16} strokeWidth={2.6} /></span> Plan yayında · {plan.visibility === "public" ? "herkese açık" : "gizli link"}</div>
            <div className="flex flex-col gap-1.5">
              <h2 className="display text-[32px] leading-[1.05] md:text-[40px]">Şimdi herkesi çağır.</h2>
              <p className="text-muted">Linki alan herkes katılımını bildirebilir; uygulama indirmek gerekmez.</p>
            </div>
            <div className="flex h-14 items-center gap-2.5 rounded-lg border border-white/14 bg-white/6 pl-4 pr-2"><span className="grow truncate font-semibold">{short}</span><button type="button" onClick={copy} className="h-10 rounded-[10px] bg-white px-4 text-sm font-extrabold text-bg">{copied ? "Kopyalandı" : "Kopyala"}</button></div>
            <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="flex h-16 items-center justify-center gap-3 rounded-pill bg-[#25D366] text-lg font-extrabold text-[#0B141A]"><ShareIcon size={20} /> WhatsApp’ta paylaş</a>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setStory(true)} className={tile}><ImageIcon size={18} /> Hikâye afişi indir</button>
              <button type="button" onClick={showQr} aria-pressed={!!qr} className={tile}><QrIcon /> QR kod</button>
              <button type="button" className={tile} title="Yakında"><UsersIcon size={18} /> Ortak arkadaşları davet et ({mutuals})</button>
              <button type="button" onClick={native} className={tile}>{canShare ? "Diğer (Instagram, SMS, e-posta)" : "Diğer · linki kopyala"}</button>
            </div>
            {qr && (
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="Plan QR kodu" width={120} height={120} className="rounded-lg" />
                <div className="flex flex-col gap-1.5 text-sm text-muted"><span className="font-bold text-text">Kapıya as, masaya koy.</span><span>Okutan doğrudan davetiyeye gelir.</span><a href={qr} download={`${plan.code}-qr.png`} className="font-bold text-amber">PNG indir →</a></div>
              </div>
            )}
            <div className="mt-auto flex flex-col gap-2.5 rounded-xl border border-dashed border-white/16 bg-white/4 p-4">
              <span className="text-sm font-bold">Sıradaki adımlar <span className="font-medium text-subtle">· isteğe bağlı</span></span>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
                {([["cost", "IBAN / Papara ekle"], ["hosts", "Ortak düzenleyen davet et"], ["questions", "Misafirlere soru ekle"]] as const).map(([tab, label]) => (
                  <button key={tab} type="button" onClick={() => onSettings?.(tab)} className="flex items-center gap-1.5"><span className="block size-[18px] rounded-pill border-[1.5px] border-subtle" />{label}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end"><Link href={routes.plan(plan.code)} onClick={onClose} className="flex h-12 items-center rounded-pill border border-white/25 px-5.5 text-[15px] font-bold">Plan sayfasına git →</Link></div>
          </section>

          <aside className="flex w-full shrink-0 flex-col gap-3.5 bg-bg p-5 md:w-[360px] md:p-7">
            <span className="text-xs font-extrabold tracking-wide text-subtle">WHATSAPP’TA BÖYLE GÖRÜNÜR</span>
            <div className="flex flex-col rounded-[18px] border border-white/8 bg-[#0B141A] p-3">
              <div className="flex w-[280px] max-w-full flex-col gap-1.5 self-end rounded-[14px_4px_14px_14px] bg-[#005C4B] p-1.5 text-[#E9EDEF]">
                <div className="overflow-hidden rounded-[10px] bg-[#0B141A]">
                  <div className="flex h-[146px] items-center justify-between px-4" style={{ background: t.poster, color: t.fg }}>
                    <div className="flex flex-col gap-1"><span className="text-2xl leading-none" style={titleFontStyle(plan.titleFont)}>{plan.title}</span><span className="text-[13px] font-bold">{when}</span><span className="text-xs opacity-85">Geliyor musun?</span></div>
                    <Poster themeId={plan.themeId} text={plan.posterText ?? "30"} src={plan.posterUrl} className="w-[84px] shrink-0 rounded-md" />
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-2"><Mark size={22} solid /><div className="flex flex-col"><span className="text-[13px] font-bold">{plan.title} · partile</span><span className="text-[11px] text-[#8696A0]">{short}</span></div></div>
                </div>
                <p className="px-1.5 pb-0.5 text-sm leading-snug">{plan.description?.split("\n")[0]?.slice(0, 80)} Geliyor musun?</p>
                <span className="self-end pr-1 text-[11px] text-[#8696A0]">14:02 ✓✓</span>
              </div>
            </div>
            <span className="text-[13px] leading-relaxed text-subtle">Önizleme kartı afiş + tarih + “Geliyor musun?” ile gelir. Mesaj metnini paylaşırken değiştirebilirsin.</span>
            <div className="mt-auto flex flex-col gap-2 rounded-lg bg-white/5 p-3.5">
              <span className="text-xs font-extrabold tracking-wide text-subtle">GİZLİLİK</span>
              <span className="text-sm leading-snug">Plan <strong>{plan.visibility === "public" ? "herkese açık" : "gizli"}</strong>: {plan.visibility === "public" ? "profilinde ve Keşfet’te görünür." : "yalnızca linke sahip olanlar görür. Katılımcı listesi ve adres yalnız katılım bildirenlere açılır."}</span>
              <button type="button" onClick={() => onSettings?.("privacy")} className="w-fit text-[13px] font-bold text-amber">Görünürlüğü değiştir →</button>
            </div>
          </aside>
        </div>
      </Modal>
      <StoryPoster plan={plan} open={story} onClose={() => setStory(false)} />
    </>
  );
}
