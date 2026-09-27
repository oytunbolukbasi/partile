import type { CSSProperties } from "react";
import type { TitleFontId } from "@partile/ui-tokens";

/** Inline style for an invitation title font id (see ui-tokens `titleFonts`). */
export function titleFontStyle(id: TitleFontId | string): CSSProperties {
  switch (id) {
    case "eklektik":
      return { fontFamily: "var(--font-fraunces)", fontWeight: 800, letterSpacing: "-0.02em" };
    case "sik":
      return { fontFamily: "var(--font-pinyon)", fontWeight: 400 };
    case "edebi":
      return { fontFamily: "var(--font-baskerville)", fontWeight: 700 };
    case "dijital":
      return { fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase" };
    case "zarif":
      return { fontFamily: "var(--font-cormorant)", fontWeight: 400, fontStyle: "italic" };
    default:
      return { fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.03em" };
  }
}
