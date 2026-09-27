"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDayLong, formatTimeRange, formatTry, rsvpLabel, type RsvpStatus } from "@partile/core";
import { themeById } from "@partile/ui-tokens";
import { Mark } from "@/components/brand/Mark";
import { MarkTile, Wordmark } from "@/components/brand/Mark";
import { Avatar, AvatarStack } from "@/components/plan/Avatar";
import { CommentBox } from "@/components/plan/CommentBox";
import { AlbumSection } from "@/components/plan/AlbumSection";
import { openConversation } from "@/app/actions";
import { gradientFor } from "@partile/core";
import { PollCard } from "@/components/plan/PollCard";
import { Poster } from "@/components/plan/Poster";
import { RsvpButtons } from "@/components/plan/RsvpButtons";
import { EffectLayer } from "@/components/plan/EffectLayer";
import { RsvpFlow } from "@/components/plan/RsvpFlow";
import { ThemeSurface } from "@/components/plan/ThemeSurface";
import { BellIcon, CalendarIcon, CheckIcon, ChevronDownIcon, CrownIcon, LockIcon, PinIcon } from "@/components/shell/icons";
import { countByStatus, type Plan } from "@partile/core";
import type { Viewer } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { titleFontStyle } from "@/lib/fonts";
import { routes } from "@/lib/routes";

const SendIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />
  </svg>
);

const chip = "flex h-10 items-center gap-2 rounded-pill border border-white/28 bg-white/8 px-4 text-sm font-bold";
const timeAgo = (iso: string) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 60 ? `${m} dk` : m < 1440 ? `${Math.round(m / 60)} sa` : `${Math.round(m / 1440)} g`;
};

/** `InviteDesktop` / `InviteMobile` (pre-RSVP) and `Event` / `EventMobile` (post-RSVP) in one component. */
type ViewerGuest = { id: string; name: string; status: string; plusOnes?: number; plusOneNames?: string[]; note?: string; answers?: Record<string, string>; followHost: boolean; votes: Record<string, "yes" | "maybe" | "no"> };

