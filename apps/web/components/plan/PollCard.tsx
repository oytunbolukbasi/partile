"use client";

import { useEffect, useState } from "react";
import { formatDayShort, formatTime, type PollOption } from "@partile/core";
import { themeById } from "@partile/ui-tokens";
import type { PollVotes } from "@/lib/fixtures";
import { useGuestPoll, type Vote } from "@/lib/guest";

const VOTES: { id: Vote; label: string }[] = [
  { id: "yes", label: "Evet" },
  { id: "maybe", label: "Belki" },
  { id: "no", label: "Hayır" },
];

/** `PollGuest` artboard: one card per candidate date with the tally and a three-way vote. */
export function PollCard({ code, themeId, hostName, options, tally }: { code: string; themeId: string; hostName: string; options: PollOption[]; tally: PollVotes }) {
  const t = themeById(themeId);
  const { votes, save, ready } = useGuestPoll(code);
  const [draft, setDraft] = useState<Record<string, Vote>>({});
  const [editing, setEditing] = useState(false);
  // Seed the working copy from stored votes once they load.
  useEffect(() => {
    if (votes) setDraft(votes);
  }, [votes]);
  const current = draft;
  const complete = options.every((o) => current[o.id]);
  const submitted = !!votes && !editing;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5 rounded-lg border border-white/16 bg-white/10 px-4 py-3.5">
        <span className="text-lg font-bold">Tarih netleşmedi</span>
        <span className="text-sm opacity-85">{hostName} hangi gün olsun diye soruyor — her seçeneğe oy ver</span>
      </div>
      {options.map((o) => {
        const c = tally[o.id] ?? { yes: 0, maybe: 0, no: 0 };
        const mine = current[o.id];
        const tot = Math.max(1, c.yes + c.maybe + c.no + (mine ? 1 : 0));
        const yes = c.yes + (mine === "yes" ? 1 : 0);
        const maybe = c.maybe + (mine === "maybe" ? 1 : 0);
        const no = c.no + (mine === "no" ? 1 : 0);
        return (
          <div key={o.id} className="flex flex-col gap-3 rounded-xl border border-white/14 bg-white/8 px-3.5 pb-3 pt-3.5">
            <div className="flex items-baseline justify-between"><span className="text-[19px] font-bold">{formatDayShort(o.startsAt)}</span><span className="text-sm opacity-80">{formatTime(o.startsAt)}</span></div>
            <div className="flex h-2 overflow-hidden rounded-pill bg-white/12"><span style={{ width: `${Math.round((yes / tot) * 100)}%`, background: t.accent }} /><span className="bg-white/45" style={{ width: `${Math.round((maybe / tot) * 100)}%` }} /></div>
            <div className="flex justify-between text-[13px] opacity-85"><span>{yes} evet · {maybe} belki</span><span>{no} hayır</span></div>
            {!submitted && (
              <div role="radiogroup" aria-label={`${formatDayShort(o.startsAt)} için oyun`} className="grid grid-cols-3 gap-2">
                {VOTES.map((v) => {
                  const on = mine === v.id;
                  return (
                    <button key={v.id} type="button" role="radio" aria-checked={on} onClick={() => setDraft((d) => ({ ...d, [o.id]: v.id }))} className={`h-11 rounded-pill text-sm ${v.id === "yes" ? (on ? "font-extrabold text-[#160804]" : "bg-white/14 font-extrabold") : `border border-white/30 font-bold ${on ? "bg-white/30" : ""}`}`} style={v.id === "yes" && on ? { background: t.accent } : undefined}>
                      {v.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {submitted ? (
        <div className="flex items-center justify-between rounded-lg bg-white/8 px-4 py-3 text-sm"><span>Oyların kaydedildi. Gün seçilince katılıma dönüşür, sana haber veririz.</span><button type="button" onClick={() => setEditing(true)} className="font-bold" style={{ color: t.accent }}>Değiştir</button></div>
      ) : (
        <>
          <button type="button" disabled={!ready || !complete} onClick={() => { save(current); setEditing(false); }} className="h-14 rounded-pill bg-white text-base font-extrabold text-bg disabled:opacity-40">Oyları gönder</button>
          <span className="text-center text-[13px] opacity-75">Gün seçilince oyun otomatik katılıma dönüşür, sana haber veririz.</span>
        </>
      )}
    </div>
  );
}
