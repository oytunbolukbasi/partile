"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatPill, initials as toInitials } from "@partile/core";
import { Avatar } from "@/components/plan/Avatar";
import { Poster } from "@/components/plan/Poster";
import { TabBar } from "@/components/shell/TabBar";
import { CameraIcon, PlusIcon } from "@/components/shell/icons";
import { Modal, btnGhost, btnPrimary, field, modalFooter } from "@/components/ui/Modal";
import { SettingRow, Toggle } from "@/components/ui/Toggle";
import { countByStatus, gradientFor, type Plan, type PlanRole } from "@partile/core";
import { deleteMyAccount, followUser, signOut, updateProfile } from "@/app/actions";
import type { Viewer } from "@/lib/auth";
import { routes } from "@/lib/routes";

type Person = { id: string; name: string; initials: string; gradient: string; shared: number };
type Followed = Person & { upcoming: number };

/** `Profile` artboard: own profile. Account settings (e-mail, notifications, sign-out) open from here, not from the rail. */
export function ProfileView({ viewer, plans, people, following, followers }: { viewer: Viewer; plans: { plan: Plan; role: PlanRole }[]; people: Person[]; following: Followed[]; followers: number }) {
  const router = useRouter();
  const [, start] = useTransition();
  const update = (p: { name?: string; bio?: string; birthday?: string; notifications?: boolean }) => start(async () => { await updateProfile(p); router.refresh(); });
  const session = viewer;
  const ready = true;
  const [showAll, setShowAll] = useState(false);
  const mutuals = showAll ? people : people.slice(0, 5);
  const me = { gradient: gradientFor(viewer.id) };
  const [modal, setModal] = useState<"edit" | "account" | "delete" | null>(null);
  const name = session.name || "Adsız";
  const bio = session.bio ?? "";
  const ini = toInitials(name);
  const hosted = plans.filter((x) => x.role === "host");
  const upcoming = plans.filter((x) => x.plan.startsAt && new Date(x.plan.startsAt).getTime() > Date.now());

  const btn = "flex h-12 items-center gap-2 rounded-pill border border-white/30 bg-white/6 px-5 text-[15px] font-bold";
  const card = "flex items-center gap-3.5 rounded-xl border border-white/8 bg-white/5 px-4 py-4 md:px-5";

  return (
    <main className="relative min-h-dvh overflow-x-hidden pb-28 md:pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] aura-top" aria-hidden />
      <div className="relative flex flex-col items-center gap-3.5 px-4 pt-16 text-center md:pt-[90px]">
        <span className="relative">
          <Avatar initials={ini} gradient={me.gradient} size={160} className="display text-[56px] tracking-normal shadow-[0_20px_50px_rgba(0,0,0,0.45)]" />
          <button type="button" aria-label="Fotoğraf değiştir" title="Yakında" className="absolute -right-1 bottom-1 flex size-12 items-center justify-center rounded-pill border-[3px] border-bg bg-white text-bg"><CameraIcon size={20} /></button>
        </span>
        <h1 className="display text-[32px] tracking-tight md:text-[40px]">{name}</h1>
        <p className="max-w-[520px] text-muted">{bio || <button type="button" onClick={() => setModal("edit")} className="font-bold text-subtle">Kısa bir tanıtım ekle</button>}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[15px] text-subtle">
          <span>Eyl ’26’da katıldı</span><span>·</span><span><strong className="text-text">{hosted.length}</strong> plan düzenledi</span><span>·</span><span><strong className="text-text">{people.length}</strong> ortak arkadaş</span><span>·</span><span><strong className="text-text">{followers}</strong> takipçi</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5 pt-1.5">
          <button type="button" onClick={() => setModal("edit")} className={btn}>Profili düzenle</button>
        </div>
      </div>

      <div className="relative mt-10 grid gap-8 px-4 md:mt-16 md:grid-cols-[1.4fr_1fr] md:gap-10 md:px-14">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between"><h2 className="text-[22px] font-bold tracking-tight md:text-[26px]">Yaklaşan planlar</h2><span className="text-sm text-subtle">Yalnızca herkese açık olanlar profilde görünür</span></div>
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            {upcoming.map(({ plan }) => {
              const c = countByStatus(plan.guests);
              return (
                <Link key={plan.code} href={routes.plan(plan.code)} className="flex w-[180px] shrink-0 flex-col gap-2.5 md:w-[220px]">
                  <span className="relative">
                    <Poster themeId={plan.themeId} text={plan.posterText ?? ""} src={plan.posterUrl} className="w-full rounded-[14px]" />
                    {plan.startsAt && <span className="absolute left-2 top-2 flex h-[26px] items-center rounded-pill bg-bg/70 px-2.5 text-xs font-bold text-white">{formatPill(plan.startsAt).split(" ·")[0]}</span>}
                  </span>
                  <span className="text-[17px] font-bold tracking-tight">{plan.title}</span>
                  <span className="text-[13px] text-subtle">{plan.visibility === "public" ? "Herkese açık" : "Gizli"} · {c.going} geliyor</span>
                </Link>
              );
            })}
            <Link href={routes.create} className="flex h-[180px] w-[180px] shrink-0 flex-col items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-white/30 text-[15px] font-bold md:h-[220px] md:w-[220px]"><PlusIcon size={22} /> Yeni plan</Link>
          </div>
        </section>
        <section id="ortak-arkadaslar" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between"><h2 className="text-[22px] font-bold tracking-tight md:text-[26px]">Ortak arkadaşlar</h2>{people.length > 5 && <button type="button" onClick={() => setShowAll(!showAll)} className="text-sm font-bold text-muted">{showAll ? "Daha az" : `Tümü (${people.length})`}</button>}</div>
          <div className="flex flex-col rounded-2xl border border-white/8 bg-white/5">
            {mutuals.length === 0 && <p className="px-4 py-6 text-sm text-subtle">Henüz ortak arkadaş yok. Aynı plana katıldığın kişiler burada birikir.</p>}
            {mutuals.map((m) => (
              <div key={m.id} className="flex items-center gap-3 border-b border-white/6 px-4 py-3 last:border-b-0">
                <Avatar initials={m.initials} gradient={m.gradient} size={44} />
                <span className="flex grow flex-col"><span className="font-bold">{m.name}</span><span className="text-[13px] text-subtle">{m.shared} ortak plan</span></span>
                <Link href={routes.create} className="flex h-9 items-center rounded-pill border border-white/25 px-3.5 text-[13px] font-bold">Davet et</Link>
              </div>
            ))}
          </div>
          <FollowingList following={following} />
        </section>
      </div>

      <div className="relative mt-8 flex flex-col gap-3 px-4 md:mt-12 md:flex-row md:px-14">
        <div className={`${card} grow`}>
          <span className="flex flex-col"><span className="font-bold">{session.birthday ? `Doğum günün: ${session.birthday}` : "Doğum günün ne zaman?"}</span><span className="text-sm text-subtle">Zamanı gelince sana plan fikirleri gönderelim.</span></span>
          <button type="button" onClick={() => setModal("edit")} className="ml-auto h-10 shrink-0 rounded-pill bg-white px-4 text-sm font-bold text-bg">{session.birthday ? "Değiştir" : "Ekle"}</button>
        </div>
        <div className={`${card} text-sm text-subtle`}>
          E-posta · yalnızca sen görürsün · <button type="button" onClick={() => setModal("account")} className="font-bold text-muted">Hesap ayarları</button>
        </div>
      </div>
      <TabBar initials={ini} />

      <DeleteAccountModal open={modal === "delete"} onClose={() => setModal("account")} ownedPlans={hosted.filter((x) => x.plan.hosts.find((h) => h.owner)?.id === viewer.id).length} />
      <EditProfileModal open={modal === "edit"} onClose={() => setModal(null)} name={name} bio={bio} birthday={session.birthday ?? ""} onSave={(p) => { update(p); setModal(null); }} />
      <Modal open={modal === "account"} onClose={() => setModal(null)} title="Hesap ayarları" width={560}>
        <div className="flex flex-col">
          <SettingRow title="E-posta" hint="Giriş ve bildirimler için. Düzenleyenlere gösterilmez.">
            <span className="text-sm font-semibold text-muted">{ready ? session.email : ""}</span>
          </SettingRow>
          <SettingRow title="Katılım ve hatırlatma bildirimleri" hint="Uygulama içi + e-posta">
            <Toggle checked={session.notifications} onChange={(v) => update({ notifications: v })} label="Bildirimler" />
          </SettingRow>
          <SettingRow title="Takvim" hint="Katıldığın planlar takvimine düşsün (.ics)">
            <span className="text-sm font-semibold text-subtle">Yakında</span>
          </SettingRow>
          <SettingRow title="Verilerim" hint="KVKK kapsamında verilerini indir ya da hesabını sil">
            <span className="flex flex-wrap justify-end gap-2">
              <a href="/api/verilerim" download className="flex h-9 items-center rounded-pill border border-white/25 px-3.5 text-[13px] font-bold">İndir</a>
              <button type="button" onClick={() => setModal("delete")} className="flex h-9 items-center rounded-pill border border-white/25 px-3.5 text-[13px] font-bold text-coral">Hesabımı sil</button>
            </span>
          </SettingRow>
        </div>
        <div className={modalFooter}>
          <button type="button" onClick={() => start(async () => { await signOut(); router.push(routes.landing); router.refresh(); })} className={`${btnGhost} text-[#FF8C6B]`}>Çıkış yap</button>
          <button type="button" onClick={() => setModal(null)} className={btnPrimary}>Tamam</button>
        </div>
      </Modal>
    </main>
  );
}

