"use client";

import { useState } from "react";
import { Modal, btnGhost, modalFooter } from "@/components/ui/Modal";

/** Cancel a plan: optional note to guests; they get an in-app notification and an e-mail. Reversible by the host. */
export function CancelModal({ open, onClose, title, guestCount, onConfirm }: { open: boolean; onClose: () => void; title: string; guestCount: number; onConfirm: (note: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title="Planı iptal et" width={560}>
      <div className="flex flex-col gap-4 p-5">
        <p className="text-[15px] leading-relaxed text-muted">
          <strong className="text-text">{title}</strong> iptal edilecek. {guestCount > 0 ? <>Katılım bildiren ya da davet edilen <strong className="text-text">{guestCount} kişiye</strong> bildirim ve e-posta gider.</> : "Henüz misafir yok."} Katılım ve hatırlatmalar durur; istersen sonra geri alabilirsin.
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold">Misafirlere not <span className="font-medium text-subtle">(isteğe bağlı)</span></span>
          <textarea data-autofocus rows={3} maxLength={400} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Hava muhalefeti yüzünden erteliyoruz, yeni tarihi yakında paylaşırım." className="resize-none rounded-md border border-white/18 bg-white/6 px-3.5 py-2.5 text-[15px] font-medium outline-none placeholder:text-subtle focus:border-white/40" />
        </label>
      </div>
      <div className={modalFooter}>
        <button type="button" onClick={onClose} className={btnGhost}>Vazgeç</button>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm(note);
            setBusy(false);
          }}
          className="flex h-12 items-center rounded-pill bg-[#FF6A3D] px-6 text-[15px] font-extrabold text-bg disabled:opacity-50"
        >
          {busy ? "İptal ediliyor…" : "Planı iptal et"}
        </button>
      </div>
    </Modal>
  );
}
