"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { planUrl, type Photo } from "@partile/core";
import { deletePhoto } from "@/app/actions";
import { CameraIcon, CloseIcon, ImageIcon, TrashIcon } from "@/components/shell/icons";

/** Plan album: upload from camera or files, square grid, lightbox, delete own (hosts delete any). */
export function AlbumSection({ code, photos, viewerId, isHost, canUpload, chipClass }: { code: string; photos: Photo[]; viewerId: string | null; isHost: boolean; canUpload: boolean; chipClass: string }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<Photo | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    try {
      for (const f of Array.from(files).slice(0, 10)) {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("kind", "photo");
        fd.append("code", code);
        const r = await fetch("/api/yukle", { method: "POST", body: fd });
        if (!r.ok) {
          setErr((await r.json().catch(() => ({}))).error ?? "Yüklenemedi.");
          break;
        }
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${planUrl(code)}#album`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <section id="album" className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5"><h2 className="display text-[26px] tracking-tight">Fotoğraf albümü</h2><span className="text-base opacity-85">{photos.length ? `${photos.length} fotoğraf` : "Henüz fotoğraf yok"}</span></div>
        <button type="button" onClick={copy} className={chipClass}>{copied ? "Kopyalandı" : "Linki kopyala"}</button>
      </div>
      {canUpload && (
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" disabled={busy} onClick={() => camRef.current?.click()} className="glass flex h-20 items-center justify-center gap-2 rounded-lg border-dashed text-[15px] font-bold disabled:opacity-50"><CameraIcon size={18} /> Kamera</button>
          <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="glass flex h-20 items-center justify-center gap-2 rounded-lg border-dashed text-[15px] font-bold disabled:opacity-50"><ImageIcon size={18} /> {busy ? "Yükleniyor…" : "Yükle"}</button>
          <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => upload(e.target.files)} />
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
        </div>
      )}
      {err && <p className="text-sm font-bold">{err}</p>}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <button key={p.id} type="button" onClick={() => setOpen(p)} className="relative aspect-square overflow-hidden rounded-lg bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`${p.name} fotoğrafı`} className="size-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/92" role="dialog" aria-modal="true" aria-label="Fotoğraf" onClick={() => setOpen(null)}>
          <div className="flex h-14 shrink-0 items-center justify-between px-4 text-sm text-white">
            <span>{open.name} · {new Date(open.at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</span>
            <span className="flex items-center gap-2">
              {(isHost || open.userId === viewerId) && (
                <button type="button" onClick={(e) => { e.stopPropagation(); start(async () => { await deletePhoto(code, open.id); setOpen(null); router.refresh(); }); }} className="flex h-9 items-center gap-1.5 rounded-pill border border-ink/30 px-3 text-xs font-bold"><TrashIcon size={14} /> Sil</button>
              )}
              <button type="button" aria-label="Kapat" className="flex size-9 items-center justify-center rounded-pill bg-ink/10"><CloseIcon size={18} /></button>
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open.url} alt="" className="min-h-0 grow object-contain p-4" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
