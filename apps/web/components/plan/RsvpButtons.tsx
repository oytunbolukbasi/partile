"use client";

import type { RsvpStyle } from "@partile/core";
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

type Choice = "going" | "maybe" | "no";
const LABEL: Record<Choice, string> = { going: "Geliyorum", maybe: "Belki", no: "Gelemiyorum" };
/** Emoji variant (host's choice; the app shell itself stays emoji-free). */
const EMOJI: Record<Choice, string> = { going: "🎉", maybe: "🤔", no: "😢" };
const GOLD = "radial-gradient(circle at 35% 30%, #FFE3A8 0%, #FFB547 45%, #FF7A3D 100%)";

/**
 * The Geliyorum / Belki / Gelemiyorum choice in the host's chosen style (`RsvpStyles` artboard):
 * `icons` (three round buttons, default), `emoji` (same layout with emoji), `text` (pills), `single` (one big button).
 * Presentational; `size` is the round button size in px.
 */
export function RsvpButtons({
  size = 104,
  accentFg = "#160804",
  selected = "going",
  onSelect,
  labels = true,
  variant = "icons",
  allowMaybe = true,
}: {
  size?: number;
  accentFg?: string;
  selected?: Choice | null;
  onSelect?: (s: Choice) => void;
  labels?: boolean;
  variant?: RsvpStyle;
  allowMaybe?: boolean;
}) {
  const choices: Choice[] = allowMaybe ? ["going", "maybe", "no"] : ["going", "no"];
  const radio = (c: Choice) => ({ role: onSelect ? ("radio" as const) : undefined, "aria-checked": onSelect ? selected === c : undefined, onClick: () => onSelect?.(c) });
  const groupProps = { role: onSelect ? ("radiogroup" as const) : undefined, "aria-label": "Katılım" };
  const glass = "border-[1.5px] border-white/30 bg-white/10 text-current";

  if (variant === "text") {
    const pill = "flex h-12 items-center justify-center rounded-pill text-[15px] font-extrabold";
    return (
      <div {...groupProps} className="flex w-full max-w-[320px] flex-col gap-2">
        <button type="button" {...radio("going")} className={`${pill} shadow-[0_16px_40px_rgba(0,0,0,0.4)]`} style={{ background: GOLD, color: accentFg }}>{LABEL.going}</button>
        <div className="flex gap-2">
          {choices.filter((c) => c !== "going").map((c) => (
            <button key={c} type="button" {...radio(c)} className={`${pill} grow ${glass}`}>{LABEL[c]}</button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "single") {
    return (
      <div {...groupProps} className="flex w-full max-w-[320px] flex-col items-center gap-2.5">
        <button type="button" {...radio("going")} className="flex h-14 w-full items-center justify-center gap-2 rounded-pill text-base font-extrabold shadow-[0_16px_40px_rgba(0,0,0,0.4)]" style={{ background: GOLD, color: accentFg }}>
          <CheckIcon size={20} /> {LABEL.going}
        </button>
        <span className="flex gap-3 text-[13px] font-bold opacity-85">
          {choices.filter((c) => c !== "going").map((c, i) => (
            <span key={c} className="flex gap-3">
              {i > 0 && <span aria-hidden>·</span>}
              <button type="button" {...radio(c)} className="underline-offset-2 hover:underline">{LABEL[c]}</button>
            </span>
          ))}
        </span>
      </div>
    );
  }

  // icons / emoji: round buttons
  const icon = Math.round(size * 0.29);
  const base = "flex shrink-0 flex-col items-center justify-center gap-1 rounded-pill text-[14px] font-bold";
  const face = (c: Choice) => (variant === "emoji" ? <span style={{ fontSize: Math.round(size * 0.3), lineHeight: 1 }} aria-hidden>{EMOJI[c]}</span> : c === "going" ? <CheckIcon size={icon} /> : c === "maybe" ? <QuestionIcon size={icon} /> : <CrossIcon size={icon} />);
  return (
    <div {...groupProps} className="flex gap-3.5">
      {choices.map((c) => {
        const on = c === "going" && selected === "going";
        return (
          <button
            key={c}
            type="button"
            {...radio(c)}
            className={`${base} ${c === "going" ? "font-extrabold shadow-[0_16px_40px_rgba(0,0,0,0.4)]" : ""} ${on ? "" : glass}`}
            style={{ width: size, height: size, ...(on ? { background: GOLD, color: accentFg } : {}) }}
          >
            {face(c)}
            {labels && LABEL[c]}
          </button>
        );
      })}
    </div>
  );
}