function EditProfileModal({ open, onClose, name, bio, birthday, onSave }: { open: boolean; onClose: () => void; name: string; bio: string; birthday: string; onSave: (p: { name: string; bio: string; birthday?: string }) => void }) {
  const [n, setN] = useState(name);
  const [b, setB] = useState(bio);
  const [d, setD] = useState(birthday);
  const [seed, setSeed] = useState(open);
  if (seed !== open) {
    setSeed(open);
    setN(name);
    setB(bio);
    setD(birthday);
  }
  return (
    <Modal open={open} onClose={onClose} title="Profili düzenle" width={560}>
      <div className="flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1.5"><span className="text-[13px] font-bold">Ad Soyad</span><input data-autofocus value={n} onChange={(e) => setN(e.target.value)} className={field} /></label>
        <label className="flex flex-col gap-1.5"><span className="text-[13px] font-bold">Kısa tanıtım</span><input value={b} onChange={(e) => setB(e.target.value)} maxLength={120} className={field} /></label>
        <label className="flex flex-col gap-1.5"><span className="text-[13px] font-bold">Doğum günü <span className="font-medium text-subtle">(GG / AA)</span></span><input value={d} onChange={(e) => setD(e.target.value)} inputMode="numeric" placeholder="17 / 10" className={field} /></label>
      </div>
      <div className={modalFooter}>
        <button type="button" onClick={onClose} className={btnGhost}>Vazgeç</button>
        <button type="button" onClick={() => n.trim() && onSave({ name: n.trim(), bio: b.trim(), birthday: d.trim() || undefined })} className={btnPrimary}>Kaydet</button>
      </div>
    </Modal>
  );
}

