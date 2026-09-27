"use client";

import Link from "next/link";
import { useState } from "react";
import { countByStatus, formatDayShort, formatTime, type Plan } from "@partile/core";
import { Avatar } from "@/components/plan/Avatar";
import { Poster } from "@/components/plan/Poster";
import { TabBar } from "@/components/shell/TabBar";
import { PlusIcon } from "@/components/shell/icons";
import { routes } from "@/lib/routes";

/** Istanbul's Anatolian-side districts; everything else in Istanbul counts as the European side. */
const ANADOLU = ["kadıköy", "üsküdar", "ataşehir", "maltepe", "kartal", "pendik", "tuzla", "beykoz", "ümraniye", "çekmeköy", "sancaktepe", "sultanbeyli", "şile", "adalar"];
type City = "ist-anadolu" | "ist-avrupa" | "ankara" | "izmir";
const CITIES: { id: City; label: string }[] = [
  { id: "ist-anadolu", label: "İstanbul · Anadolu" },
  { id: "ist-avrupa", label: "İstanbul · Avrupa" },
  { id: "ankara", label: "Ankara" },
  { id: "izmir", label: "İzmir" },
];
const cityOf = (plan: Plan): City => {
  const d = (plan.location?.district ?? plan.location?.address ?? "").toLocaleLowerCase("tr-TR");
  if (d.includes("ankara")) return "ankara";
  if (d.includes("izmir") || d.includes("i̇zmir")) return "izmir";
  return ANADOLU.some((x) => d.includes(x)) ? "ist-anadolu" : "ist-avrupa";
};
/** "Moda, Kadıköy" → "Kadıköy"; the section heading. */
const districtOf = (plan: Plan) => (plan.location?.district ?? "Şehir").split(",").map((x) => x.trim()).pop() ?? "Şehir";

/** `Explore` artboard: hero, city chips, district sections with public plans. */
export function ExploreView({ plans, initials }: { plans: Plan[]; initials: string }) {
  const [city, setCity] = useState<City>("ist-anadolu");
  const counts = CITIES.reduce((acc, c) => ({ ...acc, [c.id]: plans.filter((p) => cityOf(p) === c.id).length }), {} as Record<City, number>);
  const visible = plans.filter((p) => cityOf(p) === city);
  const groups = [...new Map<string, Plan[]>(visible.map((p) => [districtOf(p), []] as [string, Plan[]])).keys()].map((d) => ({ district: d, plans: visible.filter((p) => districtOf(p) === d) }));

  return (
    <main className="relative min-h-dvh overflow-x-hidden pb-28 md:pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px]" style={{ background: "radial-gradient(60% 90% at 30% 20%, #C2410C 0%, rgba(194,65,12,0) 70%), radial-gradient(45% 80% at 78% 30%, #1EC9B0 0%, rgba(30,201,176,0) 70%), radial-gradient(50% 70% at 95% 90%, #FFB020 0%, rgba(255,176,32,0) 70%), #1A0B06" }} aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px]" style={{ background: "repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0 2px, rgba(255,255,255,0) 2px 26px), linear-gradient(180deg, rgba(12,12,13,0) 40%, #0C0C0D 100%)" }} aria-hidden />
      <div className="absolute right-4 top-[18px] z-10 md:right-10">
        <Link href={routes.create} className="flex h-11 items-center gap-2 rounded-pill bg-white px-5 text-[15px] font-bold text-bg"><PlusIcon size={16} strokeWidth={2.6} /> Oluştur</Link>
      </div>

      <div className="relative flex max-w-[620px] flex-col gap-4 px-4 pt-20 md:px-12 md:pt-[130px]">
        <h1 className="display text-[72px] leading-[0.9] tracking-[-0.05em] md:text-[120px]">keşfet</h1>
        <p className="text-lg opacity-90 md:text-2xl">Şehrindeki en iyi planlar ve arkasındaki topluluklar</p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-1.5 [scrollbar-width:none] md:mx-0 md:px-0">
          {CITIES.map((c) => (
            <button key={c.id} type="button" aria-pressed={city === c.id} onClick={() => setCity(c.id)} className={`flex h-11 shrink-0 items-center gap-2 rounded-pill px-4.5 text-[15px] ${city === c.id ? "bg-white font-bold text-bg" : "border border-white/30 bg-bg/35 font-semibold"}`}>
              {c.label} <span className={city === c.id ? "opacity-60" : "text-subtle"}>{counts[c.id]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-10 grid gap-8 px-4 md:mt-16 md:grid-cols-2 md:gap-12 md:px-12">
        {groups.map((g) => (
          <section key={g.district} className="flex flex-col gap-4">
            <h2 className="display text-[40px] leading-none tracking-[-0.04em] md:text-[56px]">{g.district.toLocaleLowerCase("tr-TR")}</h2>
            <div className="flex flex-col rounded-2xl border border-white/8 bg-white/5">
              {g.plans.map((p) => {
                const c = countByStatus(p.guests);
                const host = p.hosts[0];
                return (
                  <Link key={p.code} href={routes.plan(p.code)} className="flex items-center gap-4 border-b border-white/8 p-3.5 last:border-b-0">
                    <Poster themeId={p.themeId} text={p.posterText ?? ""} src={p.posterUrl} className="w-[84px] shrink-0 rounded-[12px] md:w-[108px]" numeralSize="40%" />
                    <span className="flex min-w-0 grow flex-col gap-1.5">
                      {host && <span className="flex h-7 w-fit items-center gap-2 rounded-pill bg-white/10 pl-1 pr-2.5 text-[13px] font-bold"><Avatar initials={host.initials} gradient={host.gradient} size={20} square className="text-[9px]" />{host.name}</span>}
                      <span className="truncate text-lg font-bold tracking-tight md:text-[22px]">{p.title}</span>
                      <span className="text-[15px] text-muted">{p.startsAt ? `${formatDayShort(p.startsAt)} · ${formatTime(p.startsAt)}` : "Tarih netleşmedi"} · {p.location?.district?.split(",")[0]}</span>
                      <span className="text-sm font-bold text-amber">{(c.going + c.maybe).toLocaleString("tr-TR")} ilgileniyor</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
        {groups.length === 0 && (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/8 bg-white/5 p-6 md:col-span-2">
            <span className="text-[22px] font-bold tracking-tight">Burada henüz herkese açık plan yok</span>
            <p className="max-w-[420px] text-[15px] text-muted">Planını “Herkese açık” yaparsan burada listelenir; katılımcı listesi ve adres yine katılanlara özel kalır.</p>
            <Link href={routes.create} className="flex h-12 items-center rounded-pill bg-white px-5 text-[15px] font-extrabold text-bg">Plan oluştur</Link>
          </div>
        )}
      </div>
      <TabBar initials={initials} />
    </main>
  );
}
