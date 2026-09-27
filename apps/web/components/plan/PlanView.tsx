"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDayLong, formatTimeRange, formatTry, planUrl, rsvpLabel, type RsvpStatus } from "@partile/core";
import { themeById } from "@partile/ui-tokens";
import { Mark } from "@/components/brand/Mark";
import { MarkTile, Wordmark } from "@/components/brand/Mark";
import { Avatar, AvatarStack } from "@/components/plan/Avatar";
import { CommentBox } from "@/components/plan/CommentBox";
import { AlbumSection } from "@/components/plan/AlbumSection";
import { CalendarMenu } from "@/components/plan/CalendarMenu";
import { followHosts, markPaid, mutePlan, openConversation, respondCohost } from "@/app/actions";
import { RemindLaterMenu } from "@/components/plan/RemindLaterMenu";
import { GuestListSheet } from "@/components/plan/GuestListSheet";
import { gradientFor } from "@partile/core";
import { PollCard } from "@/components/plan/PollCard";
import { Poster } from "@/components/plan/Poster";
import { RsvpButtons } from "@/components/plan/RsvpButtons";
import { EffectLayer } from "@/components/plan/EffectLayer";
import { RsvpFlow } from "@/components/plan/RsvpFlow";
import { ThemeSurface } from "@/components/plan/ThemeSurface";
import { BellIcon, BellOffIcon, CalendarIcon, CheckIcon, ChevronDownIcon, CrownIcon, LockIcon, PinIcon } from "@/components/shell/icons";
import { countByStatus, isPlanOver, type Plan } from "@partile/core";
import type { Viewer } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { titleFontStyle } from "@/lib/fonts";
import { routes } from "@/lib/routes";

const SendIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />
  </svg>
);

const chip = "flex h-10 items-center gap-2 rounded-pill border border-ink/28 bg-ink/8 px-4 text-sm font-bold";
const timeAgo = (iso: string) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 60 ? `${m} dk` : m < 1440 ? `${Math.round(m / 60)} sa` : `${Math.round(m / 1440)} g`;
};

/** `InviteDesktop` / `InviteMobile` (pre-RSVP) and `Event` / `EventMobile` (post-RSVP) in one component. */
type ViewerGuest = { id: string; name: string; status: string; paid?: boolean; plusOnes?: number; plusOneNames?: string[]; note?: string; answers?: Record<string, string>; followHost: boolean; votes: Record<string, "yes" | "maybe" | "no"> };

export type ViewerPlanState = { muted: boolean; following: boolean; remindAt: string | null; followers: number };
const NO_STATE: ViewerPlanState = { muted: false, following: false, remindAt: null, followers: 0 };

