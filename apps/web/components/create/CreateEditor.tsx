"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDayLong, formatTimeRange, formatTry } from "@partile/core";
import { themeById, titleFonts } from "@partile/ui-tokens";
import { Poster } from "@/components/plan/Poster";
import { RsvpButtons } from "@/components/plan/RsvpButtons";
import { ThemeSurface } from "@/components/plan/ThemeSurface";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChevronDownIcon,
  CrownIcon,
  EyeIcon,
  LockIcon,
  PencilIcon,
  PinIcon,
  SettingsIcon,
  SparklesIcon,
  TagIcon,
  UsersIcon,
} from "@/components/shell/icons";
import { useDraft } from "@/lib/draft";
import { titleFontStyle } from "@/lib/fonts";
import { routes } from "@/lib/routes";
import { DatePickerModal } from "./DatePickerModal";
import { PollModal } from "./PollModal";
import { PreviewOverlay } from "./PreviewOverlay";
import { LocationModal } from "./LocationModal";
import { PosterModal } from "./PosterModal";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { publishDraft, savePlan } from "@/app/actions";
import type { Viewer } from "@/lib/auth";
import type { Plan } from "@partile/core";
import { SettingsModal, type SettingsTab } from "./SettingsModal";
import { ThemePanel } from "./ThemePanel";
import { EffectPanel } from "./EffectPanel";
import { RsvpStyleMenu } from "./RsvpStyleMenu";

const glassRow = "glass flex h-[52px] items-center gap-3 rounded-lg px-4 text-left";
const chip = "glass h-[38px] rounded-pill px-3.5 text-[15px] font-semibold";

