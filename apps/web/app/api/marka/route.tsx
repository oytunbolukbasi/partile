import { ImageResponse } from "next/og";

export const runtime = "nodejs";

/**
 * partile mark on the aura tile as a PNG (96×96) — for e-mail headers, where SVG is not rendered.
 * Same construction as `MarkTile` (solid bowl + check). Immutable: cache hard.
 */
export async function GET() {
  const size = 96;
  const res = new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 29,
          backgroundColor: "#0C0C0D",
          backgroundImage: "radial-gradient(circle at 25% 20%, rgba(255,106,61,1) 0%, rgba(255,106,61,0) 55%), radial-gradient(circle at 85% 30%, rgba(255,176,32,1) 0%, rgba(255,176,32,0) 50%)",
        }}
      >
        <svg width={76} height={76} viewBox="0 0 200 200">
          <rect x="40" y="42" width="44" height="130" rx="22" fill="#FFFFFF" />
          <circle cx="118" cy="92" r="72" fill="#FFFFFF" />
          <path d="M100 93l13 13 26-28" fill="none" stroke="#0C0C0D" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
  res.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return res;
}
