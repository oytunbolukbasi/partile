"use client";

import { EffectId, effectLabel, type EffectSettings } from "@partile/core";

const SWATCH: Record<EffectId, string> = {
  none: "rgba(255,255,255,0.08)",
  confetti: "linear-gradient(135deg, #FFB020, #FF6A3D 50%, #1EC9B0)",
  sparkle: "radial-gradient(circle at 40% 40%, #FFF1E3, #FFD166 40%, #7A4A12)",
  snow: "radial-gradient(circle at 40% 40%, #FFFFFF, #BFD8E6 45%, #1D4ED8)",
  balloons: "radial-gradient(circle at 35% 35%, #FFD166, #FF6A3D 55%, #B91C3C)",
  hearts: "radial-gradient(circle at 40% 40%, #FB7185, #B91C3C 60%, #2A0710)",
  fireworks: "radial-gradient(circle at 50% 50%, #FFF1E3, #FFB020 30%, #071233 75%)",
};
const SHORT: Record<EffectId, string> = { none: "YOK", confetti: "KONFETİ", sparkle: "IŞILTI", snow: "KAR", balloons: "BALON", hearts: "KALP", fireworks: "FİŞEK" };
const LEVELS: [EffectSettings["level"], string][] = [["low", "Az"], ["mid", "Orta"], ["high", "Çok"]];
const MODES: [EffectSettings["mode"], string][] = [["once", "Açılışta bir kez (4 sn)"], ["loop", "Sürekli, hafif"]];

/** `Effects` artboard: pick the particle effect, its intensity and when it plays. Same slot as the theme panel. */
export function EffectPanel({ value, onChange, onClose }: { value: EffectSettings | undefined; onChange: (v: EffectSettings) => void; onClose?: () => void }) {
  const v: EffectSettings = value ?? { id: "none", level: "mid", mode: "once" };
  return (
    <div className="flex flex-col gap-3.5 text-text">
      <div className="flex items-center justify-between">
        <span className="display text-lg tracking-tight">Efekt</span>
        {onClose && <button type="button" onClick={onClose} className="flex h-9 items-center rounded-pill bg-white px-3.5 text-[13px] font-extrabold text-bg">Tamam</button>}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {EffectId.options.map((id) => {
          const on = v.id === id;
          return (
            <button key={id} type="button" aria-pressed={on} aria-label={effectLabel[id]} onClick={() => onChange({ ...v, id })} className={`flex size-[52px] items-center justify-center rounded-pill text-[10px] font-extrabold tracking-wide text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)] ${on ? "border-2 border-white shadow-[0_0_0_3px_rgba(255,255,255,0.15)]" : "border-2 border-white/18"}`} style={{ background: SWATCH[id] }}>
              {SHORT[id]}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-extrabold tracking-wide text-subtle">YOĞUNLUK</span>
        <div role="radiogroup" aria-label="Yoğunluk" className="flex gap-1">
          {LEVELS.map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={v.level === id} onClick={() => onChange({ ...v, level: id })} className={`h-[30px] grow rounded-pill border text-xs font-bold ${v.level === id ? "border-white/50 bg-white/14" : "border-white/14"}`}>{label}</button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-extrabold tracking-wide text-subtle">NE ZAMAN</span>
        <div role="radiogroup" aria-label="Ne zaman" className="flex flex-col gap-1">
          {MODES.map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={v.mode === id} onClick={() => onChange({ ...v, mode: id })} className={`h-[34px] rounded-[10px] border px-2.5 text-left text-[13px] font-bold ${v.mode === id ? "border-white/50 bg-white/14" : "border-white/14"}`}>{label}</button>
          ))}
        </div>
      </div>
      <span className="text-xs leading-relaxed text-subtle">Seçili: <strong className="text-text">{effectLabel[v.id]}</strong>. Hareketi azaltan misafirlerde oynamaz; misafir kapatabilir.</span>
    </div>
  );
}
