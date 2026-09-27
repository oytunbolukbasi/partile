"use client";

import Link from "next/link";
import { useState } from "react";
import { formatTime } from "@partile/core";
import { Avatar } from "@/components/plan/Avatar";
import { TabBar } from "@/components/shell/TabBar";
import { BellIcon, CameraIcon, ChatIcon, CheckIcon, CogIcon, CrownIcon, QuestionIcon } from "@/components/shell/icons";
import type { Notification } from "@partile/core";
import { markRead } from "@/app/actions";
import type { Viewer } from "@/lib/auth";
import { routes } from "@/lib/routes";

type Tab = "all" | "host" | "guest";
const BADGE: Record<Notification["kind"], { Icon: typeof CheckIcon; bg: string }> = {
  rsvp: { Icon: CheckIcon, bg: "#1EC9B0" },
  comment: { Icon: ChatIcon, bg: "#FFB020" },
  approval: { Icon: QuestionIcon, bg: "#FFB547" },
  reminder: { Icon: BellIcon, bg: "#F5F2EC" },
  cohost: { Icon: CrownIcon, bg: "#FFB020" },
  album: { Icon: CameraIcon, bg: "#F5F2EC" },
  blast: { Icon: ChatIcon, bg: "#FFB020" },
  message: { Icon: ChatIcon, bg: "#1EC9B0" },
};

const dayKey = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
  return diff <= 0 ? "BUGÜN" : diff === 1 ? "DÜN" : "DAHA ÖNCE";
};
const timeAgo = (iso: string) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 60 ? `${m} dk` : m < 1440 ? `${Math.round(m / 60)} sa` : `dün ${formatTime(iso)}`;
};

/** `Notifications` artboard: 460px drawer on desktop, full screen on mobile. Bugün / Dün groups, event badges, unread marks. */
export function NotificationsPanel({ viewer, items: initial }: { viewer: Viewer; items: Notification[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState(initial);
  const list = items.filter((n) => tab === "all" || n.role === tab);
  const groups = ["BUGÜN", "DÜN", "DAHA ÖNCE"].map((k) => ({ k, rows: list.filter((n) => dayKey(n.at) === k) })).filter((g) => g.rows.length);
  const unread = items.filter((n) => n.unread).length;

  return (
    <div className="fixed inset-y-0 left-0 z-20 flex w-full flex-col border-r border-white/10 bg-panel shadow-[30px_0_80px_rgba(0,0,0,0.5)] md:left-[var(--rail-w)] md:w-[460px]">
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-line px-6">
        <h1 className="text-[22px] font-bold tracking-tight">Bildirimler{unread > 0 && <span className="ml-2 align-middle text-sm font-extrabold text-amber">{unread}</span>}</h1>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => { setItems(items.map((n) => ({ ...n, unread: false }))); markRead(); }} className="h-9 rounded-pill bg-white/8 px-3 text-xs font-bold tracking-wide text-muted">TÜMÜNÜ OKUNDU YAP</button>
          <Link href={routes.profile} aria-label="Bildirim ayarları" className="flex size-9 items-center justify-center rounded-pill bg-white/8 text-muted"><CogIcon size={18} /></Link>
        </div>
      </div>
      <div className="flex gap-1.5 border-b border-line px-6 py-3">
        {([["all", "Tümü"], ["host", "Düzenlediklerim"], ["guest", "Katıldıklarım"]] as [Tab, string][]).map(([id, label]) => (
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)} className={`h-[34px] rounded-pill px-3 text-[13px] ${tab === id ? "border border-white/45 bg-white/14 font-bold text-white" : "bg-white/6 font-semibold"}`}>{label}</button>
        ))}
      </div>
      <div className="flex min-h-0 grow flex-col overflow-y-auto pb-24 md:pb-0">
        {groups.map((g) => (
          <div key={g.k}>
            <div className="px-6 pb-1.5 pt-3.5 text-xs font-extrabold tracking-wide text-subtle">{g.k}</div>
            {g.rows.map((n) => {
              const { Icon, bg } = BADGE[n.kind];
              return (
                <Link key={n.id} href={routes.plan(n.code)} onClick={() => { setItems(items.map((x) => (x.id === n.id ? { ...x, unread: false } : x))); if (n.unread) markRead([n.id]); }} className={`flex items-start gap-3 px-6 py-3 ${n.unread ? "bg-white/5" : ""}`}>
                  <span className="relative shrink-0">
                    <Avatar initials={n.initials} gradient={n.gradient} size={44} />
                    <span className="absolute -bottom-1 -right-1 flex size-[22px] items-center justify-center rounded-pill border-2 border-panel text-bg" style={{ background: bg }}><Icon size={12} strokeWidth={2.4} /></span>
                  </span>
                  <span className="flex grow flex-col gap-0.5"><span className={`text-[15px] leading-snug ${n.unread ? "" : "text-muted"}`}>{n.text}</span><span className="text-xs text-subtle">{timeAgo(n.at)} · {n.kind === "reminder" ? "Hatırlatma" : n.kind === "approval" ? "Onay bekliyor" : n.planTitle}</span></span>
                  {n.unread && <span className="mt-2 size-2 shrink-0 rounded-pill bg-[#FF6A3D]" aria-label="Okunmadı" />}
                </Link>
              );
            })}
          </div>
        ))}
        {list.length === 0 && <p className="px-6 py-10 text-center text-muted">Bildirim yok.</p>}
      </div>
      <div className="mt-auto hidden items-center gap-2 border-t border-line px-6 py-3.5 text-[13px] text-subtle md:flex">Bir planı sessize almak için plan sayfasındaki zil simgesini kullan.</div>
      <TabBar initials={viewer.initials} />
    </div>
  );
}
