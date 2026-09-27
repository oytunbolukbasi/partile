"use client";

import { useState } from "react";
import { formatDayLong, formatTime, type PlanDraft, type PollOption } from "@partile/core";
import { CloseIcon, PlusIcon } from "@/components/shell/icons";
import { Modal, btnGhost, btnPrimary, modalFooter } from "@/components/ui/Modal";

const MAX = 6;
// Istanbul is fixed UTC+3.
const toIso = (date: string, time: string) => {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!, (h ?? 0) - 3, min ?? 0)).toISOString();
};
const fromIso = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 3 * 3600 * 1000);
  return { date: d.toISOString().slice(0, 10), time: d.toISOString().slice(11, 16) };
};
type Row = { id: string; date: string; time: string };
const nextDate = (rows: Row[]) => {
  const last = rows[rows.length - 1]?.date;
  const base = last ? new Date(`${last}T12:00:00Z`) : new Date();
  base.setUTCDate(base.getUTCDate() + (last ? 7 : 3));
  return base.toISOString().slice(0, 10);
};

/** `Poll` artboard: up to six candidate dates; guests vote Evet / Belki / Hayır; picking a day converts votes to RSVPs. */
export function PollModal({ open, onClose, draft, onSave }: { open: boolean; onClose: () => void; draft: PlanDraft; onSave: (p: Partial<PlanDraft>) => void }) {
  const blocked = draft.cost.mode !== "off" || draft.requireApproval;
  const initial = (draft.poll ?? []).map((o) => ({ id: o.id, ...fromIso(o.startsAt) }));
  const [rows, setRows] = useState<Row[]>(initial.length ? initial : [{ id: "p1", date: nextDate([]), time: "20:00" }]);
  const [seed, setSeed] = useState(open);
  if (seed !== open) {
    setSeed(open);
    setRows(initial.length ? initial : [{ id: "p1", date: nextDate([]), time: "20:00" }]);
  }
  const set = (id: string, p: Partial<Row>) => setRows(rows.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const valid = rows.filter((r) => r.date && r.time);
  const save = () => {
    const poll: PollOption[] = valid.map((r) => ({ id: r.id, startsAt: toIso(r.date, r.time) }));
    onSave({ poll, dateTbd: true, startsAt: undefined, endsAt: undefined });
  };
  const input = "h-11 rounded-md border border-white/18 bg-white/6 px-3 text-[15px] font-bold text-text outline-none [color-scheme:dark] focus:border-white/40";

  return (
    <Modal open={open} onClose={onClose} title="Hangi gün?" width={640}>
      <div className="flex flex-col gap-4.5 p-6">
        <p className="text-[17px] leading-relaxed">Birkaç tarih ver, misafirler her birine oy versin; hazır olunca birini seç.</p>
        <p className={`text-sm ${blocked ? "font-bold text-[#FF8C6B]" : "text-subtle"}`}>{blocked ? "Masrafı böl ya da katılım onayı açıkken tarih anketi kullanılamaz. Önce onları kapat." : "Masrafı böl ve katılım onayıyla birlikte kullanılamaz"}</p>
        <div className="flex flex-col gap-2.5">
          {rows.map((r, i) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3.5 py-3">
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-white/10 text-sm font-extrabold">{i + 1}</span>
              <span className="flex min-w-0 grow flex-col gap-0.5">
                <span className="text-[17px] font-bold">{r.date && r.time ? formatDayLong(toIso(r.date, r.time)) : "Tarih seç"}</span>
                <span className="text-sm text-subtle">{r.date && r.time ? formatTime(toIso(r.date, r.time)) : "Saat"}</span>
              </span>
              <input type="date" aria-label={`${i + 1}. seçenek tarihi`} value={r.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => set(r.id, { date: e.target.value })} className={input} />
              <input type="time" aria-label={`${i + 1}. seçenek saati`} value={r.time} step={300} onChange={(e) => set(r.id, { time: e.target.value })} className={`${input} w-[110px]`} />
              <button type="button" aria-label="Kaldır" disabled={rows.length === 1} onClick={() => setRows(rows.filter((x) => x.id !== r.id))} className="flex size-10 items-center justify-center rounded-pill text-subtle disabled:opacity-30"><CloseIcon size={16} /></button>
            </div>
          ))}
          {rows.length < MAX && (
            <button type="button" onClick={() => setRows([...rows, { id: `p${Date.now()}`, date: nextDate(rows), time: rows[rows.length - 1]?.time ?? "20:00" }])} className="flex h-[52px] items-center justify-center gap-2 rounded-lg border border-dashed border-white/30 text-[15px] font-bold"><PlusIcon size={16} /> Seçenek ekle</button>
          )}
        </div>
        <div className="grid gap-2.5 md:grid-cols-3">
          {[
            ["#FF6A3D", "Davet et", "Herkes her seçeneğe Evet / Belki / Hayır der"],
            ["#FFB020", "Günü seç", "Oylar otomatik Geliyorum / Belki / Gelemiyorum olur"],
            ["#1EC9B0", "Parti devam", "Sonradan davet edilenler anketi görmez"],
          ].map(([c, t, d], i) => (
            <div key={t} className="flex flex-col gap-1.5 rounded-lg bg-white/4 p-3.5">
              <span className="flex size-7 items-center justify-center rounded-pill text-[13px] font-extrabold text-bg" style={{ background: c }}>{i + 1}</span>
              <span className="text-sm font-bold">{t}</span>
              <span className="text-[13px] leading-snug text-subtle">{d}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={modalFooter}>
        {draft.poll?.length ? <button type="button" onClick={() => onSave({ poll: undefined, dateTbd: false })} className={`${btnGhost} mr-auto text-[#FF8C6B]`}>Anketi kaldır</button> : null}
        <button type="button" onClick={onClose} className={btnGhost}>Vazgeç</button>
        <button type="button" onClick={save} disabled={blocked || valid.length < 2} className={`${btnPrimary} disabled:opacity-40`}>Devam et</button>
      </div>
    </Modal>
  );
}