export function PlanView({ plan, viewer, viewerGuest, preview = false }: { plan: Plan; viewer: Viewer | null; viewerGuest: ViewerGuest | null; preview?: boolean }) {
  const router = useRouter();
  const rsvp = viewerGuest && viewerGuest.status !== "invited" ? viewerGuest : null;
  const ready = true;
  const [flowState, setFlowState] = useState<"going" | "maybe" | "no" | null>(null);
  const flow = flowState;
  const setFlow = (v: "going" | "maybe" | "no" | null) => !preview && setFlowState(v);
  const t = themeById(plan.themeId);
  const counts = countByStatus(plan.guests);
  const joined = !!rsvp && rsvp.status !== "no" && rsvp.status !== "pending";
  const pendingApproval = rsvp?.status === "pending";
  const polling = !!plan.poll?.length && !plan.startsAt;
  const hostNames = plan.hosts.map((h) => h.name).join(" & ");
  const poster = <Poster themeId={plan.themeId} text={plan.posterText ?? "30"} src={plan.posterUrl} topLeft="PARTİLE" bottomRight={plan.location?.district?.split(",")[0]?.toLocaleUpperCase("tr-TR")} className="w-full shadow-[0_30px_60px_rgba(0,0,0,0.4)]" />;

  return (
    <ThemeSurface themeId={plan.themeId} className="min-h-dvh pb-28 md:pb-16">
      {!joined && <EffectLayer effect={plan.effect} themeId={plan.themeId} seed={plan.code.length} />}
      {!joined && (
        <Link href={routes.landing} className="flex h-13 items-center justify-between bg-bg px-4 text-[15px] text-text md:justify-center md:gap-4">
          <span>Plan yapmak bu kadar kolay</span>
          <span className="flex h-9 items-center rounded-pill border-[1.5px] border-amber px-3.5 text-sm font-bold">Sen de oluştur</span>
        </Link>
      )}
      <header className="flex h-16 items-center justify-between px-4 md:h-[76px] md:px-12">
        <Link href={routes.landing} className="flex items-center gap-2.5" style={{ color: t.fg }}>
          <MarkTile size={30} />
          <Wordmark size={22} />
        </Link>
        {viewer ? (
          <Link href={routes.home} className="flex items-center gap-2 text-sm font-bold">
            <Avatar initials={viewer.initials} gradient="linear-gradient(135deg, #FFD166, #FF6A3D)" size={32} />
            {viewer.name || "Hesabım"}
          </Link>
        ) : (
          <Link href={routes.login} className="flex h-10 items-center rounded-pill bg-bg px-4.5 text-[15px] font-extrabold text-white">
            Giriş
          </Link>
        )}
      </header>

      <div className="mx-auto flex max-w-[1040px] flex-col gap-6 px-4 pt-4 md:flex-row md:items-start md:gap-[72px] md:px-12 md:pt-8">
        <main className="flex min-w-0 flex-col gap-7 md:w-[430px] md:shrink-0">
          <h1 className="text-center text-[52px] leading-none md:text-left md:text-[76px] md:tracking-[-0.03em]" style={titleFontStyle(plan.titleFont)}>
            {plan.title}
          </h1>
          <div className="md:hidden">{poster}</div>
          {polling ? (
            <PollCard code={plan.code} themeId={plan.themeId} hostName={plan.hosts[0]?.name.split(" ")[0] ?? "Düzenleyen"} options={plan.poll!} tally={plan.pollVotes ?? {}} viewer={viewer} existing={viewerGuest && Object.keys(viewerGuest.votes).length ? viewerGuest.votes : null} />
          ) : (
            <div className="flex flex-col gap-1">
              <div className="display text-[32px] tracking-tight">{plan.dateTbd || !plan.startsAt ? "Tarih netleşmedi" : formatDayLong(plan.startsAt)}</div>
              {plan.startsAt && !plan.dateTbd && <div className="text-[22px] opacity-85">{formatTimeRange(plan.startsAt, plan.endsAt)} · TSİ</div>}
            </div>
          )}

          {pendingApproval && (
            <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,181,71,0.4)] bg-[rgba(255,181,71,0.14)] px-4 py-3.5 text-sm md:hidden"><span className="font-bold">Onay bekliyor.</span> Düzenleyen listeye alınca haber veririz.</div>
          )}
          {!joined && !polling && !pendingApproval && ready && (
            <div className="flex flex-col items-center gap-4 md:hidden">
              <span className="display text-xl tracking-normal">Geliyor musun?</span>
              <RsvpButtons size={104} accentFg="#160804" selected={null} onSelect={(s) => setFlow(s)} variant={plan.rsvpStyle} allowMaybe={plan.allowMaybe} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {joined ? (
              <>
                <span className={chip}>TSİ</span>
                <button type="button" className={chip}><CalendarIcon size={16} /> Takvime ekle</button>
                <button type="button" aria-label="Davet et" className="flex size-10 items-center justify-center rounded-pill border border-white/28 bg-white/8"><SendIcon size={16} /></button>
                <button type="button" aria-label="Sessize al" className="flex size-10 items-center justify-center rounded-pill border border-white/28 bg-white/8"><BellIcon size={16} /></button>
              </>
            ) : (
              <button type="button" className={chip}>Sonra hatırlat</button>
            )}
          </div>

          <section className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5 text-[17px] opacity-85"><CrownIcon size={20} /> Düzenleyenler</div>
            <div className="flex items-center gap-3.5">
              <div className="flex">{plan.hosts.map((h, i) => <Avatar key={h.id} initials={h.initials} gradient={h.gradient} size={52} square ring="rgba(0,0,0,0.35)" className={i ? "-ml-3" : ""} />)}</div>
              <div className="flex grow flex-col"><span className="text-lg font-bold">{hostNames}</span><span className="text-sm opacity-75">3 yaklaşan plan</span></div>
              {joined && !preview ? (
                <button type="button" onClick={async () => { const r = await openConversation(plan.code, plan.hosts[0]!.id); if (r.ok) router.push(`${routes.messages}?s=${r.id}`); }} className={chip}>Düzenleyene yaz</button>
              ) : (
                <button type="button" className={chip}>Takip et</button>
              )}
            </div>
          </section>

          <div className="flex items-start gap-2.5">
            <PinIcon size={22} className="mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-lg font-bold">{joined || plan.location?.display === "full" ? plan.location?.name : plan.location?.district}</span>
              {joined || plan.location?.display === "full" ? (
                <span className="text-base opacity-85">{plan.location?.address} · <a className="font-bold" href={`https://maps.google.com/?q=${encodeURIComponent(plan.location?.address ?? "")}`} target="_blank" rel="noreferrer">Haritada aç</a></span>
              ) : (
                <span className="flex items-center gap-1.5 text-[15px] opacity-80"><LockIcon size={13} /> Tam adres katılımını bildirince görünür</span>
              )}
            </div>
          </div>

          <p className="whitespace-pre-line text-lg leading-relaxed opacity-90">{plan.description}</p>

          {joined && plan.cost.mode !== "off" && (
            <div className="glass flex items-center gap-3.5 rounded-xl px-4.5 py-4">
              <span className="flex size-11 items-center justify-center rounded-md font-poster text-base font-extrabold text-bg" style={{ background: t.accent }}>₺</span>
              <span className="flex grow flex-col">
                <span className="text-[17px] font-bold">{plan.cost.mode === "fixed" && plan.cost.amountTry ? `Kişi başı ${formatTry(plan.cost.amountTry)}` : "Gönlünden ne koparsa"} · Masrafı böl</span>
                <span className="text-sm opacity-80">{[plan.cost.iban && "IBAN", plan.cost.papara && "Papara"].filter(Boolean).join(" · ")} · ödemeni işaretle</span>
              </span>
              <button type="button" className="h-10 rounded-pill bg-white px-4 text-sm font-bold text-bg">Gönderdim</button>
            </div>
          )}

          <section className="flex flex-col gap-3.5">
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-0.5">
                <h2 className="display text-[26px] tracking-tight">Katılımcılar</h2>
                {plan.showGuestCount && <span className="text-base opacity-85">{counts.going} geliyor · {counts.maybe} belki{joined ? ` · ${counts.no} gelemiyor` : ""}</span>}
              </div>
              {joined && <button type="button" className={chip}>Tümünü gör</button>}
            </div>
            <AvatarStack items={plan.guests.slice(0, joined ? 6 : 4)} ring="rgba(0,0,0,0.35)" more={Math.max(0, plan.guests.length - (joined ? 6 : 4))} />
            {!joined && (
              <div className="flex flex-col items-start gap-3 rounded-xl border border-white/12 bg-bg/55 p-5">
                <span className="flex items-center gap-2 text-[17px] font-bold"><LockIcon size={18} /> Katılımcılara özel</span>
                <p className="text-[15px] leading-relaxed opacity-85">Kimlerin geldiğini, yorumları ve fotoğraf albümünü yalnızca katılımını bildirenler görür.</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setFlow("going")} className="h-11 rounded-pill bg-white px-4.5 text-[15px] font-bold text-bg">Katılımını bildir</button>
                  <Link href={routes.login} className="flex h-11 items-center px-3.5 text-[15px] font-bold">Zaten bildirdin mi? Giriş yap</Link>
                </div>
              </div>
            )}
          </section>

          {joined && (
            <>
              <AlbumSection code={plan.code} photos={plan.photos} viewerId={viewer?.id ?? null} isHost={false} canUpload={!preview && plan.albumGuestsCanUpload && !!viewer} chipClass={chip} />
              <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-0.5"><h2 className="display text-[26px] tracking-tight">Akış</h2><span className="text-base opacity-85">{plan.feed.length} güncelleme</span></div>
                {!preview && <CommentBox code={plan.code} initials={viewer?.initials ?? "?"} gradient={gradientFor(viewer?.id ?? "me")} />}
                {plan.feed.map((f) => {
                  const guest = plan.guests.find((g) => g.id === f.guestId);
                  const who = guest ?? plan.hosts.find((h) => h.id === f.guestId);
                  if (!who) return null;
                  const status: RsvpStatus | null = guest?.status ?? null;
                  return (
                    <div key={f.id} className="flex gap-3">
                      <Avatar initials={who.initials} gradient={who.gradient} size={40} />
                      <div className="flex flex-col gap-1.5">
                        <span className="text-base">
                          <strong>{who.name.split(" ")[0]}</strong> {f.kind === "blast" ? "bir duyuru gönderdi" : f.kind === "comment" ? "yorum yazdı" : <>katılımını bildirdi · <span className="font-bold" style={{ color: status === "going" ? t.accent : undefined }}>{status ? rsvpLabel[status] : ""}</span></>} {plan.showTimestamps && <span className="opacity-60">· {timeAgo(f.at)}</span>}
                        </span>
                        {f.text && <span className="rounded-[4px_14px_14px_14px] bg-white/10 px-3.5 py-2.5 text-base">{f.text}</span>}
                      </div>
                    </div>
                  );
                })}
              </section>
            </>
          )}

          <div className="flex items-center gap-2 pt-2 text-[13px] opacity-75"><Mark size={16} solid /> Bu davetiye <strong>partile</strong> ile hazırlandı · <Link href={routes.landing} className="font-bold">Sen de oluştur</Link></div>
        </main>

        <aside className="hidden w-[346px] shrink-0 flex-col items-center gap-6 md:flex">
          {poster}
          {polling ? (
            <span className="max-w-[300px] text-center text-sm opacity-75">Tarih anketi açık: soldaki seçeneklere oy ver. Gün seçilince oyun katılıma dönüşür.</span>
          ) : pendingApproval ? (
            <div className="glass flex w-full flex-col gap-1.5 rounded-2xl p-4.5"><span className="font-bold">Onay bekliyor</span><span className="text-sm opacity-85">Katılımını bildirdin; düzenleyen listeye alınca haber veririz.</span><button type="button" onClick={() => setFlow("going")} className="w-fit text-sm font-bold" style={{ color: t.accent }}>Değiştir</button></div>
          ) : !joined ? (
            <>
              <span className="display text-xl tracking-normal">Geliyor musun?</span>
              {ready && <RsvpButtons size={104} accentFg="#160804" selected={null} onSelect={(s) => setFlow(s)} variant={plan.rsvpStyle} allowMaybe={plan.allowMaybe} />}
              <span className="max-w-[300px] text-center text-sm opacity-75">Katılımını bildirmek için ad ve e-posta yeter; uygulama gerekmez. E-postanı düzenleyenler göremez.</span>
            </>
          ) : (
            <div className="glass flex w-full flex-col gap-4 rounded-2xl p-4.5">
              <div className="flex items-center gap-4">
                <span className="flex size-24 shrink-0 flex-col items-center justify-center gap-0.5 rounded-pill text-[13px] font-extrabold text-[#160804] shadow-[0_14px_34px_rgba(0,0,0,0.35)]" style={{ background: "radial-gradient(circle at 35% 30%, #FFE3A8 0%, #FFB547 45%, #FF7A3D 100%)" }}>
                  <CheckIcon size={30} /> {rsvpLabel[rsvp!.status as RsvpStatus]}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs font-extrabold tracking-wide opacity-75">KATILIMIN</span>
                  <span className="display text-xl tracking-normal">{rsvpLabel[rsvp!.status as RsvpStatus]}</span>
                  {rsvp!.plusOnes ? <span className="text-sm opacity-85">+1 misafir: {rsvp!.plusOneNames?.[0] || rsvp!.plusOnes}</span> : null}
                  <button type="button" onClick={() => setFlow(rsvp!.status === "maybe" || rsvp!.status === "no" ? rsvp!.status : "going")} className="w-fit text-sm font-bold" style={{ color: t.accent }}>Değiştir</button>
                </div>
              </div>
              <button type="button" className="flex h-12 items-center justify-center gap-2.5 rounded-pill bg-white text-[15px] font-extrabold text-bg"><SendIcon /> Arkadaşlarını davet et</button>
            </div>
          )}
          <div className="glass flex w-full items-center gap-3 rounded-xl p-4">
            <span className="flex size-11 items-center justify-center rounded-md bg-white/10"><CalendarIcon /></span>
            <span className="flex grow flex-col"><span className="text-[15px] font-bold">Takvime ekle</span><span className="text-[13px] opacity-80">Google · Apple · .ics</span></span>
            {!joined && <span className="text-[13px] opacity-70">Katılım sonrası</span>}
          </div>
        </aside>
      </div>

      {joined && (
        <div className="fixed inset-x-4 bottom-6 flex h-[60px] items-center gap-1.5 rounded-pill bg-bg p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] md:hidden">
          <button type="button" onClick={() => setFlow(rsvp!.status === "maybe" || rsvp!.status === "no" ? rsvp!.status : "going")} className="flex h-12 grow items-center justify-center gap-2 rounded-pill text-[15px] font-extrabold text-[#160804]" style={{ background: "radial-gradient(circle at 35% 30%, #FFE3A8 0%, #FFB547 45%, #FF7A3D 100%)" }}>
            <CheckIcon size={18} /> {rsvpLabel[rsvp!.status as RsvpStatus]} <ChevronDownIcon size={16} />
          </button>
          <button type="button" className="flex h-12 items-center gap-2 rounded-pill bg-white/12 px-4 text-sm font-bold text-white"><SendIcon size={16} /> Davet et</button>
        </div>
      )}

      <RsvpFlow
        plan={plan}
        viewer={viewer}
        open={flow !== null}
        initial={flow ?? "going"}
        existing={rsvp}
        onClose={() => setFlow(null)}
        onDone={() => {
          setFlow(null);
          router.refresh();
        }}
      />
    </ThemeSurface>
  );
}
