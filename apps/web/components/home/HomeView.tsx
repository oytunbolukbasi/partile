"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPill, rsvpLabel, type PlanDraft } from "@partile/core";
import { MarkTile, Wordmark } from "@/components/brand/Mark";
import { Avatar } from "@/components/plan/Avatar";
import { Poster } from "@/components/plan/Poster";
import { TabBar } from "@/components/shell/TabBar";
import { BellIcon, BellOffIcon, CalendarIcon, CopyIcon, MenuIcon, MoreIcon, PencilIcon, PlusIcon, SearchIcon, ShareIcon, UsersIcon } from "@/components/shell/icons";
import { countByStatus, me, myPlans, type Plan, type PlanRole } from "@/lib/fixtures";
import { loadDraft } from "@/lib/draft";
import { routes } from "@/lib/routes";

type Tab = "upcoming" | "hosting" | "attending" | "drafts";
const TABS: { id: Tab; label: string }[] = [
  { id: "upcoming", label: "Yaklaşan" },
  { id: "hosting", label: "Düzenlediklerim" },
  { id: "attending", label: "Katıldıklarım" },
  { id: "drafts", label: "Taslaklar" },
];

const badge = (role: PlanRole) => (role === "host" ? "DÜZENLİYORSUN" : rsvpLabel[role].toLocaleUpperCase("tr-TR"));
const chip = (on: boolean) => `flex h-11 shrink-0 items-center gap-2 rounded-pill px-4 text-[15px] ${on ? "border border-white/45 bg-white/14 font-bold text-white" : "bg-white/10 font-semibold text-text hover:bg-white/14"}`;

