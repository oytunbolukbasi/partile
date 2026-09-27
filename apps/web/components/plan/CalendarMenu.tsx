"use client";

import { useState } from "react";
import { CalendarIcon, ChevronDownIcon, DownloadIcon } from "@/components/shell/icons";
import { googleCalendarUrl, type CalendarPlan } from "@/lib/calendar";

/** "Takvime ekle" glass menu: Google Takvim link, `.ics` for Apple / Outlook. Hidden when the plan has no date. */
export function CalendarMenu({ plan, full = true, className, variant = "chip" }: { plan: CalendarPlan; full?: boolean; className?: string; variant?: "chip" | "card" }) {
  const [open, setOpen] = useState(false);
  if (!plan.startsAt) return null;
  const google = googleCalendarUrl(plan, full)!;
  const ics = `/api/takvim/${plan.code}`;
  const item = "flex h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] font-semibold hover:bg-white/10";
  const menu = open && (
    <>
      <button type="button" aria-label="Menüyü kapat" onClick={() => setOpen(false)} className="fixed inset-0 z-10 cursor-default" />
      <div role="menu" className="glass-menu absolute left-0 top-12 z-20 flex w-[240px] flex-col rounded-xl p-1.5 text-text shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        <a role="menuitem" href={google} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className={item}><CalendarIcon size={18} className="text-muted" /> Google Takvim</a>
        <a role="menuitem" href={ics} onClick={() => setOpen(false)} className={item}><DownloadIcon size={18} className="text-muted" /> Apple · Outlook (.ics)</a>
        <span className="px-3 pb-1.5 pt-1 text-[11px] leading-snug text-subtle">Etkinlikten 2 saat önce hatırlatma ile</span>
      </div>
    </>
  );

  if (variant === "card") {
    return (
      <div className={`relative ${className ?? ""}`}>
        <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="glass flex w-full items-center gap-3 rounded-xl p-4 text-left">
          <span className="flex size-11 items-center justify-center rounded-md bg-ink/10"><CalendarIcon /></span>
          <span className="flex grow flex-col"><span className="text-[15px] font-bold">Takvime ekle</span><span className="text-[13px] opacity-80">Google · Apple · .ics</span></span>
          <ChevronDownIcon size={16} className="opacity-70" />
        </button>
        {menu}
      </div>
    );
  }
  return (
    <div className={`relative ${className ?? ""}`}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="flex h-10 items-center gap-2 rounded-pill border border-ink/28 bg-ink/8 px-4 text-sm font-bold"><CalendarIcon size={16} /> Takvime ekle</button>
      {menu}
    </div>
  );
}
