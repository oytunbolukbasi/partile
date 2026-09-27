/** Round (person) or squared (host / organisation) initials avatar on a gradient. */
export function Avatar({ initials, gradient, size = 44, square = false, ring, className = "" }: { initials: string; gradient: string; size?: number; square?: boolean; ring?: string; className?: string }) {
  const light = /38BDF8|1D4ED8|FB7185|B91C3C/.test(gradient);
  return (
    <span
      className={`flex shrink-0 items-center justify-center font-extrabold ${square ? "rounded-md" : "rounded-pill"} ${className}`}
      style={{ width: size, height: size, background: gradient, color: light ? "#FFFFFF" : "#0C0C0D", fontSize: Math.round(size * 0.32), boxShadow: ring ? `0 0 0 3px ${ring}` : undefined }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ items, size = 56, ring = "#2A0F08", more }: { items: { initials: string; gradient: string }[]; size?: number; ring?: string; more?: number }) {
  return (
    <div className="flex">
      {items.map((a, i) => (
        <Avatar key={i} {...a} size={size} ring={ring} className={i ? "-ml-3" : ""} />
      ))}
      {more ? (
        <span className="-ml-3 flex items-center justify-center rounded-pill bg-white/14 font-extrabold" style={{ width: size, height: size, boxShadow: `0 0 0 3px ${ring}`, fontSize: Math.round(size * 0.27) }}>
          +{more}
        </span>
      ) : null}
    </div>
  );
}
