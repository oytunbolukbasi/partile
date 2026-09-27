"use client";

import { useState } from "react";
import { RsvpStyle, rsvpStyleLabel } from "@partile/core";
import { CheckIcon, ChevronDownIcon } from "@/components/shell/icons";

const DESC: Record<RsvpStyle, string> = {
  icons: "Üç yuvarlak düğme: onay, soru, çarpı. Varsayılan.",
  emoji: "Yuvarlak düğmeler, emoji ile: 🎉 🤔 😢",
  text: "Hap düğmeler, ikon yok. Kurumsal ve sakin planlar için.",
  single: "“Geliyorum” öne çıkar; Belki ve Gelemiyorum küçük metin.",
};
const GOLD = "radial-gradient(circle at 35% 30%, #FFE3A8 0%, #FFB547 45%, #FF7A3D 100%)";
const Mini = ({ id }: { id: RsvpStyle }) =>
  id === "icons" ? (
    <span className="flex gap-[3px]"><span className="size-[11px] rounded-pill" style={{ background: GOLD }} /><span className="size-[11px] rounded-pill border-[1.5px] border-white/40" /><span className="size-[11px] rounded-pill border-[1.5px] border-white/40" /></span>
  ) : id === "emoji" ? (
    <span className="text-base leading-none" aria-hidden>🎉</span>
  ) : id === "text" ? (
    <span className="h-2.5 w-[26px] rounded-pill bg-amber" />
  ) : (
    <span className="h-3.5 w-[30px] rounded-pill" style={{ background: "linear-gradient(90deg, #FFE3A8, #FF7A3D)" }} />
  );

/** `RsvpStyles` artboard: the glass dropdown on the editor's "Katılım seçenekleri" card. */
export function RsvpStyleMenu({ value, onChange }: { value: RsvpStyle; onChange: (v: RsvpStyle) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="glass flex h-10 items-center gap-2 rounded-md px-3.5 text-[15px] font-bold">
        {rsvpStyleLabel[value]} <ChevronDownIcon size={14} />
      </button>
      {open && (
        <>
          <button type="button" aria-label="Menüyü kapat" onClick={() => setOpen(false)} className="fixed inset-0 z-10 cursor-default" />
          <div role="menu" className="glass-menu absolute right-0 top-12 z-20 flex w-[300px] flex-col gap-0.5 rounded-xl p-1.5 text-text shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            {RsvpStyle.options.map((id) => {
              const on = id === value;
              return (
                <button key={id} type="button" role="menuitemradio" aria-checked={on} onClick={() => { onChange(id); setOpen(false); }} className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-left ${on ? "bg-white/10" : "hover:bg-white/6"}`}>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-white/8"><Mini id={id} /></span>
                  <span className="flex grow flex-col gap-0.5"><span className="text-[15px] font-bold">{rsvpStyleLabel[id]}</span><span className="text-xs leading-snug text-muted">{DESC[id]}</span></span>
                  <span className="w-5 text-[#1EC9B0]">{on && <CheckIcon size={14} strokeWidth={3} />}</span>
                </button>
              );
            })}
            <span className="mx-2 mb-1.5 mt-1 text-[11px] leading-snug text-subtle">Etiketler her zaman Geliyorum / Belki / Gelemiyorum. “Belki” kapalıysa iki seçenek kalır.</span>
          </div>
        </>
      )}
    </div>
  );
}
