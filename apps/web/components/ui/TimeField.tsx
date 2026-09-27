"use client";

import { ChevronDownIcon } from "@/components/shell/icons";

const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

/** 24-hour time picker (`20:00`) — native `<input type="time">` follows the browser locale and shows AM/PM. */
export function TimeField({ value, onChange, label, size = "md" }: { value: string; onChange: (v: string) => void; label: string; size?: "md" | "sm" }) {
  const [h = "20", m = "00"] = value.split(":");
  const box = size === "md" ? "h-[52px] text-xl" : "h-11 text-base";
  const select = `appearance-none bg-transparent pr-6 font-extrabold text-text outline-none [color-scheme:dark] ${box}`;
  const wrap = `relative flex items-center rounded-md border border-white/18 bg-white/6 px-3 focus-within:border-white/40 ${box}`;
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <label className={wrap}>
        <span className="sr-only">{label} saat</span>
        <select value={h} onChange={(e) => onChange(`${e.target.value}:${m}`)} className={select}>
          {HOURS.map((x) => <option key={x} value={x} className="bg-panel text-text">{x}</option>)}
        </select>
        <ChevronDownIcon size={14} className="pointer-events-none absolute right-2 text-subtle" />
      </label>
      <span className="font-extrabold text-subtle">:</span>
      <label className={wrap}>
        <span className="sr-only">{label} dakika</span>
        <select value={MINUTES.includes(m) ? m : "00"} onChange={(e) => onChange(`${h}:${e.target.value}`)} className={select}>
          {MINUTES.map((x) => <option key={x} value={x} className="bg-panel text-text">{x}</option>)}
        </select>
        <ChevronDownIcon size={14} className="pointer-events-none absolute right-2 text-subtle" />
      </label>
    </div>
  );
}