export function PlanView({ plan, viewer, viewerGuest, preview = false, cohostInvite = false, state = NO_STATE }: { plan: Plan; viewer: Viewer | null; viewerGuest: ViewerGuest | null; preview?: boolean; cohostInvite?: boolean; state?: ViewerPlanState }) {
  const router = useRouter();
  const [listOpen, setListOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const loginHref = `${routes.login}?next=${encodeURIComponent(routes.plan(plan.code))}`;
  const toggle = async (fn: () => Promise<unknown>) => {
    if (preview || busy) return;
    setBusy(true);
    await fn();
    setBusy(false);
    router.refresh();
  };
  const share = async () => {
    const url = planUrl(plan.code);
    if (navigator.share) await navigator.share({ title: plan.title, url }).catch(() => {});
    else await navigator.clipboard?.writeText(url);
  };
  const rsvp = viewerGuest && viewerGuest.status !== "invited" ? viewerGuest : null;
  const ready = true;
  const [flowState, setFlowState] = useState<"going" | "maybe" | "no" | null>(null);
  const flow = flowState;
  const setFlow = (v: "going" | "maybe" | "no" | null) => !preview && setFlowState(v);
  const t = themeById(plan.themeId);
  const counts = countByStatus(plan.guests);
  const joined = !!rsvp && rsvp.status !== "no" && rsvp.status !== "pending";
  const pendingApproval = rsvp?.status === "pending";
  const cancelled = plan.status === "cancelled";
  const ended = !cancelled && isPlanOver(plan);
  const polling = !cancelled && !!plan.poll?.length && !plan.startsAt;
  const cancelNote = plan.feed.find((f) => f.kind === "blast" && f.text?.startsWith("Plan iptal edildi"))?.text?.replace(/^Plan iptal edildi\.\s*/, "");
  const hostNames = plan.hosts.map((h) => h.name).join(" & ");
  const poster = <Poster themeId={plan.themeId} text={plan.posterText ?? "30"} src={plan.posterUrl} topLeft="PARTİLE" bottomRight={plan.location?.district?.split(",")[0]?.toLocaleUpperCase("tr-TR")} className="w-full shadow-[0_30px_60px_rgba(0,0,0,0.4)]" />;

  return (
    <ThemeSurface themeId={plan.themeId} className="min-h-dvh pb-28 md:pb-16">
      {!joined && !cancelled && !ended && <EffectLayer effect={plan.effect} themeId={plan.themeId} seed={plan.code.length} />}
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

          {cohostInvite && (
            <div className="flex flex-col gap-3 rounded-xl border border-[rgba(255,181,71,0.4)] bg-[rgba(255,181,71,0.14)] px-4 py-4">
              <span className="font-bold">{plan.hosts.find((h) => h.owner)?.name ?? "Düzenleyen"} seni ortak düzenleyen olarak davet etti.</span>
              <span className="text-sm opacity-85">Kabul edersen planı düzenleyebilir, katılımcıları görebilir ve duyuru gönderebilirsin.</span>
              <div className="flex gap-2">
                <button type="button" onClick={async () => { await respondCohost(plan.code, true); router.refresh(); }} className="h-11 rounded-pill bg-contrast px-4.5 text-[15px] font-extrabold text-on-contrast">Kabul et</button>
                <button type="button" onClick={async () => { await respondCohost(plan.code, false); router.refresh(); }} className="h-11 rounded-pill border border-ink/30 px-4 text-[15px] font-bold">Reddet</button>
              </div>
            </div>
          )}
          {pendingApproval && (
            <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,181,71,0.4)] bg-[rgba(255,181,71,0.14)] px-4 py-3.5 text-sm md:hidden"><span className="font-bold">Onay bekliyor.</span> Düzenleyen listeye alınca haber veririz.</div>
          )}
          {cancelled && (
            <div role="status" className="flex flex-col gap-1.5 rounded-xl border border-[rgba(255,106,61,0.5)] bg-[rgba(255,106,61,0.14)] px-4 py-4">
              <span className="text-lg font-bold">Bu plan iptal edildi</span>
              {cancelNote && <span className="text-[15px] opacity-90">“{cancelNote}” — {plan.hosts.find((h) => h.owner)?.name.split(" ")[0] ?? "Düzenleyen"}</span>}
            </div>
          )}
          {ended && (
            <div role="status" className="flex flex-col gap-1.5 rounded-xl border border-ink/16 bg-ink/8 px-4 py-4">
              <span className="text-lg font-bold">Bu plan sona erdi</span>
              <span className="text-[15px] opacity-85">{joined ? (plan.albumGuestsCanUpload ? "Albüm açık: o günden fotoğraflarını ekleyebilirsin." : "Albüm ve akış katılımcılara açık kalır.") : "Katılım kapandı. Albüm ve akış yalnız katılımcılara açık."}</span>
            </div>
          )}
          {!cancelled && !ended && !joined && !polling && !pendingApproval && ready && (
            <div className="flex flex-col items-center gap-4 md:hidden">
              <span className="display text-xl tracking-normal">Geliyor musun?</span>
              <RsvpButtons size={104} accentFg="#160804" selected={null} onSelect={(s) => setFlow(s)} variant={plan.rsvpStyle} allowMaybe={plan.allowMaybe} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {joined ? (
              <>
                <span className={chip}>TSİ</span>
                {!ended && <CalendarMenu plan={plan} full />}
                <button type="button" aria-label="Davet et" title="Davet et" onClick={share} className="flex size-10 items-center justify-center rounded-pill border border-ink/28 bg-ink/8"><SendIcon size={16} /></button>
                {viewer && (
                  <button type="button" aria-pressed={state.muted} disabled={busy} onClick={() => toggle(() => mutePlan(plan.code, !state.muted))} title={state.muted ? "Bildirimleri aç" : "Duyuru ve hatırlatmaları sessize al"} className={state.muted ? chip : "flex size-10 items-center justify-center rounded-pill border border-white/28 bg-white/8"}>
                    {state.muted ? <><BellOffIcon size={16} /> Sessizde</> : <><BellIcon size={16} /><span className="sr-only">Sessize al</span></>}
                  </button>
                )}
              </>
            ) : (
              !cancelled && !ended && !preview && <RemindLaterMenu code={plan.code} startsAt={plan.dateTbd ? undefined : plan.startsAt} remindAt={state.remindAt} signedIn={!!viewer} chipClass={chip} />
            )}
          </div>

          <section className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5 text-[17px] opacity-85"><CrownIcon size={20} /> Düzenleyenler</div>
            <div className="flex items-center gap-3.5">
              <div className="flex">{plan.hosts.map((h, i) => <Avatar key={h.id} initials={h.initials} gradient={h.gradient} size={52} square ring="rgba(0,0,0,0.35)" className={i ? "-ml-3" : ""} />)}</div>
              <div className="flex grow flex-col"><span className="text-lg font-bold">{hostNames}</span><span className="text-sm opacity-75">{state.followers > 0 ? `${state.followers} takipçi` : plan.hosts.length > 1 ? "Düzenleyenler" : "Düzenleyen"}</span></div>
              {joined && !preview ? (
                <button type="button" onClick={async () => { const r = await openConversation(plan.code, plan.hosts[0]!.id); if (r.ok) router.push(`${routes.messages}?s=${r.id}`); }} className={chip}>Düzenleyene yaz</button>
              ) : (
                viewer ? (
                  <button type="button" aria-pressed={state.following} disabled={busy || preview} onClick={() => toggle(() => followHosts(plan.code, !state.following))} className={chip}>
                    {state.following ? <><CheckIcon size={16} /> Takip ediliyor</> : "Takip et"}
                  </button>
                ) : (
                  <Link href={loginHref} className={chip}>Takip et</Link>
                )
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
            <div className="glass flex flex-col gap-3 rounded-xl px-4.5 py-4">
              <div className="flex items-center gap-3.5">
                <span className="flex size-11 items-center justify-center rounded-md font-poster text-base font-extrabold text-bg" style={{ background: t.accent }}>₺</span>
                <span className="flex grow flex-col">
                  <span className="text-[17px] font-bold">{plan.cost.mode === "fixed" && plan.cost.amountTry ? `Kişi başı ${formatTry(plan.cost.amountTry)}` : "Gönlünden ne koparsa"} · Masrafı böl</span>
                  <span className="text-sm opacity-80">{viewerGuest?.paid ? "Gönderdin · düzenleyen görüyor" : "Gönderince işaretle; doğrulama yok"}</span>
                </span>
                {!preview && (
                  <button type="button" onClick={async () => { await markPaid(plan.code, !viewerGuest?.paid); router.refresh(); }} className={`h-10 shrink-0 rounded-pill px-4 text-sm font-bold ${viewerGuest?.paid ? "border border-ink/35 bg-ink/8" : "bg-white text-bg"}`}>
                    {viewerGuest?.paid ? "Geri al" : "Gönderdim"}
                  </button>
                )}
              </div>
              {(plan.cost.iban || plan.cost.papara || plan.cost.note) && (
                <div className="flex flex-col gap-1 rounded-lg bg-surface/35 px-3.5 py-2.5 text-sm">
                  {plan.cost.iban && <span className="flex flex-wrap items-center gap-2"><span className="opacity-70">IBAN</span><code className="font-semibold">{plan.cost.iban}</code><button type="button" onClick={() => navigator.clipboard?.writeText(plan.cost.iban!)} className="text-xs font-bold" style={{ color: t.accent }}>Kopyala</button></span>}
                  {plan.cost.papara && <span className="flex items-center gap-2"><span className="opacity-70">Papara</span><code className="font-semibold">{plan.cost.papara}</code></span>}
                  {plan.cost.note && <span className="opacity-80">Açıklama: {plan.cost.note}</span>}
                </div>
              )}
            </div>
          )}

          <section className="flex flex-col gap-3.5">
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-0.5">
                <h2 className="display text-[26px] tracking-tight">Katılımcılar</h2>
                {plan.showGuestCount && <span className="text-base opacity-85">{counts.going} geliyor · {counts.maybe} belki{joined ? ` · ${counts.no} gelemiyor` : ""}</span>}
              </div>
              {joined && <button type="button" onClick={() => setListOpen(true)} className={chip}>Tümünü gör</button>}
            </div>
            <AvatarStack items={plan.guests.slice(0, joined ? 6 : 4)} ring="rgba(0,0,0,0.35)" more={Math.max(0, plan.guests.length - (joined ? 6 : 4))} />
            {!joined && (
              <div className="flex flex-col items-start gap-3 rounded-xl border border-ink/12 bg-surface/55 p-5">
                <span className="flex items-center gap-2 text-[17px] font-bold"><LockIcon size={18} /> Katılımcılara özel</span>
                <p className="text-[15px] leading-relaxed opacity-85">Kimlerin geldiğini, yorumları ve fotoğraf albümünü yalnızca katılımını bildirenler görür.</p>
                <div className="flex flex-wrap gap-2">
                  {!cancelled && !ended && <button type="button" onClick={() => setFlow("going")} className="h-11 rounded-pill bg-contrast px-4.5 text-[15px] font-bold text-on-contrast">Katılımını bildir</button>}
                  <Link href={routes.login} className="flex h-11 items-center px-3.5 text-[15px] font-bold">Zaten bildirdin mi? Giriş yap</Link>
                </div>
              </div>
            )}
          </section>

          {joined && <GuestListSheet open={listOpen} onClose={() => setListOpen(false)} guests={plan.guests} />}
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
                        {f.text && <span className="rounded-[4px_14px_14px_14px] bg-ink/10 px-3.5 py-2.5 text-base">{f.text}</span>}
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
          ) : cancelled ? (
            <span className="max-w-[300px] text-center text-sm opacity-75">Plan iptal edildiği için katılım kapalı.</span>
          ) : ended && !joined ? (
            <span className="max-w-[300px] text-center text-sm opacity-75">Plan sona erdiği için katılım kapalı.</span>
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
                  {!ended && <button type="button" onClick={() => setFlow(rsvp!.status === "maybe" || rsvp!.status === "no" ? rsvp!.status : "going")} className="w-fit text-sm font-bold" style={{ color: t.accent }}>Değiştir</button>}
                </div>
              </div>
              {!ended && <button type="button" onClick={share} className="flex h-12 items-center justify-center gap-2.5 rounded-pill bg-contrast text-[15px] font-extrabold text-on-contrast"><SendIcon /> Arkadaşlarını davet et</button>}
            </div>
          )}
          {ended ? null : joined ? (
            <CalendarMenu plan={plan} full variant="card" className="w-full" />
          ) : (
            <div className="glass flex w-full items-center gap-3 rounded-xl p-4">
              <span className="flex size-11 items-center justify-center rounded-md bg-ink/10"><CalendarIcon /></span>
              <span className="flex grow flex-col"><span className="text-[15px] font-bold">Takvime ekle</span><span className="text-[13px] opacity-80">Google · Apple · .ics</span></span>
              <span className="text-[13px] opacity-70">Katılım sonrası</span>
            </div>
          )}
        </aside>
      </div>

      {joined && !ended && (
        <div className="fixed inset-x-4 bottom-6 flex h-[60px] items-center gap-1.5 rounded-pill bg-bg p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] md:hidden">
          <button type="button" onClick={() => setFlow(rsvp!.status === "maybe" || rsvp!.status === "no" ? rsvp!.status : "going")} className="flex h-12 grow items-center justify-center gap-2 rounded-pill text-[15px] font-extrabold text-[#160804]" style={{ background: "radial-gradient(circle at 35% 30%, #FFE3A8 0%, #FFB547 45%, #FF7A3D 100%)" }}>
            <CheckIcon size={18} /> {rsvpLabel[rsvp!.status as RsvpStatus]} <ChevronDownIcon size={16} />
          </button>
          <button type="button" onClick={share} className="flex h-12 items-center gap-2 rounded-pill bg-white/12 px-4 text-sm font-bold text-white"><SendIcon size={16} /> Davet et</button>
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
