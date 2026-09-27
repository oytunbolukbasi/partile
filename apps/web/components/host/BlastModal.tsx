"use client";

import { useState } from "react";
import { formatDayShort, formatTime } from "@partile/core";
import { Mark } from "@/components/brand/Mark";
import { ImageIcon, LinkIcon } from "@/components/shell/icons";
import { Modal, btnGhost, btnPrimary, modalFooter } from "@/components/ui/Modal";
import type { Guest, Plan } from "@partile/core";

const MAX_BLASTS = 10;
const MAX_CHARS = 400;
type Seg = "going" | "maybe" | "invited" | "pending" | "checkedIn";
const SEGS: { id: Seg; label: string; color?: string }[] = [
  { id: "going", label: "Geliyor", color: "#1EC9B0" },
  { id: "maybe", label: "Belki" },
  { id: "invited", label: "Davetli · yanıtsız", color: "#A8A39B" },
  { id: "pending", label: "Onay bekliyor", color: "#FFB547" },
  { id: "checkedIn", label: "Giriş yapanlar" },
];

/** `Blast` artboard: pick segments, write ≤400 chars, see the e-mail preview, send (in-app + e-mail). Not editable after sending. */
export function BlastModal({ plan, guests, hostName, open, onClose, onSend }: { plan: Plan; guests: Guest[]; hostName: string; open: boolean; onClose: () => void; onSend: (b: { toLabel: string; guestIds: string[]; text: string }) => void }) {
  const [on, setOn] = useState<Record<Seg, boolean>>({ going: true, maybe: true, invited: false, pending: false, checkedIn: false });
  const [text, setText] = useState("");
  const inSeg = (g: Guest, s: Seg) => (s === "checkedIn" ? !!g.checkedIn : g.status === s);
  const n = (s: Seg) => guests.filter((g) => inSeg(g, s)).length;
  const recipients = guests.filter((g) => SEGS.some((s) => on[s.id] && inSeg(g, s.id)));
  const total = recipients.length;
  const left = MAX_BLASTS - plan.blasts.length;
  const when = plan.startsAt ? `${formatDayShort(plan.startsAt)} · ${formatTime(plan.startsAt)}` : "Tarih netleşmedi";

  const send = () => {
    if (!text.trim() || !total || left <= 0) return;
    onSend({ toLabel: SEGS.filter((s) => on[s.id]).map((s) => s.label.split(" ·")[0]).join(" + "), guestIds: recipients.map((g) => g.id), text: text.trim() });
    setText("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Duyuru gönder" width={920} headerRight={<span className="text-[13px] text-subtle">{plan.blasts.length} / {MAX_BLASTS} duyuru</span>}>
      <div className="flex min-h-0 flex-col md:flex-row">
        <section className="flex grow flex-col gap-4.5 p-5 md:border-r md:border-line md:p-7">
          <div className="flex flex-col gap-2.5">
            <span className="text-[15px] font-bold">Kime</span>
            <div className="flex flex-wrap gap-2">
              {SEGS.map((s) => (
                <button key={s.id} type="button" aria-pressed={on[s.id]} onClick={() => setOn({ ...on, [s.id]: !on[s.id] })} className={`flex h-10 items-center gap-2 rounded-pill border px-3.5 text-sm font-bold ${on[s.id] ? "border-white/45 bg-white/14" : "border-white/14"}`}>
                  <span style={{ color: s.color }}>{s.label}</span> <span className="font-medium text-subtle">{n(s.id)}</span>
                </button>
              ))}
            </div>
            <span className="text-[13px] text-subtle">{total} kişiye gidecek · yalnızca partile üzerinden davet edilen ya da katılım bildirenler</span>
          </div>
          <div className="flex grow flex-col gap-2">
            <label htmlFor="blast-msg" className="text-[15px] font-bold">Mesaj</label>
            <textarea id="blast-msg" data-autofocus rows={6} maxLength={MAX_CHARS} value={text} onChange={(e) => setText(e.target.value)} placeholder="Terası 20:00’de açıyorlar, erken gelenler için 19:30’da Moda sahilinde buluşalım." className="grow resize-none rounded-xl border border-white/18 bg-white/6 p-4 text-base font-medium leading-relaxed outline-none placeholder:text-subtle focus:border-white/40" />
            <div className="flex items-center gap-2">
              <button type="button" className="flex h-10 items-center gap-2 rounded-pill border border-white/20 px-3.5 text-sm font-bold" title="Yakında"><ImageIcon size={16} /> Fotoğraf</button>
              <button type="button" onClick={() => setText((t) => `${t.trimEnd()} getpartile.com/e/${plan.code}`.trim())} className="flex h-10 items-center gap-2 rounded-pill border border-white/20 px-3.5 text-sm font-bold"><LinkIcon size={16} /> Plan linki ekle</button>
              <span className="ml-auto text-[13px] text-subtle">{text.length} / {MAX_CHARS}</span>
            </div>
          </div>
          <p className="rounded-lg border border-white/8 bg-white/5 px-3.5 py-3 text-sm leading-snug text-muted">
            Kanal: <strong className="text-text">uygulama içi bildirim</strong> + <strong className="text-text">e-posta</strong>. WhatsApp ve SMS ileride. Gönderildikten sonra düzenlenemez.
          </p>
          <div className={`${modalFooter} -mx-5 -mb-5 md:-mx-7 md:-mb-7`}>
            <button type="button" onClick={onClose} className={btnGhost}>Vazgeç</button>
            <button type="button" onClick={send} disabled={!text.trim() || !total || left <= 0} className={`${btnPrimary} disabled:opacity-40`}>{total} kişiye gönder</button>
          </div>
        </section>
        <aside className="flex w-full shrink-0 flex-col gap-3.5 bg-bg p-5 md:w-[340px] md:p-6">
          <span className="text-xs font-extrabold tracking-wide text-subtle">E-POSTADA BÖYLE GÖRÜNÜR</span>
          <div className="overflow-hidden rounded-xl bg-text text-bg">
            <div className="flex flex-col gap-0.5 border-b border-[#E2D7C5] px-3.5 py-3">
              <span className="text-[11px] text-[#5F584F]">Kimden: <strong className="text-bg">partile</strong> &lt;duyuru@getpartile.com&gt;</span>
              <span className="text-[13px] font-extrabold">{plan.title} · {hostName.split(" ")[0]}’dan duyuru</span>
            </div>
            <div className="flex flex-col gap-3 p-3.5">
              <span className="flex items-center gap-2 text-sm font-extrabold"><Mark size={20} color="#0C0C0D" hole="#F5F2EC" solid /> partile</span>
              <span className="whitespace-pre-line text-sm leading-snug">{text || "Mesajın burada görünecek."}</span>
              <span className="flex h-[38px] w-fit items-center rounded-pill bg-bg px-4 text-[13px] font-extrabold text-white">Planı aç</span>
              <span className="text-[11px] text-[#5F584F]">{when} · {plan.location?.district} · Bu planın bildirimlerini sessize al</span>
            </div>
          </div>
          <span className="pt-1.5 text-xs font-extrabold tracking-wide text-subtle">GEÇMİŞ DUYURULAR</span>
          <div className="flex flex-col gap-2">
            {plan.blasts.length === 0 && <span className="text-[13px] text-subtle">Henüz duyuru göndermedin.</span>}
            {[...plan.blasts].reverse().map((b) => (
              <div key={b.id} className="flex flex-col gap-1 rounded-lg bg-white/5 p-3">
                <span className="text-xs text-subtle">{formatDayShort(b.at)} {formatTime(b.at)} · {b.to} · {b.count} kişi</span>
                <span className="text-[13px] leading-snug">{b.text}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Modal>
  );
}
