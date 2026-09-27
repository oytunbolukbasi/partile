"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { blast as sendBlastAction, decideGuest, pickDay, removeFeedItem, savePlan, setGuestFlag } from "@/app/actions";
import { formatDayLong, formatDayShort, formatTime, formatTimeRange, formatTry, planUrl, rsvpLabel, type PlanDraft } from "@partile/core";
import { themeById } from "@partile/ui-tokens";
import { SettingsModal, type SettingsTab } from "@/components/create/SettingsModal";
import { BlastModal } from "@/components/host/BlastModal";
import { GuestListModal } from "@/components/host/GuestListModal";
import { PollResults } from "@/components/host/PollResults";
import { PollModal } from "@/components/create/PollModal";
import { Avatar, AvatarStack } from "@/components/plan/Avatar";
import { Poster } from "@/components/plan/Poster";
import { ThemeSurface } from "@/components/plan/ThemeSurface";
import { ShareModal } from "@/components/share/ShareModal";
import { Rail } from "@/components/shell/Rail";
import { CrownIcon, EyeIcon, LockIcon, PencilIcon, ShareIcon } from "@/components/shell/icons";
import { countByStatus, type Plan } from "@partile/core";
import { titleFontStyle } from "@/lib/fonts";
import { routes } from "@/lib/routes";

const tool = "flex h-11 shrink-0 items-center gap-2 rounded-pill border border-white/14 bg-bg/60 px-4 text-sm font-bold";
const chip = "flex h-10 items-center rounded-pill border border-white/35 bg-white/8 px-4 text-sm font-bold";
const timeAgo = (iso: string) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 60 ? `${m} dk` : m < 1440 ? `${Math.round(m / 60)} sa` : `${Math.round(m / 1440)} g`;
};

