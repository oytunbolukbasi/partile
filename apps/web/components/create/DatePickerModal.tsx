"use client";

import { useMemo, useState } from "react";
import { formatDayLong } from "@partile/core";
import { Modal, btnGhost, btnPrimary, modalFooter } from "@/components/ui/Modal";
import { SettingRow, Toggle } from "@/components/ui/Toggle";
import { TimeField } from "@/components/ui/TimeField";

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DOW = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const QUICK = ["12:00", "18:30", "20:00", "21:00"];

/** Build an ISO string for a local Istanbul date/time. */
function toIso(y: number, m: number, d: number, hm: string): string {
  const [h, min] = hm.split(":").map(Number);
  // Istanbul is fixed UTC+3 (no DST since 2016).
  return new Date(Date.UTC(y, m, d, (h ?? 0) - 3, min ?? 0)).toISOString();
}
function fromIso(iso?: string) {
  if (!iso) return null;
  const d = new Date(new Date(iso).getTime() + 3 * 3600 * 1000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), hm: `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}` };
}

export type DateValue = { startsAt?: string; endsAt?: string; dateTbd: boolean };

/** `DatePicker` artboard: month grid (Monday first), time, optional end time, "date not final". */
export function DatePickerModal({ open, onClose, value, onSave, onPoll }: { open: boolean; onClose: () => void; value: DateValue; onSave: (v: DateValue) => void; onPoll?: () => void }) {
  const init = fromIso(value.startsAt);
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState({ y: init?.y ?? today.getFullYear(), m: init?.m ?? today.getMonth() });
  const [sel, setSel] = useState<{ y: number; m: number; d: number } | null>(init ? { y: init.y, m: init.m, d: init.d } : null);
  const [start, setStart] = useState(init?.hm ?? "20:00");
  const [hasEnd, setHasEnd] = useState(!!value.endsAt);
  const [end, setEnd] = useState(fromIso(value.endsAt)?.hm ?? "23:30");
  const [tbd, setTbd] = useState(value.dateTbd);

  const first = new Date(view.y, view.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => i - offset + 1);
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const save = () => {
    if (tbd || !sel) return onSave({ dateTbd: tbd, startsAt: tbd ? undefined : value.startsAt, endsAt: tbd ? undefined : value.endsAt });
    onSave({ dateTbd: false, startsAt: toIso(sel.y, sel.m, sel.d, start), endsAt: hasEnd ? toIso(sel.y, sel.m, sel.d, end) : undefined });
  };

  return (
    <Modal open={open} onClose={onClose} title="Ne zaman?" headerRight={<button type="button" onClick={onPoll} className="text-sm font-bold text-amber-soft">Misafirlere sor: hangi gün? →</button>}>
      <div className="flex flex-col md:flex-row">
        <section className="flex flex-col gap-4 border-b border-line p-6 md:w-[460px] md:border-b-0 md:border-r">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setView((v) => ({ y: v.m === 0 ? v.y - 1 : v.y, m: (v.m + 11) % 12 }))} aria-label="Önceki ay" className="flex size-10 items-center justify-center rounded-pill border border-white/18">
              ‹
            </button>
            <span className="display text-xl tracking-normal">
              {MONTHS[view.m]} {view.y}
            </span>
            <button type="button" onClick={() => setView((v) => ({ y: v.m === 11 ? v.y + 1 : v.y, m: (v.m + 1) % 12 }))} aria-label="Sonraki ay" className="flex size-10 items-center justify-center rounded-pill border border-white/18">
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold text-subtle">
            {DOW.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((n, i) => {
              if (n < 1 || n > daysInMonth) return <span key={i} />;
              const date = new Date(view.y, view.m, n);
              const past = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const isSel = sel?.y === view.y && sel?.m === view.m && sel?.d === n;
              const isToday = `${view.y}-${view.m}-${n}` === todayKey;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={past}
                  onClick={() => setSel({ y: view.y, m: view.m, d: n })}
                  aria-pressed={isSel}
                  aria-label={`${n} ${MONTHS[view.m]}`}
                  className={`flex h-[52px] items-center justify-center rounded-md text-[15px] ${isSel ? "bg-white font-extrabold text-bg" : past ? "text-[#5F584F]" : "bg-white/6 font-semibold hover:bg-white/12"} ${isToday && !isSel ? "ring-1 ring-white/40" : ""}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="text-[13px] text-subtle">Hafta Pazartesi başlar · Geçmiş günler seçilemez</div>
        </section>

        <section className="flex grow flex-col gap-3.5 p-6">
          <div className="glass flex flex-col gap-1 rounded-lg px-4 py-3.5">
            <span className="text-xs font-extrabold tracking-wide text-subtle">BAŞLANGIÇ</span>
            <span className="display text-[22px] tracking-normal">{sel ? `${formatDayLong(toIso(sel.y, sel.m, sel.d, start))} · ${start}` : "Takvimden gün seç"}</span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold">
              Saat
            </label>
            <TimeField value={start} onChange={setStart} label="Başlangıç saati" />
            <div className="flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button key={q} type="button" onClick={() => setStart(q)} className={`h-8 rounded-pill px-3 text-[13px] font-bold ${start === q ? "bg-white/20" : "bg-white/8"}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-white/4">
            <SettingRow title="Bitiş saati" hint={hasEnd ? `${end} · isteğe bağlı` : "isteğe bağlı"}>
              <Toggle checked={hasEnd} onChange={setHasEnd} label="Bitiş saati" />
            </SettingRow>
            {hasEnd && (
              <div className="px-4.5 pb-3">
                <TimeField value={end} onChange={setEnd} label="Bitiş saati" size="sm" />
              </div>
            )}
          </div>
          <div className="rounded-lg bg-white/4">
            <SettingRow title="Tarih henüz kesin değil" hint="Davetiyede “Tarih netleşmedi” yazar">
              <Toggle checked={tbd} onChange={setTbd} label="Tarih kesin değil" />
            </SettingRow>
          </div>
          <div className="text-[13px] text-subtle">Saat dilimi TSİ (Europe/Istanbul) · 24 saat</div>
        </section>
      </div>
      <div className={modalFooter}>
        <button type="button" onClick={onClose} className={btnGhost}>
          Vazgeç
        </button>
        <button type="button" onClick={save} disabled={!tbd && !sel} className={`${btnPrimary} disabled:opacity-40`}>
          Onayla
        </button>
      </div>
    </Modal>
  );
}
