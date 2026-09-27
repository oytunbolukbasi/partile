/**
 * partile mark: "p" with a check inside the bowl. Flat version for product UI.
 * `solid` closes the bowl (for ≤32 px). See LogoFinal artboard for the construction.
 */
export function Mark({ size = 28, color = "#FFFFFF", hole = "#0C0C0D", solid = false }: { size?: number; color?: string; hole?: string; solid?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <rect x="40" y="42" width="44" height="130" rx="22" fill={color} />
      {solid ? (
        <>
          <circle cx="118" cy="92" r="72" fill={color} />
          <path d="M100 93l13 13 26-28" fill="none" stroke={hole} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <circle cx="118" cy="92" r="50" fill="none" stroke={color} strokeWidth="44" />
          <circle cx="118" cy="92" r="28" fill={hole} />
          <path d="M104 93l10 10 20-22" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

/** Mark on the aura tile, as used in the rail and public header. */
export function MarkTile({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        background:
          "radial-gradient(70% 70% at 25% 20%, #FF6A3D 0%, rgba(255,106,61,0) 70%), radial-gradient(60% 60% at 85% 30%, #FFB020 0%, rgba(255,176,32,0) 70%), #0C0C0D",
      }}
    >
      <Mark size={Math.round(size * 0.78)} solid={size <= 32} />
    </span>
  );
}

export function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <span className="display" style={{ fontSize: size }}>
      partile
    </span>
  );
}