/** Plan editor — `Create` / `CreateMobile` artboards. Draft persists in the browser. */
export function CreateEditor({ viewer, existing, autoPublish = false }: { viewer: Viewer | null; existing?: Plan; autoPublish?: boolean }) {
  const { draft, patch, reset, savedAt } = useDraft(existing);
  const router = useRouter();
  const [publishing, startPublish] = useTransition();
  const [publishError, setPublishError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [panel, setPanel] = useState<"theme" | "effect" | null>("theme");
  const [sheet, setSheet] = useState<"theme" | "effect" | null>(null);
  const [modal, setModal] = useState<"date" | "poll" | "location" | "poster" | "settings" | null>(null);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("rsvp");
  // Signed-out hosts verify their e-mail first; the draft stays in the browser and publishes on return (?yayinla=1).
  const loginHref = `${routes.login}?next=${encodeURIComponent(`${routes.create}?yayinla=1`)}`;
  const publish = () =>
    startPublish(async () => {
      if (existing) {
        const r = await savePlan(existing.code, draft);
        if (!r.ok) return setPublishError("Kaydedilemedi.");
        router.push(routes.plan(existing.code));
        router.refresh();
        return;
      }
      const r = await publishDraft(draft);
      if (!r.ok) return setPublishError(r.error);
      reset();
      router.push(`${routes.plan(r.code)}?paylas=1`);
      router.refresh();
    });
  useEffect(() => {
    if (autoPublish && viewer && !existing && draft.title !== "Planın adı") publish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPublish, viewer, draft.title]);
  const publishLabel = existing ? "Kaydet" : publishing ? "Yayınlanıyor…" : "Yayınla ve paylaş";
  const openSettings = (t: SettingsTab) => {
    setSettingsTab(t);
    setModal("settings");
  };
  const theme = themeById(draft.themeId);
  const posterText = draft.posterText ?? draft.title.match(/\d+/)?.[0] ?? draft.title.slice(0, 1).toLocaleUpperCase("tr-TR");

  const dateLabel = draft.poll?.length ? "Misafirlere sor: hangi gün?" : draft.dateTbd ? "Tarih netleşmedi" : draft.startsAt ? formatDayLong(draft.startsAt) : "Tarih seç…";
  const timeLabel = draft.poll?.length ? `${draft.poll.length} seçenek · misafirler oy verir` : draft.startsAt && !draft.dateTbd ? `${formatTimeRange(draft.startsAt, draft.endsAt)} · TSİ` : "Saat ve süre";
  const locationLabel = draft.location?.district ?? draft.location?.name ?? "Konum ekle";

  const toolbar = (
    <div className="glass-menu flex w-[100px] flex-col items-center gap-4.5 rounded-2xl py-4 text-text">
        <button type="button" onClick={() => setPanel(panel === "theme" ? null : "theme")} aria-pressed={panel === "theme"} className="flex w-[84px] flex-col items-center gap-1.5 py-1.5 text-[13px] font-semibold">
          <span className="size-10 rounded-pill border-2 border-white shadow-[0_0_0_3px_rgba(255,255,255,0.15)]" style={{ background: theme.poster }} />
          Tema
        </button>
        <button type="button" onClick={() => setPanel(panel === "effect" ? null : "effect")} aria-pressed={panel === "effect"} className={`flex w-[84px] flex-col items-center gap-1.5 py-1.5 text-[13px] font-semibold ${panel === "effect" ? "" : "text-muted"}`}>
          <span className={`flex size-10 items-center justify-center rounded-pill text-white ${panel === "effect" ? "border-2 border-white shadow-[0_0_0_3px_rgba(255,255,255,0.15)]" : ""}`} style={{ background: "radial-gradient(circle at 40% 40%, #FFD166, #FF6A3D 55%, #3F0D06)" }}>
            <SparklesIcon />
          </span>
          Efekt
        </button>
        <button type="button" onClick={() => openSettings("rsvp")} className="flex w-[84px] flex-col items-center gap-1.5 py-1.5 text-[13px] font-semibold text-muted">
          <span className="flex size-10 items-center justify-center"><SettingsIcon /></span>
          Ayarlar
        </button>
        <button type="button" onClick={() => setPreview(true)} className="flex w-[84px] flex-col items-center gap-1.5 py-1.5 text-[13px] font-semibold text-muted">
          <span className="flex size-10 items-center justify-center"><EyeIcon /></span>
          Önizle
        </button>
    </div>
  );

  return (
    <ThemeSurface themeId={draft.themeId} className="relative min-h-dvh">
      {/* top bar */}
      <div className="flex h-[60px] items-center justify-between px-4 md:absolute md:right-10 md:top-[18px] md:h-auto md:justify-end md:px-0">
        <Link href={routes.home} className="text-[15px] font-bold md:hidden">
          Vazgeç
        </Link>
        <span className="display text-base tracking-normal md:hidden">Yeni plan</span>
        <span className="glass hidden h-11 items-center rounded-pill px-4 text-sm font-semibold md:flex">
          {savedAt ? `Taslak kaydedildi · ${savedAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}` : "Taslak"}
        </span>
        <span className="text-xs opacity-80 md:hidden">{savedAt ? "Kaydedildi" : "Taslak"}</span>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-44 pt-3 md:flex-row md:items-start md:justify-center md:gap-6 md:px-6 md:pb-40 md:pr-[380px] md:pt-[120px] xl:pr-6 2xl:gap-8">
        {/* left column */}
        <div className="flex w-full max-w-[420px] flex-col gap-3.5 2xl:max-w-[460px]">
          <div className="glass flex flex-col gap-3 rounded-2xl px-3 pb-3 pt-3.5">
            <label htmlFor="title" className="sr-only">
              Planın adı
            </label>
            <input
              id="title"
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              onFocus={(e) => e.target.select()}
              className="w-full bg-transparent px-1 text-center text-[40px] leading-[1.05] text-current outline-none placeholder:opacity-50 md:text-left md:text-[60px] md:leading-none"
              style={titleFontStyle(draft.titleFont)}
              placeholder="Planın adı"
              maxLength={80}
            />
            <div role="group" aria-label="Başlık fontu" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
              {titleFonts.map((f) => {
                const sel = f.id === draft.titleFont;
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={sel}
                    onClick={() => patch({ titleFont: f.id })}
                    className={`glass h-10 shrink-0 rounded-pill px-4 text-current ${sel ? "border-[1.5px] !border-current" : ""}`}
                    style={{ ...titleFontStyle(f.id), fontSize: f.id === "sik" ? 22 : f.id === "zarif" ? 18 : f.id === "dijital" ? 14 : 16, textTransform: "none" }}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>

          <Poster themeId={draft.themeId} text={posterText} src={draft.posterUrl} topLeft="PARTİLE" className="w-full md:hidden" numeralSize="50%" />
          <button type="button" onClick={() => setModal("poster")} className="absolute right-7 top-[430px] flex h-11 items-center gap-1.5 rounded-pill bg-white px-4 text-sm font-bold text-bg shadow-[0_8px_24px_rgba(0,0,0,0.3)] md:hidden">
            <PencilIcon /> Düzenle
          </button>

          <button type="button" onClick={() => setModal(draft.poll?.length ? "poll" : "date")} className="glass flex h-[72px] items-center justify-between rounded-xl px-5 text-left">
            <span className="flex flex-col gap-0.5">
              <span className="display text-[22px] tracking-tight">{dateLabel}</span>
              <span className="text-[15px] opacity-80">{timeLabel}</span>
            </span>
            <CalendarIcon />
          </button>
          <div className="text-center text-base opacity-90">
            Karar veremedin mi? <button type="button" className="font-bold underline-offset-2 hover:underline">Misafirlere sor: hangi gün? →</button>
          </div>

          <div className="glass flex flex-col rounded-xl">
            <div className="flex items-center gap-3 border-b border-[var(--glass-line)] px-4 py-3.5">
              <CrownIcon />
              <span className="text-[17px]">
                Düzenleyen <span className="opacity-60">(isteğe bağlı takma ad)</span>
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="flex size-11 items-center justify-center rounded-pill text-sm font-extrabold text-bg" style={{ background: "linear-gradient(135deg, #1EC9B0, #FFB020)" }}>
                OB
              </span>
              <span className="grow text-[17px] font-bold">Oytun Bölükbaşı</span>
              <button type="button" onClick={() => openSettings("hosts")} className="flex h-9 items-center gap-1.5 rounded-pill border border-current px-3.5 text-sm font-bold">
                + Ortak düzenleyen
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => setModal("location")} className={glassRow}>
              <PinIcon />
              <span className={`grow text-[17px] font-semibold ${draft.location ? "" : "opacity-75"}`}>{locationLabel}</span>
              <span className="text-[13px] opacity-70">Adres katılınca</span>
            </button>
            <button type="button" onClick={() => openSettings("rsvp")} className={glassRow}>
              <UsersIcon />
              <span className="grow text-[17px] opacity-75">{draft.capacity ? `${draft.capacity} kişilik kontenjan` : "Kontenjan yok"}</span>
            </button>
            <button type="button" onClick={() => openSettings("cost")} className={glassRow}>
              <TagIcon />
              <span className="grow text-[17px] font-semibold">{draft.cost.mode === "off" ? <span className="opacity-75">Kişi başı tutar</span> : draft.cost.amountTry ? `Kişi başı ${formatTry(draft.cost.amountTry)}` : "Gönlünden ne koparsa"}</span>
              {draft.cost.mode !== "off" && (
                <span className="flex h-[26px] items-center rounded-pill px-2.5 text-xs font-extrabold text-bg" style={{ background: theme.accent }}>
                  MASRAFI BÖL
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {["+ Link", "+ Çalma listesi", "+ Hediye listesi", "+ Kıyafet kodu"].map((l) => (
              <button key={l} type="button" className={chip}>
                {l}
              </button>
            ))}
          </div>

          <label htmlFor="desc" className="sr-only">
            Açıklama
          </label>
          <textarea
            id="desc"
            rows={3}
            value={draft.description ?? ""}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="Planını anlat: ne, nerede, neden güzel olacak?"
            className="glass resize-none rounded-xl px-4 py-3.5 text-base leading-relaxed text-current outline-none placeholder:opacity-50"
          />
          <div className="text-[15px] opacity-80">
            Anlatacak daha çok şey mi var? <button type="button" className="font-bold">+ Yeni bölüm</button>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <div className="text-[13px] font-bold uppercase tracking-wide opacity-70">Düzenleyen için hızlı ayarlar</div>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                ["Misafirlere sor", draft.questions.length ? `${draft.questions.length} soru` : "Kapalı", "questions"],
                ["Hatırlatmalar", draft.remindersEnabled ? "Açık" : "Kapalı", "reminders"],
                ["Katılım onayı", draft.requireApproval ? "Açık" : "Kapalı", "rsvp"],
                ["+1 misafir", draft.plusOnesMax ? `En fazla ${draft.plusOnesMax}` : "Kapalı", "rsvp"],
              ] as const).map(([l, s, t]) => (
                <button key={l} type="button" onClick={() => openSettings(t)} className="glass flex h-14 items-center justify-between gap-2 rounded-lg px-4 text-left">
                  <span className="text-[15px] font-bold">{l}</span>
                  <span className="shrink-0 text-[13px] opacity-70">{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* right column (desktop) */}
        <div className="hidden w-[358px] shrink-0 flex-col gap-4 md:flex">
          <div className="relative">
            <Poster themeId={draft.themeId} text={posterText} src={draft.posterUrl} topLeft="PARTİLE" bottomRight={draft.location?.district?.toLocaleUpperCase("tr-TR")} className="w-[358px] shadow-[0_30px_60px_rgba(0,0,0,0.35)]" numeralSize="50%" />
            <button type="button" onClick={() => setModal("poster")} className="absolute bottom-[60px] right-3.5 flex h-11 items-center gap-2 rounded-pill bg-white px-4.5 text-[15px] font-bold text-bg shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
              <PencilIcon /> Düzenle
            </button>
          </div>
          <div className="text-center text-sm opacity-75">Afiş için görsel sürükle-bırak · GIF, galeri ya da hazır tasarımlar</div>

          <div className="glass flex h-[60px] items-center gap-3 rounded-lg px-4">
            <SparklesIcon />
            <span className="grow text-[17px] font-semibold">Bu planı kim görebilir?</span>
            <button type="button" onClick={() => openSettings("audience")} className="glass flex h-10 items-center gap-2 rounded-md px-3.5 text-[15px] font-bold">
              <LockIcon size={14} /> {draft.visibility === "private" ? "Gizli" : "Herkese açık"} <ChevronDownIcon size={14} />
            </button>
          </div>

          <div className="glass flex flex-col gap-4.5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <SettingsIcon size={20} />
              <span className="grow text-[17px] font-semibold">Katılım seçenekleri</span>
              <RsvpStyleMenu value={draft.rsvpStyle} onChange={(rsvpStyle) => patch({ rsvpStyle })} />
            </div>
            <div className="flex justify-around">
              <RsvpButtons size={92} accentFg="#0C0C0D" variant={draft.rsvpStyle} allowMaybe={draft.allowMaybe} />
            </div>
          </div>
        </div>


        {/* xl+: panel and toolbar flow as columns; the whole row is centered so left/right margins match */}
        {panel && (
          <div className="glass-menu sticky top-[126px] hidden w-[220px] shrink-0 rounded-2xl p-3.5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] xl:block">
            {panel === "theme" ? <ThemePanel value={draft.themeId} onChange={(id) => patch({ themeId: id })} /> : <EffectPanel value={draft.effect} onChange={(effect) => patch({ effect })} />}
          </div>
        )}
        <div className="sticky top-[126px] hidden shrink-0 xl:block">{toolbar}</div>
      </div>

      {/* theme panel (desktop, below 2xl): fixed, left of the fixed toolbar */}
      {panel && (
        <div className="glass-menu fixed right-[160px] top-[126px] hidden w-[220px] rounded-2xl p-3.5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] md:block xl:hidden">
          {panel === "theme" ? <ThemePanel value={draft.themeId} onChange={(id) => patch({ themeId: id })} /> : <EffectPanel value={draft.effect} onChange={(effect) => patch({ effect })} />}
        </div>
      )}

      {/* desktop toolbar (fixed below 2xl; in-flow column at 2xl+) */}
      <div className="fixed right-10 top-[126px] hidden md:block xl:hidden">{toolbar}</div>

      {/* desktop actions */}
      <div className="fixed bottom-10 right-10 hidden gap-2.5 md:flex relative">
        <Link href={routes.home} className="flex h-14 items-center rounded-pill border border-white/30 bg-bg/55 px-5.5 text-base font-bold text-text">
          Taslağı kaydet
        </Link>
        {viewer ? (
          <button type="button" onClick={publish} disabled={publishing} className="flex h-14 items-center gap-2.5 rounded-pill bg-white px-6.5 text-base font-extrabold text-bg shadow-[0_12px_30px_rgba(0,0,0,0.35)] disabled:opacity-60">
            {publishLabel} <ArrowRightIcon size={18} />
          </button>
        ) : (
          <Link href={loginHref} className="flex h-14 items-center gap-2.5 rounded-pill bg-white px-6.5 text-base font-extrabold text-bg shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
            Yayınla ve paylaş <ArrowRightIcon size={18} />
          </Link>
        )}
        {publishError && <span className="absolute -top-8 right-0 text-sm font-bold text-[#FF8C6B]">{publishError}</span>}
      </div>

      {/* mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 flex flex-col gap-2.5 border-t border-white/10 bg-bg/88 px-4 pb-6 pt-2.5 text-text md:hidden">
        <div className="flex justify-around">
          <button type="button" onClick={() => setSheet(sheet === "theme" ? null : "theme")} className="flex w-[76px] flex-col items-center gap-1 text-xs font-semibold">
            <span className="size-8 rounded-pill border-2 border-white" style={{ background: theme.poster }} />
            Tema
          </button>
          <button type="button" onClick={() => setSheet(sheet === "effect" ? null : "effect")} className="flex w-[76px] flex-col items-center gap-1 text-xs font-semibold text-muted">
            <span className="size-8 rounded-pill" style={{ background: "radial-gradient(circle at 40% 40%, #FFD166, #FF6A3D 55%, #3F0D06)" }} />
            Efekt
          </button>
          <button type="button" onClick={() => openSettings("rsvp")} className="flex w-[76px] flex-col items-center gap-1 text-xs font-semibold text-muted">
            <SettingsIcon /> Ayarlar
          </button>
          <button type="button" onClick={() => setPreview(true)} className="flex w-[76px] flex-col items-center gap-1 text-xs font-semibold text-muted">
            <EyeIcon /> Önizle
          </button>
        </div>
        {viewer ? (
          <button type="button" onClick={publish} disabled={publishing} className="flex h-[54px] items-center justify-center gap-2 rounded-pill bg-white text-base font-extrabold text-bg disabled:opacity-60">
            {publishLabel} <ArrowRightIcon size={18} />
          </button>
        ) : (
          <Link href={loginHref} className="flex h-[54px] items-center justify-center gap-2 rounded-pill bg-white text-base font-extrabold text-bg">
            Yayınla ve paylaş <ArrowRightIcon size={18} />
          </Link>
        )}
        {sheet && (
          <div className="glass-menu -mx-4 -mb-6 rounded-t-[28px] px-5 pb-8 pt-3">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-pill bg-white/25" />
            {sheet === "theme" ? <ThemePanel value={draft.themeId} onChange={(id) => patch({ themeId: id })} onClose={() => setSheet(null)} /> : <EffectPanel value={draft.effect} onChange={(effect) => patch({ effect })} onClose={() => setSheet(null)} />}
          </div>
        )}
      </div>

      <DatePickerModal
        open={modal === "date"}
        onClose={() => setModal(null)}
        value={{ startsAt: draft.startsAt, endsAt: draft.endsAt, dateTbd: draft.dateTbd }}
        onSave={(v) => {
          patch({ ...v, poll: undefined });
          setModal(null);
        }}
        onPoll={() => setModal("poll")}
      />
      {preview && <PreviewOverlay draft={draft} viewer={viewer} code={existing?.code} onClose={() => setPreview(false)} />}
      <PollModal
        open={modal === "poll"}
        onClose={() => setModal(null)}
        draft={draft}
        onSave={(p) => {
          patch(p);
          setModal(null);
        }}
      />
      <LocationModal
        open={modal === "location"}
        onClose={() => setModal(null)}
        value={draft.location}
        onSave={(v) => {
          patch({ location: v });
          setModal(null);
        }}
      />
      <SettingsModal open={modal === "settings"} onClose={() => setModal(null)} initialTab={settingsTab} draft={draft} onSave={patch} />
      <PosterModal
        open={modal === "poster"}
        onClose={() => setModal(null)}
        onSave={(v) => {
          patch({ posterUrl: v.posterUrl, posterText: v.posterText, ...(v.themeId ? { themeId: v.themeId } : {}) });
          setModal(null);
        }}
      />
    </ThemeSurface>
  );
}
