"use client";

import { useMemo, useState } from "react";
import type { PlanDraft } from "@partile/core";
import { PinIcon } from "@/components/shell/icons";
import { Modal, btnPrimary, field } from "@/components/ui/Modal";

type Location = NonNullable<PlanDraft["location"]>;

/* Placeholder suggestions until Google Places is wired; the free-text row always works. */
const SAMPLE = [
  { name: "Moda Deniz Kulübü", address: "Caferağa, Moda Cad. 12, Kadıköy", district: "Moda, Kadıköy" },
  { name: "Moda Sahil Parkı", address: "Caferağa, Moda Sahil Yolu, Kadıköy", district: "Moda, Kadıköy" },
  { name: "Cihangir Parkı", address: "Cihangir, Beyoğlu", district: "Cihangir, Beyoğlu" },
  { name: "Fenerbahçe Parkı", address: "Fenerbahçe, Kadıköy", district: "Fenerbahçe, Kadıköy" },
];

/** `LocationPicker` artboard: search, results, map placeholder, district-only vs full address. */
export function LocationModal({ open, onClose, value, onSave }: { open: boolean; onClose: () => void; value?: Location; onSave: (v: Location) => void }) {
  const [q, setQ] = useState(value?.name ?? "");
  const [picked, setPicked] = useState<Location | null>(value ?? null);
  const [display, setDisplay] = useState<"district" | "full">(value?.display ?? "district");

  const results = useMemo(() => {
    const s = q.trim().toLocaleLowerCase("tr-TR");
    return s ? SAMPLE.filter((r) => r.name.toLocaleLowerCase("tr-TR").includes(s) || r.address.toLocaleLowerCase("tr-TR").includes(s)) : SAMPLE;
  }, [q]);

  const custom = q.trim() && !results.some((r) => r.name === q.trim());
  const districtLabel = picked?.district ?? "Semt";

  return (
    <Modal open={open} onClose={onClose} title="Nerede?" width={920}>
      <div className="flex flex-col md:flex-row">
        <section className="flex flex-col gap-3.5 p-5 md:w-[440px] md:border-r md:border-line">
          <label htmlFor="loc" className="sr-only">
            Mekân ara
          </label>
          <input id="loc" data-autofocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mekân ya da adres ara" className={field} />
          <div className="flex flex-col overflow-hidden rounded-lg border border-white/10">
            {results.map((r) => {
              const sel = picked?.name === r.name;
              return (
                <button key={r.name} type="button" onClick={() => setPicked({ ...r, display })} className={`flex items-center gap-3 border-b border-white/6 px-3.5 py-3 text-left last:border-b-0 ${sel ? "bg-white/10" : "hover:bg-white/5"}`}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-white/8">
                    <PinIcon size={18} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[15px] font-bold">{r.name}</span>
                    <span className="truncate text-[13px] text-subtle">{r.address}</span>
                  </span>
                </button>
              );
            })}
            {custom && (
              <button type="button" onClick={() => setPicked({ name: q.trim(), address: q.trim(), district: q.trim().split(",")[0]?.trim(), display })} className="flex items-center gap-3 border-t border-dashed border-white/20 px-3.5 py-3 text-left hover:bg-white/5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-white/8">+</span>
                <span className="text-[15px] font-bold">“{q.trim()}” olarak ekle</span>
              </button>
            )}
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <span className="text-[13px] font-bold">Davetiyede nasıl görünsün?</span>
            <div role="radiogroup" aria-label="Adres gösterimi" className="flex gap-2">
              {(["district", "full"] as const).map((d) => (
                <button key={d} type="button" role="radio" aria-checked={display === d} onClick={() => setDisplay(d)} className={`h-11 grow rounded-pill border text-[13px] font-bold ${display === d ? "border-white/50 bg-white/14" : "border-white/14"}`}>
                  {d === "district" ? "Yalnız semt" : "Tam adres"}
                </button>
              ))}
            </div>
            <span className="text-xs leading-snug text-subtle">
              {display === "district" ? `Davetiyede “${districtLabel}” yazar; tam adres ve harita linki katılım bildirenlere açılır.` : "Tam adres ve harita linki herkese görünür."}
            </span>
          </div>
        </section>

        <section className="relative min-h-[320px] grow overflow-hidden bg-[#1A1B1E] md:min-h-[520px]">
          <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 48px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 48px), radial-gradient(60% 40% at 30% 70%, #12313A 0%, rgba(18,49,58,0) 70%)" }} />
          <div className="absolute inset-x-0 bottom-0 h-[220px]" style={{ background: "linear-gradient(180deg, rgba(18,49,58,0) 0%, #12313A 60%)" }} />
          <div className="absolute left-1/2 top-[45%] flex -translate-x-1/2 flex-col items-center">
            <span className="mb-1.5 flex h-9 items-center rounded-pill bg-white px-3 text-[13px] font-extrabold text-bg shadow-[0_8px_20px_rgba(0,0,0,0.4)]">{display === "district" ? districtLabel : (picked?.name ?? "Konum")}</span>
            <PinIcon size={40} className="text-coral" />
          </div>
          {display === "district" && <div className="absolute left-1/2 top-[40%] h-[180px] w-[220px] -translate-x-1/2 rounded-pill border-2 border-dashed border-white/40 bg-coral/12" />}
          <div className="absolute bottom-4 left-4 text-xs tracking-wider text-white/45">HARİTA · Google Places sonra bağlanacak</div>
          <div className="absolute inset-x-4 bottom-4 hidden items-center gap-2.5 rounded-xl border border-white/12 bg-bg/85 px-4 py-3.5 md:flex">
            <span className="flex min-w-0 grow flex-col">
              <span className="truncate font-bold">{picked?.name ?? "Bir mekân seç"}</span>
              <span className="truncate text-[13px] text-subtle">{picked?.address ?? ""}</span>
            </span>
            <button type="button" disabled={!picked} onClick={() => picked && onSave({ ...picked, display })} className={`${btnPrimary} h-11 disabled:opacity-40`}>
              Konumu seç
            </button>
          </div>
        </section>
      </div>
      <div className="flex border-t border-line px-5 py-4 md:hidden">
        <button type="button" disabled={!picked} onClick={() => picked && onSave({ ...picked, display })} className={`${btnPrimary} w-full justify-center disabled:opacity-40`}>
          Konumu seç
        </button>
      </div>
    </Modal>
  );
}
