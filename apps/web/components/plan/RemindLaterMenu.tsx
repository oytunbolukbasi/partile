"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDayShort, formatTime } from "@partile/core";
import { remindLater, type LaterOption } from "@/app/actions";
import { BellIcon, CloseIcon } from "@/components/shell/icons";
import { routes } from "@/lib/routes";

const HOUR = 3600e3;

/** Mirrors the server rule in `remindLater`: at least an hour from now and an hour before the plan. */
function options(startsAt: string | undefined, now = Date.now()): { id: LaterOption; label: string; at: number }[] {
  const start = startsAt ? new Date(startsAt).getTime() : Infinity;
  const all: { id: LaterOption; label: string; at: number }[] = [
    { id: "tomorrow", label: "Yarın", at: now + 24 * HOUR },
    { id: "in3days", label: "3 gün sonra", at: now + 72 * HOUR },
    ...(startsAt ? [{ id: "dayBefore" as const, label: "Plandan 1 gün önce", at: start - 24 * HOUR }] : []),
  ];
  return all.filter((o) => o.at > now + HOUR && o.at <= start - HOUR).sort((a, b) => a.at - b.at);
}

const when = (ms: number | string) => {
  const iso = typeof ms === "string" ? ms : new Date(ms).toISOString();
  return `${formatDayShort(iso)} · ${formatTime(iso)}`;
};

/** "Sonra hatırlat" chip: one e-mail + notification later, dropped if the viewer answers first. Needs sign-in. */
export function RemindLaterMenu({ code, startsAt, remindAt, signedIn, chipClass }: { code: string; startsAt?: string; remindAt: string | null; signedIn: boolean; chipClass: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const opts = options(startsAt);

  if (!signedIn) {
    return <Link href={`${routes.login}?next=${encodeURIComponent(routes.plan(code))}`} className={chipClass}><BellIcon size={16} /> Sonra hatırlat</Link>;
  }
  if (!remindAt && !opts.length) return null;

  const pick = async (o: LaterOption | null) => {
    setBusy(true);
    setError(null);
    const r = await remindLater(code, o);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setOpen(false);
    router.refresh();
  };
  const item = "flex h-11 w-full items-center justify-between gap-3 rounded-[10px] px-3 text-left text-[15px] font-semibold hover:bg-white/10 disabled:opacity-50";

  return (
    <div className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className={chipClass}>
        <BellIcon size={16} /> {remindAt ? `Hatırlatma: ${when(remindAt)}` : "Sonra hatırlat"}
      </button>
      {open && (
        <>
          <button type="button" aria-label="Menüyü kapat" onClick={() => setOpen(false)} className="fixed inset-0 z-10 cursor-default" />
          <div role="menu" className="glass-menu absolute left-0 top-12 z-20 flex w-[260px] flex-col rounded-xl p-1.5 text-text shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <span className="px-3 pb-1 pt-1.5 text-[12px] leading-snug text-subtle">Tek bir e-posta göndeririz. Önce katılımını bildirirsen gönderilmez.</span>
            {opts.map((o) => (
              <button key={o.id} type="button" role="menuitem" disabled={busy} onClick={() => pick(o.id)} className={item}>
                <span>{o.label}</span><span className="text-[13px] font-medium text-subtle">{when(o.at)}</span>
              </button>
            ))}
            {remindAt && (
              <>
                <span className="mx-2 my-1 h-px bg-white/12" />
                <button type="button" role="menuitem" disabled={busy} onClick={() => pick(null)} className={`${item} justify-start`}><CloseIcon size={16} /> Hatırlatmayı kaldır</button>
              </>
            )}
            {error && <span role="alert" className="px-3 pb-1.5 pt-1 text-[13px] text-coral">{error}</span>}
          </div>
        </>
      )}
    </div>
  );
}