/** `Home` / `HomeMobile`: greeting, filter chips, plan cards with a per-card menu, drafts, cards & mutuals. */
export function HomeView() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [menu, setMenu] = useState<string | null>(null);
  const [draft, setDraft] = useState<(PlanDraft & { touched: boolean }) | null>(null);
  useEffect(() => setDraft(loadDraft()), []);

  const all = myPlans();
  const now = Date.now();
  const upcoming = all.filter((x) => !x.plan.startsAt || new Date(x.plan.startsAt).getTime() > now);
  const hosting = all.filter((x) => x.role === "host");
  const attending = all.filter((x) => x.role !== "host" && x.role !== "no");
  const drafts = draft?.touched ? [draft] : [];
  const counts: Record<Tab, number> = { upcoming: upcoming.length, hosting: hosting.length, attending: attending.length, drafts: drafts.length };
  const list = tab === "upcoming" ? upcoming : tab === "hosting" ? hosting : tab === "attending" ? attending : [];
  const thisWeek = upcoming.filter((x) => x.plan.startsAt && new Date(x.plan.startsAt).getTime() - now < 7 * 864e5).length;

  return (
    <main className="relative min-h-dvh overflow-x-hidden pb-28 md:pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] aura-top md:h-[520px]" aria-hidden />

      {/* Mobile header */}
      <header className="relative flex h-16 items-center justify-between px-4 md:hidden">
        <Link href={routes.home} className="flex items-center gap-2"><MarkTile size={32} /><Wordmark size={22} /></Link>
        <div className="flex gap-2">
          <Link href="#" aria-label="Bildirimler" className="flex size-10 items-center justify-center rounded-pill bg-white/10"><BellIcon size={20} /></Link>
          <Link href={routes.create} className="flex h-10 items-center rounded-pill bg-white px-4 text-sm font-bold text-bg">Oluştur</Link>
        </div>
      </header>
      {/* Desktop top-right */}
      <div className="absolute right-10 top-[18px] hidden items-center gap-2.5 md:flex">
        <Link href={routes.create} className="flex h-11 items-center gap-2 rounded-pill bg-white px-5 text-[15px] font-bold text-bg"><PlusIcon size={16} strokeWidth={2.6} /> Oluştur</Link>
        <button type="button" aria-label="Menü" className="flex size-11 items-center justify-center text-text"><MenuIcon /></button>
      </div>

      <div className="relative flex flex-col gap-5 px-4 pt-6 md:gap-8 md:px-14 md:pt-28">
        <div className="flex flex-col gap-1.5 md:gap-2.5">
          <h1 className="display text-[38px] leading-none tracking-[-0.037em] md:text-[64px] md:tracking-[-0.03em]">Hoş geldin {me.name}!</h1>
          <p className="text-base text-muted md:text-xl">
            {thisWeek ? <>Bu hafta <strong className="text-text">{thisWeek} planın</strong> var.</> : upcoming.length ? <>Yaklaşan <strong className="text-text">{upcoming.length} planın</strong> var.</> : <>Henüz planın yok — ilkini oluştur.</>}
          </p>
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0">
          <button type="button" aria-label="Ara" className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-white/10 md:w-auto md:gap-2 md:px-4 md:text-[15px] md:font-semibold"><SearchIcon /><span className="hidden md:inline">Ara</span></button>
          {TABS.map((t) => (
            <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)} className={chip(tab === t.id)}>
              {t.label} <span className={`font-medium ${tab === t.id ? "text-muted" : "text-subtle"}`}>{counts[t.id]}</span>
            </button>
          ))}
        </div>

        {tab !== "drafts" && (
          <div className="flex flex-col gap-5 md:flex-row md:flex-wrap md:gap-10">
            {list.map(({ plan, role }, i) => (
              <PlanCard key={plan.code} plan={plan} role={role} compact={i > 0} menuOpen={menu === plan.code} onMenu={() => setMenu(menu === plan.code ? null : plan.code)} onClose={() => setMenu(null)} />
            ))}
            {list.length === 0 && <p className="py-10 text-lg text-muted">Burada henüz bir şey yok.</p>}
            <Link href={routes.create} className="hidden h-[300px] w-[300px] flex-col items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-white/35 text-base font-bold md:flex">
              <span className="flex size-12 items-center justify-center rounded-pill bg-white/10"><PlusIcon size={22} /></span>Yeni plan
            </Link>
          </div>
        )}

        {(tab === "drafts" || (tab === "upcoming" && drafts.length > 0)) && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-lg font-bold md:text-2xl md:tracking-tight">Taslaklar</h2>
            {drafts.length === 0 && <p className="py-6 text-lg text-muted">Taslak yok. Bir plan oluşturmaya başlarsan burada bekler.</p>}
            {drafts.map((d, i) => (
              <Link key={i} href={routes.create} className="flex items-center gap-3 rounded-xl border border-dashed border-white/25 p-3 md:max-w-[640px]">
                <Poster themeId={d.themeId} text={d.posterText ?? ""} src={d.posterUrl} className="w-[52px] shrink-0 rounded-[10px]" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-bold">{d.title || "Adsız plan"}</span>
                  <span className="text-[13px] text-subtle">{d.startsAt ? formatPill(d.startsAt) : "Tarih yok"} · taslak</span>
                </span>
                <span className="ml-auto shrink-0 text-[13px] font-bold text-amber">Devam et →</span>
              </Link>
            ))}
          </section>
        )}

        <div className="grid gap-6 pt-2 md:grid-cols-2 md:gap-10">
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold md:text-2xl md:tracking-tight">Kartların</h2>
            <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/6 p-4 md:p-5">
              <div className="flex size-[72px] shrink-0 -rotate-6 items-center justify-center rounded-xl text-center font-poster text-[11px] font-extrabold leading-[1.3] tracking-wider text-bg md:size-24 md:text-xs" style={{ background: "linear-gradient(160deg, #FFB020, #FF6A3D)" }}>İYİ Kİ<br />DOĞDUN</div>
              <div className="flex grow flex-col gap-1.5"><div className="text-[17px] font-bold md:text-lg">Dijital kart gönder</div><div className="text-sm text-muted md:text-[15px]">Doğum günü, kutlama, teşekkür — davetiye gerektirmeyen her şey için.</div></div>
              <span className="hidden h-10 shrink-0 items-center rounded-pill bg-white px-4 text-sm font-bold text-bg md:flex">+ Yeni kart</span>
            </div>
          </section>
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold md:text-2xl md:tracking-tight">Ortak arkadaşlar</h2>
            <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/6 p-4 md:p-5">
              <div className="flex shrink-0">
                {["#1EC9B0,#0E7C86", "#FFD166,#FF6A3D", "#F59E0B,#C2410C"].map((c, i) => (
                  <span key={c} className={`size-11 rounded-pill border-2 border-panel ${i ? "-ml-3.5" : ""}`} style={{ background: `linear-gradient(135deg, ${c})` }} />
                ))}
              </div>
              <div className="flex grow flex-col gap-1.5"><div className="text-[17px] font-bold md:text-lg">Birlikte eğlendiğin 14 kişi</div><div className="text-sm text-muted md:text-[15px]">Bir sonraki planına doğrudan buradan davet et.</div></div>
              <span className="hidden h-10 shrink-0 items-center rounded-pill border border-white/30 px-4 text-sm font-bold md:flex">Tümünü gör</span>
            </div>
          </section>
        </div>
      </div>
      <TabBar initials={me.initials} />
    </main>
  );
}