/** Takip ettiklerin: hosts the viewer follows; unfollow in place. New public plans from them show up in Bildirimler. */
function FollowingList({ following }: { following: Followed[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const toggle = async (id: string, follow: boolean) => {
    setBusy(id);
    await followUser(id, follow);
    setBusy(null);
    router.refresh();
  };
  return (
    <>
      <div id="takip" className="flex items-baseline justify-between pt-4"><h2 className="text-[22px] font-bold tracking-tight md:text-[26px]">Takip ettiklerin</h2><span className="text-sm text-subtle">{following.length} kişi</span></div>
      <div className="flex flex-col rounded-2xl border border-white/8 bg-white/5">
        {following.length === 0 && <p className="px-4 py-6 text-sm text-subtle">Kimseyi takip etmiyorsun. Bir davetiyede “Takip et” dersen, o kişi herkese açık plan yayınlayınca haber veririz.</p>}
        {following.map((f) => (
          <div key={f.id} className="flex items-center gap-3 border-b border-white/6 px-4 py-3 last:border-b-0">
            <Avatar initials={f.initials} gradient={f.gradient} size={44} />
            <span className="flex min-w-0 grow flex-col"><span className="truncate font-bold">{f.name}</span><span className="text-[13px] text-subtle">{f.upcoming > 0 ? `${f.upcoming} yaklaşan herkese açık plan` : "Yaklaşan herkese açık planı yok"}</span></span>
            <button type="button" disabled={busy === f.id} onClick={() => toggle(f.id, false)} className="flex h-9 shrink-0 items-center rounded-pill border border-white/25 px-3.5 text-[13px] font-bold disabled:opacity-50">Takibi bırak</button>
          </div>
        ))}
      </div>
    </>
  );
}

/** KVKK: permanent account deletion, confirmed by typing SİL. */
function DeleteAccountModal({ open, onClose, ownedPlans }: { open: boolean; onClose: () => void; ownedPlans: number }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = text.trim().toLocaleUpperCase("tr-TR") === "SİL";
  const submit = async () => {
    setBusy(true);
    setError(null);
    const r = await deleteMyAccount(text);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    router.push(routes.landing);
    router.refresh();
  };
  return (
    <Modal open={open} onClose={onClose} title="Hesabımı sil" width={560}>
      <div className="flex flex-col gap-4 p-5 text-[15px] leading-relaxed">
        <p className="text-muted">Bu işlem geri alınamaz. Silinecekler:</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted">
          <li>{ownedPlans > 0 ? <><strong className="text-text">Oluşturduğun {ownedPlans} plan</strong>, misafir listeleri, akışları ve albümleriyle. Yaklaşan planların misafirlerine iptal e-postası gider.</> : "Oluşturduğun planlar (şu an yok)."}</li>
          <li>Başka planlardaki katılımların, yorumların, fotoğrafların ve mesajların.</li>
          <li>Profilin, bildirimlerin, takip ve hatırlatma tercihlerin.</li>
        </ul>
        <p className="text-muted">Önce verilerini indirmek istersen <a href="/api/verilerim" download className="font-bold text-text underline">buradan indir</a>.</p>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold">Onaylamak için <span className="text-coral">SİL</span> yaz</span>
          <input data-autofocus value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" className={field} />
        </label>
        {error && <span role="alert" className="text-sm font-bold text-coral">{error}</span>}
      </div>
      <div className={modalFooter}>
        <button type="button" onClick={onClose} className={btnGhost}>Vazgeç</button>
        <button type="button" disabled={!ready || busy} onClick={submit} className="flex h-12 items-center rounded-pill bg-coral px-6 text-[15px] font-extrabold text-bg disabled:opacity-40">
          {busy ? "Siliniyor…" : "Hesabımı kalıcı olarak sil"}
        </button>
      </div>
    </Modal>
  );
}
