"use client";

import { invitationThemes } from "@partile/ui-tokens";
import { DiceIcon, PencilIcon } from "@/components/shell/icons";

const categories = ["Tümü", "Popüler", "Açık", "Koyu", "Sezon"];

/** Theme swatch grid. Desktop: floating panel next to the toolbar; mobile: bottom sheet body. */
export function ThemePanel({ value, onChange, onClose }: { value: string; onChange: (id: string) => void; onClose?: () => void }) {
  const current = invitationThemes.find((t) => t.id === value) ?? invitationThemes[0]!;
  const shuffle = () => {
    const i = invitationThemes.findIndex((t) => t.id === value);
    onChange(invitationThemes[(i + 3) % invitationThemes.length]!.id);
  };
  return (
    <div className="flex flex-col gap-3.5 text-text">
      <div className="flex items-center justify-between">
        <span className="display text-lg tracking-tight">Tema</span>
        <div className="flex gap-2">
          <button type="button" onClick={shuffle} aria-label="Rastgele tema" className="flex size-9 items-center justify-center rounded-pill border border-white/20 bg-white/8">
            <DiceIcon />
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="flex h-9 items-center rounded-pill bg-white px-3.5 text-[13px] font-extrabold text-bg">
              Tamam
            </button>
          )}
        </div>
      </div>
      <div role="group" aria-label="Kategori" className="flex flex-wrap gap-1.5">
        {categories.map((c, i) => (
          <button
            key={c}
            type="button"
            aria-pressed={i === 0}
            className={`h-[30px] rounded-pill px-3 text-[13px] ${i === 0 ? "border border-white/50 bg-white/12 font-bold" : "bg-white/8 font-semibold"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2.5 md:grid-cols-3">
        <button
          type="button"
          aria-label="Özel renk"
          className="flex size-[52px] items-center justify-center rounded-pill text-white"
          style={{ background: "conic-gradient(#FF6A3D, #FFB020, #1EC9B0, #0E7C86, #FF6A3D)" }}
        >
          <PencilIcon size={18} />
        </button>
        {invitationThemes.map((t) => {
          const sel = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              aria-pressed={sel}
              aria-label={t.name}
              className="relative size-[52px] rounded-pill"
              style={{ background: t.poster, border: sel ? "3px solid #FFFFFF" : "1px solid rgba(255,255,255,0.2)" }}
            >
            </button>
          );
        })}
      </div>
      <div className="text-xs leading-snug text-subtle">
        Seçili: <strong className="text-text">{current.name}</strong>
      </div>
    </div>
  );
}
