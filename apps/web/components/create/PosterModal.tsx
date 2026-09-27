"use client";

import { useRef, useState } from "react";
import { invitationThemes } from "@partile/ui-tokens";
import { Modal, btnGhost, btnPrimary, modalFooter } from "@/components/ui/Modal";
import { titleFontStyle } from "@/lib/fonts";

export type PosterValue = { posterUrl?: string; posterText?: string; themeId?: string };

const TABS = ["Şablonlar", "Yükle", "Galerim", "GIF"] as const;
const CATS = ["Tümü", "Doğum günü", "Yemek", "Ev partisi", "Yılbaşı", "Kına & nişan"];

/* Template = theme + text + font; the poster component renders it. */
const TEMPLATES = [
  { id: "30", name: "30 kor", text: "30", theme: "kor", font: "poster" },
  { id: "aksam", name: "Akşam yemeği", text: "akşam\nyemeği", theme: "limonata", font: "eklektik" },
  { id: "ev", name: "Ev partisi", text: "EV\nPARTİSİ", theme: "gece", font: "klasik" },
  { id: "kina", name: "Kına gecesi", text: "kına\ngecesi", theme: "kiraz", font: "sik" },
  { id: "brunch", name: "Brunch", text: "BRUNCH", theme: "pudra", font: "dijital" },
  { id: "mac", name: "Maç gecesi", text: "MAÇ\nGECESİ", theme: "zeytinlik", font: "klasik" },
  { id: "yilbasi", name: "Yılbaşı", text: "2027", theme: "kobalt", font: "poster" },
  { id: "mangal", name: "Mangal", text: "mangal", theme: "derin-deniz", font: "eklektik" },
];

const MAX_DATA_URL = 1.5 * 1024 * 1024;
const MAX_UPLOAD = 8 * 1024 * 1024;

/** `PosterPicker` artboard: templates / upload / gallery / GIF. Signed-in hosts upload straight to storage; signed-out drafts keep a small data URL until publish. */
export function PosterModal({ open, onClose, onSave, canUpload = false }: { open: boolean; onClose: () => void; onSave: (v: PosterValue) => void; canUpload?: boolean }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Şablonlar");
  const [pick, setPick] = useState<string>("30");
  const [upload, setUpload] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Yalnızca görsel dosyası (JPG, PNG, GIF, WebP).");
    if (f.size > MAX_UPLOAD) return setError("En fazla 8 MB.");
    if (canUpload) {
      setBusy(true);
      setError(null);
      try {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("kind", "poster");
        const r = await fetch("/api/yukle", { method: "POST", body: fd });
        if (!r.ok) return setError((await r.json().catch(() => ({}))).error ?? "Yüklenemedi.");
        setUpload((await r.json()).url);
      } finally {
        setBusy(false);
      }
      return;
    }
    if (f.size > MAX_DATA_URL) return setError("Giriş yapmadan 1,5 MB'a kadar; daha büyüğü için önce giriş yap.");
    const r = new FileReader();
    r.onload = () => {
      setUpload(String(r.result));
      setError(null);
    };
    r.readAsDataURL(f);
  };

  const save = () => {
    if (tab === "Yükle" && upload) return onSave({ posterUrl: upload });
    const t = TEMPLATES.find((x) => x.id === pick) ?? TEMPLATES[0]!;
    onSave({ posterUrl: undefined, posterText: t.text, themeId: t.theme });
  };

  return (
    <Modal open={open} onClose={onClose} title="Afiş" width={1000}>
      <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className={`h-[38px] rounded-pill px-4 text-sm font-bold ${tab === t ? "border border-white/50 bg-white/14" : "bg-white/6"}`}>
            {t}
          </button>
        ))}
        <span className="ml-auto hidden text-[13px] text-subtle md:block">Kare · en az 1080×1080 · JPG, PNG, GIF</span>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {tab === "Şablonlar" && (
          <>
            <div className="flex flex-wrap gap-2">
              {CATS.map((c, i) => (
                <span key={c} className={`flex h-8 items-center rounded-pill px-3 text-[13px] ${i === 0 ? "border border-white/40 bg-white/14 font-bold" : "bg-white/6 font-semibold"}`}>
                  {c}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
              {TEMPLATES.map((t) => {
                const th = invitationThemes.find((x) => x.id === t.theme)!;
                const sel = pick === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPick(t.id)}
                    aria-pressed={sel}
                    aria-label={t.name}
                    className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg p-3 text-center leading-none whitespace-pre-line"
                    style={{
                      background: th.poster,
                      color: th.fg,
                      border: sel ? "3px solid #FFFFFF" : "1px solid rgba(255,255,255,0.1)",
                      fontSize: t.font === "poster" ? 84 : t.font === "sik" ? 52 : 34,
                      ...(t.font === "poster" ? { fontFamily: "var(--font-poster)", fontWeight: 800, letterSpacing: "-0.06em" } : titleFontStyle(t.font)),
                    }}
                  >
                    {t.text}
                  </button>
                );
              })}
            </div>
            <span className="text-[13px] text-subtle">Şablonlar başlığını ve tarihini otomatik alır; metni afişte düzenleyebilirsin.</span>
          </>
        )}

        {tab === "Yükle" && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files[0]);
            }}
            className="flex min-h-[380px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/25 text-center"
          >
            {upload ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={upload} alt="Yüklenen afiş" className="size-[260px] rounded-lg object-cover" />
            ) : (
              <>
                <span className="display text-xl tracking-normal">Görseli buraya bırak</span>
                <span className="text-sm text-subtle">ya da</span>
              </>
            )}
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className={`${btnPrimary} disabled:opacity-50`}>
              {busy ? "Yükleniyor…" : upload ? "Başka dosya seç" : "Dosya seç"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            <span className="text-[13px] text-subtle">{error ?? "Kare olmayanlar kırpılır · GIF'ler hareketli kalır"}</span>
          </div>
        )}

        {tab === "Galerim" && (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-white/25 text-sm text-subtle">Önceki planlarının afişleri burada birikecek.</div>
        )}
        {tab === "GIF" && (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-white/25 text-sm text-subtle">GIF arama (GIPHY) sonra bağlanacak.</div>
        )}
      </div>

      <div className={modalFooter}>
        <button type="button" onClick={onClose} className={btnGhost}>
          Vazgeç
        </button>
        <button type="button" onClick={save} disabled={tab === "Yükle" && !upload} className={`${btnPrimary} disabled:opacity-40`}>
          Afişi kullan
        </button>
      </div>
    </Modal>
  );
}