/** `EventHost` artboard: the plan page as its host sees it — toolbar, counters, approvals, link box, reminders. */
export function HostView({ plan, viewerId }: { plan: Plan; viewerId: string }) {
  const router = useRouter();
  const [, start] = useTransition();
  const guests = plan.guests;
  const me = { id: viewerId };
  const act = (fn: () => Promise<unknown>, close = false) => start(async () => { await fn(); if (close) setModal(null); router.refresh(); });
  const params = useSearchParams();
  const [modal, setModal] = useState<"guests" | "blast" | "settings" | "share" | "poll" | null>(params.get("paylas") ? "share" : null);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("rsvp");
  const [copied, setCopied] = useState(false);
  const t = themeById(plan.themeId);
  const c = countByStatus(guests);
  const pending = guests.filter((g) => g.status === "pending");
  const url = planUrl(plan.code);
  const openSettings = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setModal("settings");
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };
  const paid = guests.filter((g) => g.status === "going" && g.paid).length;
  const remindAt = plan.startsAt ? new Date(new Date(plan.startsAt).getTime() - 7 * 864e5) : null;
  const remind2h = plan.startsAt ? new Date(new Date(plan.startsAt).getTime() - 2 * 36e5) : null;

  return (
    <ThemeSurface themeId={plan.themeId} className="min-h-dvh pb-16 md:pl-[var(--rail-w)]">
      <Rail active="home" />
      <div className="mx-auto flex max-w-[1040px] flex-col gap-6 px-4 pt-4 md:px-12 md:pt-[76px]">
        <div className="-mx-4 flex items-center gap-2.5 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
          <span className={`${tool} text-[13px] font-extrabold tracking-wide`}><CrownIcon size={16} /> SEN DÜZENLİYORSUN</span>
          <Link href={`${routes.create}?kod=${plan.code}`} className={tool}><PencilIcon size={16} /> Düzenle</Link>
          <button type="button" onClick={() => setModal("guests")} className={tool}>
            Katılımcılar {pending.length > 0 && <span className="flex h-[22px] items-center rounded-pill bg-amber px-2 text-xs font-extrabold text-bg">{pending.length} onay</span>}
          </button>
          <button type="button" onClick={() => setModal("blast")} className={tool}>Duyuru</button>
          <button type="button" onClick={() => openSettings("rsvp")} className={tool}>Ayarlar</button>
          <Link href={`${routes.plan(plan.code)}?goruntule=misafir`} className={tool} title="Misafir gözüyle gör"><EyeIcon size={16} /> Misafir gözüyle</Link>
          <button type="button" onClick={() => setModal("share")} className="ml-auto flex h-11 shrink-0 items-center gap-2 rounded-pill bg-white px-4.5 text-sm font-extrabold text-bg"><ShareIcon size={16} /> Paylaş</button>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-[72px]">
          <main className="flex min-w-0 flex-col gap-6.5 md:w-[430px] md:shrink-0">
            <h1 className="text-[52px] leading-none md:text-[76px] md:tracking-[-0.03em]" style={titleFontStyle(plan.titleFont)}>{plan.title}</h1>
            {plan.poll?.length && !plan.startsAt ? (
              <PollResults themeId={plan.themeId} options={plan.poll} tally={plan.pollVotes ?? {}} onEdit={() => setModal("poll")} onPick={(o) => act(() => pickDay(plan.code, o.id))} />
            ) : (
              <div className="flex flex-col gap-1">
                <div className="display text-[32px] tracking-tight">{plan.dateTbd || !plan.startsAt ? "Tarih netleşmedi" : formatDayLong(plan.startsAt)}</div>
                {plan.startsAt && !plan.dateTbd && <div className="text-[22px] opacity-85">{formatTimeRange(plan.startsAt, plan.endsAt)} · TSİ</div>}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {[
                [c.going, "Geliyor"],
                [c.maybe, "Belki"],
                [c.invited, "Yanıtsız"],
                [plan.views, "Görüntülenme"],
              ].map(([n, l]) => (
                <div key={l} className="flex flex-col gap-0.5 rounded-lg border border-white/14 bg-white/8 p-3"><span className="display text-[26px] tracking-normal">{n}</span><span className="text-xs opacity-80">{l}</span></div>
              ))}
            </div>

            {pending.length > 0 && (
              <button type="button" onClick={() => setModal("guests")} className="flex items-center gap-3 rounded-xl border border-[rgba(255,181,71,0.4)] bg-[rgba(255,181,71,0.14)] px-4 py-3.5 text-left">
                <AvatarStack items={pending.slice(0, 2)} size={36} ring="rgba(0,0,0,0.35)" />
                <span className="flex grow flex-col"><span className="font-bold">{pending.map((g) => g.name.split(" ")[0]).join(" ve ")} listeye alınmak istiyor</span><span className="text-[13px] opacity-85">Katılım onayı açık · {pending.length} bekleyen</span></span>
                <span className="flex h-9 shrink-0 items-center rounded-pill bg-amber px-3.5 text-[13px] font-extrabold text-bg">İncele</span>
              </button>
            )}

            <section className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5 text-[17px] opacity-85"><CrownIcon size={20} /> Düzenleyenler</div>
              <div className="flex items-center gap-3.5">
                <div className="flex">{plan.hosts.map((h, i) => <Avatar key={h.id} initials={h.initials} gradient={h.gradient} size={52} square ring="rgba(0,0,0,0.35)" className={i ? "-ml-3" : ""} />)}</div>
                <div className="flex grow flex-col"><span className="text-lg font-bold">{plan.hosts.map((h) => (h.id === me.id ? "Sen" : h.name)).join(" & ")}</span>{plan.hosts.length > 1 && <span className="text-sm opacity-75">{plan.hosts[1]!.name} ortak düzenleyen · kabul etti</span>}</div>
                <button type="button" onClick={() => openSettings("hosts")} className={chip}>+ Ekle</button>
              </div>
            </section>

            <div className="flex flex-col gap-0.5">
              <span className="text-lg font-bold">{plan.location?.name ?? "Konum eklenmedi"}</span>
              <span className="text-[15px] opacity-85">
                {plan.location?.display === "district" ? <>Misafirlere “{plan.location.district}” görünür; tam adres katılınca açılır</> : <>Tam adres herkese görünür</>} · <Link href={`${routes.create}?kod=${plan.code}`} className="font-bold">Değiştir</Link>
              </span>
            </div>

            <p className="whitespace-pre-line text-lg leading-relaxed opacity-90">{plan.description}</p>

            {plan.cost.mode !== "off" && (
              <div className="flex items-center gap-3.5 rounded-xl border border-white/14 bg-white/8 px-4.5 py-4">
                <span className="flex size-11 items-center justify-center rounded-md font-poster text-base font-extrabold text-bg" style={{ background: t.accent }}>₺</span>
                <span className="flex grow flex-col">
                  <span className="text-[17px] font-bold">Masrafı böl{plan.cost.mode === "fixed" && plan.cost.amountTry ? ` · ${formatTry(plan.cost.amountTry)} kişi başı` : ""}</span>
                  <span className="text-sm opacity-80">{paid} / {c.going} kişi “gönderdim” dedi{plan.cost.amountTry ? ` · ${formatTry(paid * plan.cost.amountTry)} beyan edildi` : ""}</span>
                </span>
                <button type="button" onClick={() => openSettings("cost")} className={chip}>Düzenle</button>
              </div>
            )}

            <section className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5"><h2 className="display text-[26px] tracking-tight">Katılımcılar</h2><span className="text-base opacity-85">{c.going} geliyor · {c.maybe} belki · {c.no} gelemiyor</span></div>
                <button type="button" onClick={() => setModal("guests")} className={chip}>Yönet</button>
              </div>
              <AvatarStack items={guests.filter((g) => g.status === "going").slice(0, 4)} ring="rgba(0,0,0,0.35)" more={Math.max(0, guests.length - 4)} />
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5"><h2 className="display text-[26px] tracking-tight">Akış</h2><span className="text-base opacity-85">{plan.feed.length} güncelleme · düzenleyen olarak yorumları sabitleyebilir, silebilirsin</span></div>
              {plan.feed.map((f) => {
                const guest = guests.find((g) => g.id === f.guestId);
                const who = guest ?? plan.hosts.find((h) => h.id === f.guestId);
                if (!who) return null;
                return (
                  <div key={f.id} className="flex gap-3">
                    <Avatar initials={who.initials} gradient={who.gradient} size={40} />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-base">
                        <strong>{who.id === me.id ? "Sen" : who.name.split(" ")[0]}</strong> {f.kind === "blast" ? "duyuru gönderdi" : <>katılımını bildirdi · <span className="font-bold" style={{ color: guest?.status === "going" ? t.accent : undefined }}>{guest ? rsvpLabel[guest.status] : ""}</span></>} <span className="opacity-60">· {timeAgo(f.at)}</span>
                      </span>
                      {f.text && <span className="rounded-[4px_14px_14px_14px] bg-white/10 px-3.5 py-2.5 text-base">{f.text}</span>}
                      <span className="flex gap-3 text-sm font-bold opacity-85">
                        <button type="button">Yanıtla</button>
                        <button type="button">Sabitle</button>
                        <button type="button" className="opacity-70" onClick={() => act(() => removeFeedItem(plan.code, f.id))}>Sil</button>
                      </span>
                    </div>
                  </div>
                );
              })}
            </section>
          </main>

          <aside className="flex w-full flex-col items-center gap-6 md:w-[346px] md:shrink-0">
            <div className="relative w-full">
              <Poster themeId={plan.themeId} text={plan.posterText ?? "30"} src={plan.posterUrl} topLeft="PARTİLE" bottomRight={plan.startsAt ? `${formatDayShort(plan.startsAt).split(", ")[1]?.toLocaleUpperCase("tr-TR")} · ${plan.location?.district?.split(",")[0]?.toLocaleUpperCase("tr-TR")}` : undefined} className="w-full shadow-[0_30px_60px_rgba(0,0,0,0.4)]" />
              <Link href={`${routes.create}?kod=${plan.code}`} className="absolute right-3 top-3 flex h-10 items-center gap-1.5 rounded-pill bg-bg/70 px-3.5 text-[13px] font-bold text-white"><PencilIcon size={14} /> Afişi değiştir</Link>
            </div>

            <div className="flex w-full flex-col gap-3 rounded-xl border border-white/14 bg-white/8 p-4">
              <div className="flex items-center justify-between"><span className="text-[15px] font-bold">Davet linki</span><span className="flex h-6 items-center gap-1 rounded-pill bg-white/10 px-2 text-[11px] font-extrabold"><LockIcon size={11} /> {plan.visibility === "public" ? "HERKESE AÇIK" : "GİZLİ"}</span></div>
              <div className="flex h-11 items-center gap-2 rounded-lg bg-bg/50 pl-3 pr-1.5"><span className="grow truncate text-sm font-semibold">{url.replace("https://", "")}</span><button type="button" onClick={copy} className="h-8 rounded-md bg-white px-3 text-xs font-extrabold text-bg">{copied ? "Kopyalandı" : "Kopyala"}</button></div>
              <div className="grid grid-cols-2 gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(`${plan.title} · ${url}`)}`} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center rounded-[10px] bg-[#25D366] text-[13px] font-extrabold text-[#0B141A]">WhatsApp</a>
                <button type="button" onClick={() => setModal("share")} className="flex h-10 items-center justify-center rounded-[10px] border border-white/30 text-[13px] font-bold">Hikâye afişi</button>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2.5 rounded-xl border border-white/14 bg-white/8 p-4">
              <span className="text-[15px] font-bold">Otomatik hatırlatmalar</span>
              {plan.remindersEnabled && remindAt && remind2h ? (
                <>
                  <span className="text-sm">{formatDayShort(remindAt).split(", ")[1]} · “Katılımını bildir” → Davetli + Belki</span>
                  <span className="text-sm">{formatDayShort(remind2h).split(", ")[1]} {formatTime(remind2h)} · “2 saat kaldı” → Geliyor</span>
                </>
              ) : (
                <span className="text-sm opacity-80">Kapalı</span>
              )}
              <button type="button" onClick={() => openSettings("reminders")} className="w-fit text-[13px] font-bold" style={{ color: t.accent }}>Ayarla →</button>
            </div>

            <div className="flex w-full gap-2">
              <Link href={routes.create} className="flex h-11 grow items-center justify-center rounded-pill border border-white/25 text-sm font-bold opacity-85">Kopyala (yeni plan)</Link>
              <button type="button" className="flex h-11 grow items-center justify-center rounded-pill border border-[rgba(255,106,61,0.5)] text-sm font-bold text-[#FF8C6B]">İptal et</button>
            </div>
          </aside>
        </div>
      </div>

      <PollModal open={modal === "poll"} onClose={() => setModal(null)} draft={plan} onSave={(p) => act(() => savePlan(plan.code, p), true)} />
      <ShareModal plan={plan} open={modal === "share"} onClose={() => setModal(null)} onSettings={(tab) => openSettings(tab)} />
      <GuestListModal plan={plan} guests={guests} open={modal === "guests"} onClose={() => setModal(null)} onDecide={(id, d) => act(() => decideGuest(plan.code, id, d))} onFlag={(id, flag, v) => act(() => setGuestFlag(plan.code, id, flag, v))} onBlast={() => setModal("blast")} />
      <BlastModal plan={plan} guests={guests} hostName={plan.hosts.find((h) => h.id === viewerId)?.name ?? "Düzenleyen"} open={modal === "blast"} onClose={() => setModal(null)} onSend={(b) => act(() => sendBlastAction(plan.code, b.toLabel, b.guestIds, b.text), true)} />
      <SettingsModal open={modal === "settings"} onClose={() => setModal(null)} initialTab={settingsTab} draft={plan} onSave={(p: Partial<PlanDraft>) => act(() => savePlan(plan.code, p), true)} />
    </ThemeSurface>
  );
}
