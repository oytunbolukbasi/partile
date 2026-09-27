"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { initials as toInitials } from "@partile/core";
import { completeOnboarding } from "@/app/actions";
import { MarkTile, Wordmark } from "@/components/brand/Mark";
import { CameraIcon } from "@/components/shell/icons";
import { Toggle } from "@/components/ui/Toggle";
import type { Viewer } from "@/lib/auth";
import { routes } from "@/lib/routes";

/** `Onboarding` artboard: first sign-in only — name, optional photo, optional birthday (day/month), notifications. */
export function Onboarding({ viewer, next }: { viewer: Viewer; next?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState(viewer.name);
  const [birthday, setBirthday] = useState(viewer.birthday ?? "");
  const [notif, setNotif] = useState(viewer.notifications);
  const [err, setErr] = useState<string | null>(null);

  const begin = () => {
    if (name.trim().length < 2) return setErr("Adını yaz.");
    if (birthday && !/^(0[1-9]|[12]\d|3[01]) ?\/ ?(0[1-9]|1[0-2])$/.test(birthday.trim())) return setErr("Doğum günü GG / AA biçiminde olmalı.");
    setErr(null);
    start(async () => {
      await completeOnboarding({ name, birthday: birthday.trim() || undefined, notifications: notif });
      router.push(next || routes.home);
      router.refresh();
    });
  };

  const input = "h-14 w-full rounded-lg border border-white/20 bg-white/6 px-4 text-lg font-bold outline-none placeholder:text-subtle focus:border-white/40";
  const ini = name.trim() ? toInitials(name) : "?";

  return (
    <main className="relative flex min-h-dvh justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 aura-top" aria-hidden />
      <div className="relative flex w-full max-w-[430px] flex-col gap-6 px-5 pb-6 pt-14">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><MarkTile size={32} /><Wordmark size={20} /></span>
          <span className="text-xs font-extrabold tracking-wide text-subtle">ADIM 1 / 1</span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="display text-[34px] leading-[1.05] tracking-tight">Seni nasıl<br />çağıralım?</h1>
          <p className="text-muted">Adın ve fotoğrafın katılımcı listesinde görünür.</p>
        </div>
        <div className="flex flex-col items-center gap-2.5">
          <span className="display relative flex size-[132px] items-center justify-center rounded-pill text-[44px] tracking-normal text-bg shadow-[0_20px_50px_rgba(0,0,0,0.5)]" style={{ background: "linear-gradient(135deg, #1EC9B0, #FFB020)" }}>
            {ini}
            <button type="button" aria-label="Fotoğraf ekle" title="Yakında" className="absolute -right-0.5 bottom-0.5 flex size-11 items-center justify-center rounded-pill border-[3px] border-bg bg-white text-bg"><CameraIcon size={20} /></button>
          </span>
          <span className="text-[13px] text-subtle">Fotoğraf eklemezsen baş harflerin görünür</span>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold">Ad Soyad</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} placeholder="Ad Soyad" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold">Doğum günü <span className="font-medium text-subtle">(isteğe bağlı)</span></span>
          <input value={birthday} onChange={(e) => setBirthday(e.target.value)} inputMode="numeric" placeholder="GG / AA" className={input} />
          <span className="text-xs text-subtle">Zamanı gelince plan fikirleri gönderelim. Yılını istemiyoruz.</span>
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/6 px-3.5 py-3">
          <span className="grow text-sm">Katılım ve hatırlatma bildirimleri</span>
          <Toggle checked={notif} onChange={setNotif} label="Bildirimler" />
        </div>
        {err && <p className="text-sm font-bold text-[#FF8C6B]">{err}</p>}
        <button type="button" onClick={begin} disabled={pending} className="mt-auto h-14 rounded-pill bg-white text-base font-extrabold text-bg disabled:opacity-60">Başlayalım</button>
      </div>
    </main>
  );
}
