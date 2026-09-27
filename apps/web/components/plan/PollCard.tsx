"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatDayShort, formatTime, type PollOption, type PollVotes } from "@partile/core";
import { themeById } from "@partile/ui-tokens";
import { requestCode, submitVotes, verifyCode } from "@/app/actions";
import { CodeBoxes, maskEmail } from "@/components/auth/LoginForm";
import type { Viewer } from "@/lib/auth";

export type Vote = "yes" | "maybe" | "no";
const VOTES: { id: Vote; label: string }[] = [
  { id: "yes", label: "Evet" },
  { id: "maybe", label: "Belki" },
  { id: "no", label: "Hayır" },
];

/** `PollGuest` artboard: one card per candidate date with the tally and a three-way vote. Signed-out guests verify their e-mail first. */
export function PollCard({ code, themeId, hostName, options, tally, viewer, existing }: { code: string; themeId: string; hostName: string; options: PollOption[]; tally: PollVotes; viewer: Viewer | null; existing: Record<string, Vote> | null }) {
  const t = themeById(themeId);
  const router = useRouter();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<Record<string, Vote>>(existing ?? {});
  const [editing, setEditing] = useState(false);
  const [gate, setGate] = useState<"name" | "code" | null>(null);
  const [name, setName] = useState(viewer?.name ?? "");
  const [email, setEmail] = useState(viewer?.email ?? "");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [devCode, setDevCode] = useState<string | undefined>();
  const [err, setErr] = useState<string | null>(null);
  const complete = options.every((o) => draft[o.id]);
  const submitted = !!existing && !editing;

  const send = () =>
    start(async () => {
      const r = await submitVotes(code, name, draft);
      if (!r.ok) return setErr(r.error);
      setErr(null);
      setGate(null);
      setEditing(false);
      router.refresh();
    });
  const beginGate = () => {
    if (viewer) return send();
    setGate("name");
  };
  const askCode = () =>
    start(async () => {
      if (!name.trim()) return setErr("Adını yaz.");
      const r = await requestCode(email, "rsvp");
      if (!r.ok) return setErr(r.error);
      setErr(null);
      setDevCode(r.devCode);
      setGate("code");
    });
  const verify = () =>
    start(async () => {
      const r = await verifyCode(email, digits.join(""));
      if (!r.ok) return setErr(r.error);
      send();
    });

  const input = "h-12 w-full rounded-lg border border-white/25 bg-white/10 px-4 text-base font-semibold outline-none placeholder:opacity-60";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5 rounded-lg border border-white/16 bg-white/10 px-4 py-3.5">
        <span className="text-lg font-bold">Tarih netleşmedi</span>
        <span className="text-sm opacity-85">{hostName} hangi gün olsun diye soruyor — her seçeneğe oy ver</span>
      </div>
      {options.map((o) => {
        const c = tally[o.id] ?? { yes: 0, maybe: 0, no: 0 };
        const mine = draft[o.id];
        const prev = existing?.[o.id];
        // Show the tally as it will be with this guest's current choice.
        const adj = (v: Vote) => c[v] - (prev === v ? 1 : 0) + (mine === v ? 1 : 0);
        const yes = adj("yes"), maybe = adj("maybe"), no = adj("no");
        const tot = Math.max(1, yes + maybe + no);
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
      ) : gate === "name" ? (
        <div className="flex flex-col gap-2.5 rounded-xl border border-white/16 bg-white/10 p-4">
          <span className="font-bold">Oyunu kaydetmek için adın ve e-postan yeter</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" autoComplete="name" className={input} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ad@ornek.com" type="email" inputMode="email" autoComplete="email" className={input} />
          {err && <p className="text-sm font-bold" style={{ color: t.accent }}>{err}</p>}
          <button type="button" onClick={askCode} disabled={pending} className="h-12 rounded-pill bg-white text-[15px] font-extrabold text-bg disabled:opacity-60">Kodu gönder</button>
        </div>
      ) : gate === "code" ? (
        <div className="flex flex-col items-center gap-2.5 rounded-xl border border-white/16 bg-white/10 p-4">
          <span className="text-center text-sm"><strong>{maskEmail(email)}</strong> adresine kod gönderdik.</span>
          <CodeBoxes value={digits} onChange={setDigits} onEnter={verify} size="sm" />
          {devCode && <span className="text-center text-xs opacity-85">Geliştirme: kodun <strong className="display text-base tracking-[0.2em]">{devCode}</strong></span>}
          {err && <p className="text-sm font-bold" style={{ color: t.accent }}>{err}</p>}
          <button type="button" onClick={verify} disabled={pending} className="h-12 w-full rounded-pill bg-white text-[15px] font-extrabold text-bg disabled:opacity-60">Doğrula ve oyları gönder</button>
        </div>
      ) : (
        <>
          <button type="button" disabled={!complete || pending} onClick={beginGate} className="h-14 rounded-pill bg-white text-base font-extrabold text-bg disabled:opacity-40">Oyları gönder</button>
          <span className="text-center text-[13px] opacity-75">Gün seçilince oyun otomatik katılıma dönüşür, sana haber veririz.</span>
        </>
      )}
    </div>
  );
}
