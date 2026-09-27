"use client";

import { useEffect, useState } from "react";
import type { PlanDraft } from "@partile/core";
import { PinIcon } from "@/components/shell/icons";
import { Modal, btnPrimary, field } from "@/components/ui/Modal";
import { searchPlaces, type Place } from "@/lib/geocode";

type Location = NonNullable<PlanDraft["location"]>;

/** `LocationPicker` artboard: Photon autocomplete, results, district-only vs full address. No map (decision 27 Sep 2026). */
export function LocationModal({ open, onClose, value, onSave }: { open: boolean; onClose: () => void; value?: Location; onSave: (v: Location) => void }) {
  const [q, setQ] = useState(value?.name ?? "");
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [picked, setPicked] = useState<Location | null>(value ?? null);
  const [display, setDisplay] = useState<"district" | "full">(value?.display ?? "district");

  useEffect(() => {
    if (!open) return;
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      setStatus("idle");
      return;
    }
    const ctrl = new AbortController();
    setStatus("loading");
    const t = setTimeout(() => {
      searchPlaces(query, ctrl.signal)
        .then((r) => {
          setResults(r);
          setStatus("done");
        })
        .catch((e) => {
          if (e?.name !== "AbortError") setStatus("error");
        });
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, open]);

  const custom = q.trim().length > 1 && !results.some((r) => r.name === q.trim());
  const districtLabel = picked?.district ?? "Semt";
  const commit = () => picked && onSave({ ...picked, display });

  return (
    <Modal open={open} onClose={onClose} title="Nerede?" width={920}>
      <div className="flex flex-col">
        <section className="flex flex-col gap-3.5 p-5">
          <label htmlFor="loc" className="sr-only">
            Mekân ara
          </label>
          <input id="loc" data-autofocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mekân ya da adres yaz: Moda, Cihangir, Bağdat Cad…" autoComplete="off" className={field} />
          <div className="flex min-h-[220px] flex-col overflow-hidden rounded-lg border border-white/10">
            {status === "idle" && <p className="p-4 text-sm text-subtle">Yazdıkça öneriler gelir. Veriler OpenStreetMap’ten.</p>}
            {status === "loading" && results.length === 0 && <p className="p-4 text-sm text-subtle">Aranıyor…</p>}
            {status === "error" && <p className="p-4 text-sm text-subtle">Öneriler alınamadı; adresi aşağıdan kendin ekleyebilirsin.</p>}
            {results.map((r) => {
              const sel = picked?.name === r.name && picked?.address === r.address;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setPicked({ name: r.name, address: r.address, district: r.district, lat: r.lat, lng: r.lng, display })}
                  className={`flex items-center gap-3 border-b border-white/6 px-3.5 py-3 text-left last:border-b-0 ${sel ? "bg-white/10" : "hover:bg-white/5"}`}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-white/8">
                    <PinIcon size={18} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[15px] font-bold">{r.name}</span>
                    <span className="truncate text-[13px] text-subtle">{r.address}</span>
                  </span>
                </button>
              );
            })}
            {custom && status !== "loading" && (
              <button type="button" onClick={() => setPicked({ name: q.trim(), address: q.trim(), district: q.trim().split(",")[0]?.trim(), display })} className="flex items-center gap-3 border-t border-dashed border-white/20 px-3.5 py-3 text-left hover:bg-white/5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-white/8 font-bold">+</span>
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

      </div>
      <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-line bg-panel px-5 py-4">
        <span className="flex min-w-0 grow flex-col"><span className="truncate font-bold">{picked?.name ?? "Bir mekân seç"}</span><span className="truncate text-[13px] text-subtle">{picked?.address ?? ""}</span></span>
        <button type="button" disabled={!picked} onClick={commit} className={`${btnPrimary} shrink-0 disabled:opacity-40`}>
          Konumu seç
        </button>
      </div>
    </Modal>
  );
}
