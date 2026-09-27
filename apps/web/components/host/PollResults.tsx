"use client";

import { formatDayShort, formatTime, type PollOption } from "@partile/core";
import { themeById } from "@partile/ui-tokens";
import type { PollVotes } from "@partile/core";

/** Host side of the date poll: tallies per option and "pick this day" (votes → RSVPs). */
export function PollResults({ themeId, options, tally, onPick, onEdit }: { themeId: string; options: PollOption[]; tally: PollVotes; onPick: (o: PollOption) => void; onEdit: () => void }) {
  const t = themeById(themeId);
  const best = options.reduce<{ id: string; yes: number } | null>((acc, o) => ((tally[o.id]?.yes ?? 0) > (acc?.yes ?? -1) ? { id: o.id, yes: tally[o.id]?.yes ?? 0 } : acc), null);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5"><span className="display text-[32px] tracking-tight">Tarih netleşmedi</span><span className="text-base opacity-85">Misafirler oy veriyor · günü seçince oylar katılıma dönüşür</span></div>
        <button type="button" onClick={onEdit} className="flex h-10 items-center rounded-pill border border-white/35 bg-white/8 px-4 text-sm font-bold">Düzenle</button>
      </div>
      {options.map((o) => {
        const c = tally[o.id] ?? { yes: 0, maybe: 0, no: 0 };
        const tot = Math.max(1, c.yes + c.maybe + c.no);
        const lead = best?.id === o.id;
        return (
          <div key={o.id} className={`flex flex-col gap-2.5 rounded-xl border px-3.5 py-3 ${lead ? "border-[rgba(255,181,71,0.5)] bg-[rgba(255,181,71,0.12)]" : "border-white/14 bg-white/8"}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="flex flex-col"><span className="text-[17px] font-bold">{formatDayShort(o.startsAt)} · {formatTime(o.startsAt)}</span><span className="text-[13px] opacity-80">{c.yes} evet · {c.maybe} belki · {c.no} hayır{lead ? " · en çok oy" : ""}</span></span>
              <button type="button" onClick={() => onPick(o)} className={`h-9 shrink-0 rounded-pill px-3.5 text-[13px] font-extrabold ${lead ? "text-[#160804]" : "border border-white/35 bg-white/8"}`} style={lead ? { background: t.accent } : undefined}>Bu günü seç</button>
            </div>
            <div className="flex h-2 overflow-hidden rounded-pill bg-white/12"><span style={{ width: `${Math.round((c.yes / tot) * 100)}%`, background: t.accent }} /><span className="bg-white/45" style={{ width: `${Math.round((c.maybe / tot) * 100)}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}
