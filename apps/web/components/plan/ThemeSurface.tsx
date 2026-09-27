import { themeById } from "@partile/ui-tokens";
import type { CSSProperties } from "react";

/**
 * Applies an invitation theme to a subtree: background, text colour, and
 * glass variables flipped for light themes so the `glass` utility keeps contrast.
 */
export function ThemeSurface({ themeId, className = "", style, children }: { themeId: string; className?: string; style?: CSSProperties; children: React.ReactNode }) {
  const t = themeById(themeId);
  const light = t.tone === "light";
  const vars = {
    "--glass-fill": light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
    "--glass-fill-strong": light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.14)",
    "--glass-line": light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.16)",
    "--line": light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
    "--theme-accent": t.accent,
    "--theme-fg": t.fg,
  } as CSSProperties;
  return (
    <div className={className} style={{ background: t.bg, color: t.fg, ...vars, ...style }}>
      {children}
    </div>
  );
}
