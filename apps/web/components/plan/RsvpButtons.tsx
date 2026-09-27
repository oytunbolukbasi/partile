"use client";

import { CheckIcon } from "@/components/shell/icons";

const QuestionIcon = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9.2 9a3 3 0 0 1 5.6 1.2c0 2-2.8 2.4-2.8 4" />
    <path d="M12 18h.01" />
  </svg>
);
const CrossIcon = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M7 7l10 10M17 7L7 17" />
  </svg>
);

/** The three round RSVP buttons: Geliyorum / Belki / Gelemiyorum. Presentational; `size` in px. */
export function RsvpButtons({
  size = 104,
  accentFg = "#160804",
  selected = "going",
  onSelect,
  labels = true,
}: {
  size?: number;
  accentFg?: string;
  selected?: "going" | "maybe" | "no" | null;
  onSelect?: (s: "going" | "maybe" | "no") => void;
  labels?: boolean;
}) {
  const icon = Math.round(size * 0.29);
  const base = "flex shrink-0 flex-col items-center justify-center gap-1 rounded-pill text-[14px] font-bold";
  const glass = "border-[1.5px] border-white/30 bg-white/10 text-current";
  const going = selected === "going";
  return (
    <div className="flex gap-3.5" role={onSelect ? "radiogroup" : undefined} aria-label="Katılım">
      <button
        type="button"
        role={onSelect ? "radio" : undefined}
        aria-checked={onSelect ? going : undefined}
        onClick={() => onSelect?.("going")}
        className={`${base} font-extrabold shadow-[0_16px_40px_rgba(0,0,0,0.4)] ${going ? "" : glass}`}
        style={{
          width: size,
          height: size,
          ...(going ? { background: "radial-gradient(circle at 35% 30%, #FFE3A8 0%, #FFB547 45%, #FF7A3D 100%)", color: accentFg } : {}),
        }}
      >
        <CheckIcon size={icon} />
        {labels && "Geliyorum"}
      </button>
      <button type="button" role={onSelect ? "radio" : undefined} aria-checked={onSelect ? selected === "maybe" : undefined} onClick={() => onSelect?.("maybe")} className={`${base} ${glass}`} style={{ width: size, height: size }}>
        <QuestionIcon size={icon} />
        {labels && "Belki"}
      </button>
      <button type="button" role={onSelect ? "radio" : undefined} aria-checked={onSelect ? selected === "no" : undefined} onClick={() => onSelect?.("no")} className={`${base} ${glass}`} style={{ width: size, height: size }}>
        <CrossIcon size={icon} />
        {labels && "Gelemiyorum"}
      </button>
    </div>
  );
}
