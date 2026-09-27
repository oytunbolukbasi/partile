import { themeById } from "@partile/ui-tokens";
import type { CSSProperties } from "react";

/**
 * Square poster placeholder for a plan without an uploaded image:
 * theme gradient + big numeral/word + corner labels. Sized by the parent.
 */
export function Poster({
  themeId = "kor",
  text = "30",
  topLeft,
  bottomRight,
  className = "",
  style,
  numeralSize = "50%",
}: {
  themeId?: string;
  text?: string;
  topLeft?: string;
  bottomRight?: string;
  className?: string;
  style?: CSSProperties;
  /** Font size of the numeral relative to the poster width. */
  numeralSize?: string;
}) {
  const t = themeById(themeId);
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-md ${className}`}
      style={{ background: t.poster, color: t.fg, containerType: "inline-size", ...style }}
      aria-hidden
    >
      <div
        className="absolute inset-0 flex items-center justify-center font-poster font-extrabold"
        style={{ fontSize: `${numeralSize.replace("%", "")}cqw`, letterSpacing: "-0.06em", textShadow: `0 0 0.4em ${t.glow}` }}
      >
        {text}
      </div>
      {topLeft && (
        <span className="absolute left-[7%] top-[6%] font-poster text-[4cqw] font-extrabold tracking-[0.3em] opacity-85">{topLeft}</span>
      )}
      {bottomRight && (
        <span className="absolute bottom-[6%] right-[7%] font-poster text-[4cqw] font-extrabold tracking-[0.3em] opacity-85">{bottomRight}</span>
      )}
    </div>
  );
}
