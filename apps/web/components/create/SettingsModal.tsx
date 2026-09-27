"use client";

import { useState } from "react";
import type { PlanDraft, Question } from "@partile/core";
import { BellIcon, CalendarIcon, CrownIcon, ExploreIcon, LockIcon, TagIcon, UsersIcon } from "@/components/shell/icons";
import { Modal, btnGhost, btnPrimary, field, modalFooter } from "@/components/ui/Modal";
import { SettingRow, Toggle } from "@/components/ui/Toggle";

export type SettingsTab = "hosts" | "rsvp" | "cost" | "questions" | "privacy" | "audience" | "album" | "reminders";

const TABS: { id: SettingsTab; label: string; Icon: typeof CrownIcon }[] = [
  { id: "hosts", label: "Düzenleyenler", Icon: CrownIcon },
  { id: "rsvp", label: "Katılım", Icon: UsersIcon },
  { id: "cost", label: "Masrafı böl", Icon: TagIcon },
  { id: "questions", label: "Misafirlere sor", Icon: CalendarIcon },
  { id: "privacy", label: "Görünürlük & gizlilik", Icon: LockIcon },
  { id: "audience", label: "Kitle", Icon: ExploreIcon },
  { id: "album", label: "Fotoğraf albümü", Icon: CalendarIcon },
  { id: "reminders", label: "Hatırlatmalar", Icon: BellIcon },
];

const Select = ({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: [string, string][]; label: string }) => (
  <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 rounded-sm border border-white/18 bg-white/6 px-3 text-[15px] font-bold text-text outline-none">
    {options.map(([v, l]) => (
      <option key={v} value={v} className="bg-panel">
        {l}
      </option>
    ))}
  </select>
);

const Group = ({ children }: { children: React.ReactNode }) => <div className="rounded-lg border border-line bg-white/5">{children}</div>;
const H = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="flex flex-col gap-1">
    <h3 className="display text-[26px] tracking-tight">{title}</h3>
    {hint && <p className="text-[15px] text-subtle">{hint}</p>}
  </div>
);

const newId = () => Math.random().toString(36).slice(2, 8);

/** `Settings*` artboards: one modal, left tabs, per-tab content bound to the draft. Changes apply on Kaydet. */
export type HostRow = { id: string; name: string; initials: string; gradient: string; accepted?: boolean; owner?: boolean };
export type HostTools = { viewerId: string; hosts: HostRow[]; onInvite: (email: string) => Promise<{ ok: boolean; error?: string; devLink?: string; mailed?: boolean }>; onRemove: (userId: string) => void };