function PlanCard({ plan, role, compact, menuOpen, onMenu, onClose }: { plan: Plan; role: PlanRole; compact: boolean; menuOpen: boolean; onMenu: () => void; onClose: () => void }) {
  const href = routes.plan(plan.code);
  const c = countByStatus(plan.guests);
  const hostLabel = plan.hosts.map((h) => (h.id === me.id ? "Sen" : h.name)).join(" & ");
  const menuItems = role === "host"
    ? [
        { label: "Düzenle", href: routes.create, Icon: PencilIcon },
        { label: "Paylaş", href: "#", Icon: ShareIcon },
        { label: "Katılımcılar", href: "#", Icon: UsersIcon },
        { label: "Takvime ekle", href: "#", Icon: CalendarIcon },
        { label: "Kopyala (yeni plan)", href: routes.create, Icon: CopyIcon },
        { label: "Sessize al", href: "#", Icon: BellOffIcon },
      ]
    : [
        { label: "Katılımı değiştir", href, Icon: PencilIcon },
        { label: "Paylaş", href: "#", Icon: ShareIcon },
        { label: "Takvime ekle", href: "#", Icon: CalendarIcon },
        { label: "Sessize al", href: "#", Icon: BellOffIcon },
      ];

  const menuEl = menuOpen && (
    <>
      <button type="button" aria-label="Menüyü kapat" onClick={onClose} className="fixed inset-0 z-10 cursor-default" />
      <div role="menu" className="glass-menu absolute right-2 top-12 z-20 flex w-[220px] flex-col rounded-xl p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        {menuItems.map(({ label, href: h, Icon }) => (
          <Link key={label} href={h} role="menuitem" onClick={onClose} className="flex h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] font-semibold hover:bg-white/10"><Icon size={18} className="text-muted" />{label}</Link>
        ))}
        {role === "host" && (
          <>
            <span className="mx-2 my-1 h-px bg-white/12" />
            <button type="button" role="menuitem" onClick={onClose} className="flex h-11 items-center gap-3 rounded-[10px] px-3 text-left text-[15px] font-bold text-[#FF8C6B] hover:bg-white/10">Planı iptal et</button>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className={`relative ${compact ? "md:w-[300px]" : "w-full md:w-[300px]"}`}>
      {/* Mobile compact row for non-first cards */}
      {compact && (
        <Link href={href} className="flex items-center gap-3.5 rounded-xl border border-white/8 bg-white/5 p-3 md:hidden">
          <Poster themeId={plan.themeId} text={plan.posterText ?? ""} src={plan.posterUrl} className="w-[84px] shrink-0 rounded-[12px]" />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs font-bold text-[#1EC9B0]">{badge(role)}{plan.startsAt && ` · ${formatPill(plan.startsAt)}`}</span>
            <span className="truncate text-[17px] font-bold tracking-tight">{plan.title}</span>
            <span className="text-[13px] text-subtle">{hostLabel}</span>
          </span>
        </Link>
      )}
      <div className={`${compact ? "hidden md:flex" : "flex"} flex-col gap-2.5 md:gap-3`}>
        <div className="relative">
          <Link href={href} aria-label={plan.title} className="block">
            <Poster themeId={plan.themeId} text={plan.posterText ?? ""} src={plan.posterUrl} className="w-full rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.45)]" />
          </Link>
          {plan.startsAt && <span className="pointer-events-none absolute left-2.5 top-2.5 flex h-[30px] items-center rounded-pill bg-bg/70 px-3 text-[13px] font-bold text-white">{formatPill(plan.startsAt)}</span>}
          <button type="button" aria-haspopup="menu" aria-expanded={menuOpen} aria-label="Plan menüsü" onClick={onMenu} className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-pill bg-bg/70 text-white"><MoreIcon size={16} /></button>
          <span className="pointer-events-none absolute bottom-0 right-0 flex h-10 items-center rounded-tl-xl bg-bg px-3.5 text-[13px] font-extrabold tracking-wide text-white">{badge(role)}</span>
          {menuEl}
        </div>
        <Link href={href} className="flex flex-col gap-1.5">
          <span className="text-xl font-bold tracking-tight">{plan.title}</span>
          <span className="hidden items-center gap-2 text-[15px] text-muted md:flex">
            Düzenleyen <Avatar initials={plan.hosts[0]!.initials} gradient={plan.hosts[0]!.gradient} size={24} /> <span className="font-semibold text-text">{hostLabel}</span>
          </span>
          <span className="text-sm text-muted md:hidden">{c.going} geliyor · {c.maybe} belki{plan.requireApproval ? ` · ${c.pending} onay bekliyor` : ""}</span>
        </Link>
      </div>
    </div>
  );
}
