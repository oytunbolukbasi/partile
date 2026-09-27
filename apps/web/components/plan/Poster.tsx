import { themeById } from "@partile/ui-tokens";
import type { CSSProperties } from "react";

/**
 * Square poster placeholder for a plan without an uploaded image:
 * theme gradient + big numeral/word + corner labels. Sized by the parent.
 */
export function Poster({
  themeId = "kor",
  text = "30",
  src,
  topLeft,
  bottomRight,
  className = "",
  style,
  numeralSize = "50%",
}: {
  themeId?: string;
  text?: string;
  /** Uploaded image; when set it replaces the generated numeral. */
  src?: string;
  topLeft?: string;
  bottomRight?: string;
  className?: string;
  style?: CSSProperties;
  /** Font size of the numeral relative to the poster width. */
  numeralSize?: string;
}) {
  const t = themeById(themeId);
  // Numerals get the big size; words scale down with length (longest line counts).
  const longest = Math.max(...text.split("\n").map((l) => l.length));
  const size = /^\d+$/.test(text) ? numeralSize : longest <= 4 ? "34%" : longest <= 7 ? "22%" : "15%";
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-md ${className}`}
      style={{ background: t.poster, color: t.fg, containerType: "inline-size", ...style }}
      aria-hidden
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      )}
      {!src && (
      <div
        className="absolute inset-0 flex items-center justify-center whitespace-pre-line text-center font-poster font-extrabold leading-none"
        style={{ fontSize: `${size.replace("%", "")}cqw`, letterSpacing: "-0.06em", textShadow: `0 0 0.4em ${t.glow}` }}
      >
        {text}
      </div>
      )}
      {topLeft && (
        <span className="absolute left-[7%] top-[6%] font-poster text-[4cqw] font-extrabold tracking-[0.3em] opacity-85">{topLeft}</span>
      )}
      {bottomRight && (
        <span className="absolute bottom-[6%] right-[7%] font-poster text-[4cqw] font-extrabold tracking-[0.3em] opacity-85">{bottomRight}</span>
      )}
    </div>
  );
}