export function SettingsModal({ open, onClose, initialTab = "rsvp", draft, onSave, hostTools }: { open: boolean; onClose: () => void; initialTab?: SettingsTab; draft: PlanDraft; onSave: (patch: Partial<PlanDraft>) => void; hostTools?: HostTools }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState<{ text: string; link?: string; error?: boolean } | null>(null);
  const [inviting, setInviting] = useState(false);
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [d, setD] = useState<PlanDraft>(draft);
  const set = (p: Partial<PlanDraft>) => setD((x) => ({ ...x, ...p }));
  const setCost = (p: Partial<PlanDraft["cost"]>) => set({ cost: { ...d.cost, ...p } });
  const setQ = (id: string, p: Partial<Question>) => set({ questions: d.questions.map((q) => (q.id === id ? { ...q, ...p } : q)) });

  // Re-seed local state when the modal (re)opens on a different tab or draft.
  const [seed, setSeed] = useState({ open, initialTab });
  if (seed.open !== open || seed.initialTab !== initialTab) {
    setSeed({ open, initialTab });
    setTab(initialTab);
    setD(draft);
  }

  const poll = !!d.poll?.length;

  return (
    <Modal open={open} onClose={onClose} title="Plan ayarları" width={880}>
      <div className="flex flex-col md:flex-row">
        <nav aria-label="Ayar bölümleri" className="flex gap-1 overflow-x-auto border-b border-line p-3 md:w-[240px] md:shrink-0 md:flex-col md:border-b-0 md:border-r md:p-4">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`flex h-12 shrink-0 items-center gap-3 rounded-md px-3.5 text-left text-[15px] ${tab === id ? "bg-white/10 font-bold text-white" : "font-semibold text-muted hover:bg-white/5"}`}
            >
              <Icon size={18} />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </nav>

        <section className="flex min-h-[520px] grow flex-col gap-4.5 p-6 md:p-7">
          {tab === "hosts" && (
            <>
              <H title="Düzenleyenler" hint="Düzenleyenler planı değiştirebilir, katılımcıları görür, duyuru gönderir. E-posta adresleri kimseye görünmez." />
              {hostTools ? (
                <>
                  <div className="flex flex-col gap-3">
                    {hostTools.hosts.map((h) => (
                      <div key={h.id} className="flex items-center gap-3.5">
                        <span className="flex size-[52px] items-center justify-center rounded-pill text-base font-extrabold text-bg" style={{ background: h.gradient }}>{h.initials}</span>
                        <span className="flex grow flex-col">
                          <span className="text-[17px] font-bold">{h.id === hostTools.viewerId ? `${h.name} · Sen` : h.name}</span>
                          <span className="text-sm text-subtle">{h.owner ? "Oluşturan" : h.accepted ? "Ortak düzenleyen" : "Davet gönderildi · kabul bekliyor"}</span>
                        </span>
                        {!h.owner && hostTools.hosts.some((x) => x.owner && x.id === hostTools.viewerId) && (
                          <button type="button" onClick={() => hostTools.onRemove(h.id)} className={`${btnGhost} h-10 px-4 text-sm`}>Çıkar</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex flex-col gap-2 rounded-lg border border-line bg-white/5 p-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!inviteEmail.trim() || inviting) return;
                      setInviting(true);
                      const r = await hostTools.onInvite(inviteEmail);
                      setInviting(false);
                      if (!r.ok) return setInviteMsg({ text: r.error ?? "Davet gönderilemedi.", error: true });
                      setInviteEmail("");
                      setInviteMsg({ text: r.mailed ? "Davet e-postası gönderildi. Kabul edince listede görünür." : "Davet oluşturuldu. E-posta bağlı değil; geliştirme linkini paylaş:", link: r.devLink });
                    }}
                  >
                    <label htmlFor="cohost-email" className="text-[13px] font-bold">Ortak düzenleyen davet et</label>
                    <div className="flex gap-2">
                      <input id="cohost-email" type="email" inputMode="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="ad@ornek.com" className={`${field} h-11`} />
                      <button type="submit" disabled={inviting || !inviteEmail.trim()} className={`${btnPrimary} h-11 shrink-0 disabled:opacity-40`}>{inviting ? "Gönderiliyor…" : "Davet et"}</button>
                    </div>
                    {inviteMsg && (
                      <p className={`text-[13px] ${inviteMsg.error ? "font-bold text-[#FF8C6B]" : "text-muted"}`}>
                        {inviteMsg.text}{inviteMsg.link && <> <code className="break-all text-text">{inviteMsg.link}</code></>}
                      </p>
                    )}
                    <p className="text-xs text-subtle">Davetli e-postasındaki linkle giriş yapar ve plan sayfasında daveti kabul eder.</p>
                  </form>
                </>
              ) : (
                <p className="text-[13px] text-subtle">Ortak düzenleyen daveti, planı yayınladıktan sonra plan sayfasındaki Ayarlar’dan gönderilir.</p>
              )}
            </>
          )}

          {tab === "rsvp" && (
            <>
              <H title="Katılım seçenekleri" />
              <Group>
                <SettingRow title="+1 misafir">
                  <Select label="+1 misafir" value={String(d.plusOnesMax)} onChange={(v) => set({ plusOnesMax: Number(v) })} options={[["0", "Kapalı"], ["1", "En fazla 1"], ["2", "En fazla 2"], ["3", "En fazla 3"], ["5", "En fazla 5"]]} />
                </SettingRow>
                {d.plusOnesMax > 0 && (
                  <SettingRow title="+1 misafirin adını iste">
                    <Toggle checked={d.requirePlusOneNames} onChange={(v) => set({ requirePlusOneNames: v })} label="+1 adını iste" />
                  </SettingRow>
                )}
              </Group>
              <Group>
                <SettingRow title="Katılım onayı iste" hint={poll ? "Tarih anketiyle birlikte kullanılamaz" : "Misafirler “Listeye alın” diye ister, sen onaylarsın"}>
                  <Toggle checked={d.requireApproval} onChange={(v) => !poll && set({ requireApproval: v })} label="Katılım onayı" />
                </SettingRow>
                <SettingRow title="Kontenjan" hint={d.capacity ? "Dolunca bekleme listesi açılır" : undefined}>
                  <input type="number" min={1} aria-label="Kontenjan" placeholder="Yok" value={d.capacity ?? ""} onChange={(e) => set({ capacity: e.target.value ? Number(e.target.value) : undefined })} className="h-10 w-24 rounded-sm border border-white/18 bg-white/6 px-3 text-right text-[15px] font-bold text-text outline-none" />
                </SettingRow>
                <SettingRow title="Misafirler ortak arkadaşlarını davet edebilsin">
                  <Toggle checked={d.guestsCanInviteMutuals} onChange={(v) => set({ guestsCanInviteMutuals: v })} label="Ortak arkadaş daveti" />
                </SettingRow>
              </Group>
              <Group>
                <SettingRow title="Katılım butonu stili" hint="Davetiyedeki Geliyorum / Belki / Gelemiyorum görünümü">
                  <Select label="Katılım butonu stili" value={d.rsvpStyle} onChange={(v) => set({ rsvpStyle: v as PlanDraft["rsvpStyle"] })} options={[["icons", "Simgeler"], ["emoji", "Emoji"], ["text", "Metin"], ["single", "Tek düğme"]]} />
                </SettingRow>
                <SettingRow title="“Belki” seçeneği">
                  <Toggle checked={d.allowMaybe} onChange={(v) => set({ allowMaybe: v })} label="Belki seçeneği" />
                </SettingRow>
              </Group>
            </>
          )}

          {tab === "cost" && (
            <>
              <H title="Masrafı böl" hint="Ödemeler doğrulanmaz; misafir “gönderdim” diye işaretler." />
              <div role="radiogroup" aria-label="Masraf modu" className="grid grid-cols-3 gap-2.5">
                {([["off", "Kapalı", "Masraf bilgisi gösterilmez"], ["fixed", "Sabit tutar", "Herkes aynı payı öder"], ["pay_what_you_can", "Gönlünden ne koparsa", "Misafir tutarı seçer"]] as const).map(([v, l, h]) => (
                  <button key={v} type="button" role="radio" aria-checked={d.cost.mode === v} onClick={() => setCost({ mode: v })} className={`flex h-[76px] flex-col justify-center gap-1 rounded-lg border px-4 text-left ${d.cost.mode === v ? "border-amber-soft bg-amber-soft/12" : "border-white/14 bg-white/5"}`}>
                    <span className="text-base font-extrabold">{l}</span>
                    <span className="text-[13px] text-subtle">{h}</span>
                  </button>
                ))}
              </div>
              {d.cost.mode === "fixed" && (
                <label className="flex flex-col gap-2 text-[15px] font-bold">
                  Kişi başı tutar
                  <div className="flex gap-2.5">
                    <span className="flex h-[52px] items-center rounded-md border border-white/18 bg-white/6 px-3.5 text-base font-bold">₺ TRY</span>
                    <input type="number" min={1} value={d.cost.amountTry ?? ""} onChange={(e) => setCost({ amountTry: e.target.value ? Number(e.target.value) : undefined })} placeholder="450" className={`${field} h-[52px] text-xl font-extrabold`} />
                  </div>
                </label>
              )}
              {d.cost.mode !== "off" && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-[15px] font-bold">
                    Ödeme yöntemleri <span className="font-medium text-subtle">(en az bir tane)</span>
                  </span>
                  {([["iban", "IBAN", "TR33 0006 1005 1978 6457 8413 26"], ["papara", "Papara", "Papara no ya da @kullanıcı"], ["note", "Not", "Açıklamaya adını yaz, örn. “Ece 30 – Selin”"]] as const).map(([k, l, ph]) => (
                    <div key={k} className="flex items-center gap-3">
                      <span className="w-[90px] text-[15px] font-bold">{l}</span>
                      <input value={d.cost[k] ?? ""} onChange={(e) => setCost({ [k]: e.target.value })} placeholder={ph} aria-label={l} className={field} />
                    </div>
                  ))}
                  <p className="text-sm text-subtle">Katılım onayı ve tarih anketiyle birlikte kullanılamaz · Gerçek tahsilat (iyzico) Faz 3</p>
                </div>
              )}
            </>
          )}

          {tab === "questions" && (
            <>
              <H title="Misafirlere sor" hint="Katılım bildirirken sorulur. Cevaplar yalnız düzenleyenlere görünür." />
              {d.questions.map((q, i) => (
                <div key={q.id} className="flex flex-col gap-3 rounded-xl border border-white/12 bg-white/5 p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-sm bg-white/10 text-[13px] font-extrabold">{i + 1}</span>
                    <Select label="Soru tipi" value={q.type} onChange={(v) => setQ(q.id, { type: v as Question["type"], options: v === "single" ? (q.options ?? ["Evet", "Hayır"]) : undefined })} options={[["short", "Kısa cevap"], ["single", "Tek seçim"]]} />
                    <label className="ml-auto flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={q.required} onChange={(e) => setQ(q.id, { required: e.target.checked })} className="size-[18px] accent-teal" />
                      Zorunlu
                    </label>
                    <button type="button" aria-label="Soruyu sil" onClick={() => set({ questions: d.questions.filter((x) => x.id !== q.id) })} className="text-subtle hover:text-text">
                      ✕
                    </button>
                  </div>
                  <input value={q.text} onChange={(e) => setQ(q.id, { text: e.target.value })} placeholder="Örn. Diyet kısıtın var mı?" aria-label={`Soru ${i + 1}`} className={field} />
                  {q.type === "single" && (
                    <div className="flex flex-col gap-1.5 pl-3">
                      {(q.options ?? []).map((o, oi) => (
                        <div key={oi} className="flex items-center gap-2.5">
                          <span className="size-4 rounded-pill border-[1.5px] border-subtle" />
                          <input value={o} aria-label={`Seçenek ${oi + 1}`} onChange={(e) => setQ(q.id, { options: (q.options ?? []).map((x, xi) => (xi === oi ? e.target.value : x)) })} className="h-10 grow rounded-sm border border-white/12 bg-transparent px-3 text-[15px] font-semibold text-text outline-none" />
                        </div>
                      ))}
                      {(q.options?.length ?? 0) < 8 && (
                        <button type="button" onClick={() => setQ(q.id, { options: [...(q.options ?? []), ""] })} className="w-fit text-sm font-bold text-amber-soft">
                          + Seçenek ekle
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => d.questions.length < 10 && set({ questions: [...d.questions, { id: newId(), type: "short", text: "", required: false }] })} className="h-11 rounded-pill border border-dashed border-white/30 px-4 text-sm font-bold">
                  + Soru ekle
                </button>
                <span className="text-[13px] text-subtle">Hazır:</span>
                {["Diyet kısıtın var mı?", "Araçla mı geliyorsun?", "Ne getiriyorsun?"].map((t) => (
                  <button key={t} type="button" onClick={() => set({ questions: [...d.questions, { id: newId(), type: "short", text: t, required: false }] })} className="h-9 rounded-pill bg-white/8 px-3 text-[13px] font-semibold">
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-[13px] text-subtle">Sorular “Geliyorum” ve “Belki” diyenlere sorulur; cevapları Katılımcılar panelinde ve CSV’de görürsün.</p>
            </>
          )}

          {tab === "privacy" && (
            <>
              <H title="Görünürlük & gizlilik" hint="Katılımcı listesi ve akış, katılım bildirmeden önce her zaman gizlidir." />
              <Group>
                <SettingRow title="Akışta zaman damgaları">
                  <Toggle checked={d.showTimestamps} onChange={(v) => set({ showTimestamps: v })} label="Zaman damgaları" />
                </SettingRow>
                <SettingRow title="Misafir adları görünsün">
                  <Toggle checked={d.showGuestNames} onChange={(v) => set({ showGuestNames: v })} label="Misafir adları" />
                </SettingRow>
                <SettingRow title="Misafir sayısı görünsün">
                  <Toggle checked={d.showGuestCount} onChange={(v) => set({ showGuestCount: v })} label="Misafir sayısı" />
                </SettingRow>
              </Group>
              <p className="text-[13px] text-subtle">Plan şifresi ve gizli beğeni Faz 2.</p>
            </>
          )}

          {tab === "audience" && (
            <>
              <H title="Kitle" hint="Planı davetli tut ya da ortak arkadaşlarına ve partile topluluğuna aç." />
              <Group>
                <SettingRow title="Bu planı kim görebilir?">
                  <Select label="Kitle" value={d.visibility} onChange={(v) => set({ visibility: v as PlanDraft["visibility"] })} options={[["private", "Gizli · linke sahip olanlar"], ["public", "Herkese açık · Keşfet’te listelenir"]]} />
                </SettingRow>
              </Group>
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                <LockIcon />
                <span className="flex flex-col">
                  <span className="font-bold">{d.visibility === "private" ? "Yalnızca davetliler" : "Herkese açık"}</span>
                  <span className="text-sm text-subtle">{d.visibility === "private" ? "Misafirler davet edilmeli ya da linke sahip olmalı" : "Keşfet’te ve profilinde listelenir; katılımcı listesi yine katılanlara özel"}</span>
                </span>
              </div>
            </>
          )}

          {tab === "album" && (
            <>
              <H title="Fotoğraf albümü" hint="Albümü yalnızca katılım bildirenler görür." />
              <Group>
                <SettingRow title="Albüme filtre uygula">
                  <Select label="Filtre" value={d.albumFilter} onChange={(v) => set({ albumFilter: v as PlanDraft["albumFilter"] })} options={[["none", "Yok"], ["warm", "Sıcak"], ["mono", "Siyah-beyaz"]]} />
                </SettingRow>
                <SettingRow title="Misafirler yükleyebilsin">
                  <Toggle checked={d.albumGuestsCanUpload} onChange={(v) => set({ albumGuestsCanUpload: v })} label="Misafir yüklemesi" />
                </SettingRow>
              </Group>
            </>
          )}

          {tab === "reminders" && (
            <>
              <H title="Hatırlatmalar" hint="Misafirlerine otomatik e-posta ve uygulama içi hatırlatma gönderilir." />
              <Group>
                <SettingRow title="Hatırlatmalar açık">
                  <Toggle checked={d.remindersEnabled} onChange={(v) => set({ remindersEnabled: v })} label="Hatırlatmalar" />
                </SettingRow>
              </Group>
              <span className="text-[15px] text-muted">Misafirlerin alacağı:</span>
              <Group>
                <SettingRow title="Katılım hatırlatması" hint="1 hafta önce">
                  <span className="flex gap-1.5 text-xs font-extrabold">
                    <span className="rounded-pill bg-white/10 px-2.5 py-1">Davetli</span>
                    <span className="rounded-pill bg-white/10 px-2.5 py-1">Belki</span>
                  </span>
                </SettingRow>
                <SettingRow title="Etkinlik hatırlatması" hint="2 saat önce">
                  <span className="rounded-pill bg-white/10 px-2.5 py-1 text-xs font-extrabold">Geliyor</span>
                </SettingRow>
              </Group>
            </>
          )}
        </section>
      </div>
      <div className={modalFooter}>
        <button type="button" onClick={onClose} className={btnGhost}>
          Vazgeç
        </button>
        <button
          type="button"
          onClick={() => {
            onSave({
              plusOnesMax: d.plusOnesMax, requirePlusOneNames: d.requirePlusOneNames, requireApproval: d.requireApproval, capacity: d.capacity,
              guestsCanInviteMutuals: d.guestsCanInviteMutuals, allowMaybe: d.allowMaybe, rsvpStyle: d.rsvpStyle, cost: d.cost, questions: d.questions.filter((q) => q.text.trim()),
              showTimestamps: d.showTimestamps, showGuestNames: d.showGuestNames, showGuestCount: d.showGuestCount, visibility: d.visibility,
              albumFilter: d.albumFilter, albumGuestsCanUpload: d.albumGuestsCanUpload, remindersEnabled: d.remindersEnabled,
            });
            onClose();
          }}
          className={btnPrimary}
        >
          Kaydet
        </button>
      </div>
    </Modal>
  );
}
