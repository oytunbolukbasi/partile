"use client";

import { useEffect, useMemo, useState } from "react";
import { effectLabel, type EffectSettings } from "@partile/core";
import { themeById } from "@partile/ui-tokens";
import { CloseIcon } from "@/components/shell/icons";

const ONCE_MS = 4000;
const COUNT = { low: 18, mid: 36, high: 60 } as const;
const COLORS = ["#FFB020", "#FF6A3D", "#1EC9B0", "#FFD166", "#FFF1E3"];

/** Deterministic pseudo-random so the same plan renders the same particle field. */
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
};

/**
 * Particle overlay on the invitation (`Effects` artboard). Pure CSS animations, at most 60 particles,
 * off under `prefers-reduced-motion`; "once" plays ~4 s after mount, "loop" stays until the guest dismisses it.
 */
export function EffectLayer({ effect, themeId, seed = 1 }: { effect: EffectSettings | undefined; themeId: string; seed?: number }) {
  const [on, setOn] = useState(false);
  const id = effect?.id ?? "none";
  useEffect(() => {
    if (id === "none") return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setOn(true);
    if (effect?.mode !== "loop") {
      const t = setTimeout(() => setOn(false), ONCE_MS + 2500);
      return () => clearTimeout(t);
    }
  }, [id, effect?.mode]);

  const particles = useMemo(() => {
    const r = rng(seed * 7919 + id.length);
    const n = COUNT[effect?.level ?? "mid"];
    const accent = themeById(themeId).accent;
    return Array.from({ length: n }, (_, i) => ({
      i,
      x: r() * 100,
      y: r() * 100,
      d: r() * 6,
      s: 0.7 + r() * 0.9,
      c: i % 4 === 0 ? accent : COLORS[Math.floor(r() * COLORS.length)]!,
      dur: 4 + r() * 5,
    }));
  }, [seed, id, effect?.level, themeId]);

  if (!on || id === "none") return null;
  const once = effect?.mode !== "loop";
  const anim = (name: string, p: (typeof particles)[number]) => ({ animation: `${name} ${p.dur}s ${once ? "ease-out 1" : "linear infinite"}`, animationDelay: `${once ? p.d * 0.3 : -p.d}s` });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {particles.map((p) => {
        if (id === "confetti") return <span key={p.i} className="absolute -top-4 rounded-[2px]" style={{ left: `${p.x}%`, width: 8 * p.s, height: 12 * p.s, background: p.c, ...anim("fx-fall", p) }} />;
        if (id === "snow") return <span key={p.i} className="absolute -top-3 rounded-pill bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.7)]" style={{ left: `${p.x}%`, width: 6 * p.s, height: 6 * p.s, ...anim("fx-fall-soft", p) }} />;
        if (id === "sparkle") return <span key={p.i} className="absolute rounded-pill bg-[#FFF1E3] shadow-[0_0_12px_3px_rgba(255,209,102,0.7)]" style={{ left: `${p.x}%`, top: `${p.y}%`, width: 7 * p.s, height: 7 * p.s, ...anim("fx-twinkle", { ...p, dur: 1.6 + p.d * 0.3 }) }} />;
        if (id === "balloons") return <span key={p.i} className="absolute -bottom-16 rounded-[50%_50%_50%_50%/45%_45%_55%_55%]" style={{ left: `${p.x}%`, width: 30 * p.s, height: 38 * p.s, background: p.c, ...anim("fx-rise", { ...p, dur: p.dur + 4 }) }} />;
        if (id === "hearts")
          return (
            <svg key={p.i} className="absolute -bottom-10" viewBox="0 0 24 24" style={{ left: `${p.x}%`, width: 22 * p.s, height: 22 * p.s, ...anim("fx-rise", { ...p, dur: p.dur + 3 }) }} aria-hidden>
              <path d="M12 21s-7-4.6-9.3-8.6C.6 8.7 2.6 4.5 6.5 4.5c2 0 3.6 1.1 4.5 2.6.9-1.5 2.5-2.6 4.5-2.6 3.9 0 5.9 4.2 3.8 7.9C19 16.4 12 21 12 21z" fill={p.c} />
            </svg>
          );
        // fireworks: bursts at random points
        return <span key={p.i} className="absolute rounded-pill" style={{ left: `${p.x}%`, top: `${10 + p.y * 0.6}%`, width: 6, height: 6, background: p.c, boxShadow: `0 0 0 0 ${p.c}`, ...anim("fx-burst", { ...p, dur: 1.8 + p.d * 0.2 }) }} />;
      })}
      <button type="button" onClick={() => setOn(false)} className="pointer-events-auto absolute right-3 top-3 flex h-8 items-center gap-1.5 rounded-pill bg-bg/70 px-3 text-xs font-bold text-white md:right-6 md:top-[84px]">
        {effectLabel[id]} <CloseIcon size={12} />
      </button>
    </div>
  );
}
