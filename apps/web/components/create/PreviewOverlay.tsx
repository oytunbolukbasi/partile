"use client";

import { useEffect } from "react";
import type { Plan, PlanDraft } from "@partile/core";
import { PlanView } from "@/components/plan/PlanView";
import { CloseIcon, EyeIcon } from "@/components/shell/icons";
import type { Viewer } from "@/lib/auth";

/** "Önizle": the draft as a guest will see it (`InviteDesktop`/`InviteMobile`), without RSVP side effects. */
export function PreviewOverlay({ draft, viewer, code, onClose }: { draft: PlanDraft; viewer: Viewer | null; code?: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const hostName = viewer?.name || "Sen";
  const plan: Plan = {
    ...draft,
    id: "preview",
    code: code ?? "onizleme",
    status: "draft",
    hosts: [{ id: viewer?.id ?? "me", name: hostName, initials: viewer?.initials ?? "?", gradient: "linear-gradient(135deg, #1EC9B0, #FFB020)" }],
    guests: [],
    feed: [],
    blasts: [],
    views: 0,
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-bg" role="dialog" aria-modal="true" aria-label="Önizleme">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-bg px-4 text-sm text-text">
        <span className="flex items-center gap-2 font-bold"><EyeIcon size={16} /> Önizleme · misafir gözüyle</span>
        <span className="hidden text-subtle md:inline">Butonlar önizlemede çalışmaz · Esc ile kapat</span>
        <button type="button" onClick={onClose} aria-label="Önizlemeyi kapat" className="flex size-9 items-center justify-center rounded-pill hover:bg-white/8"><CloseIcon size={18} /></button>
      </div>
      <div className="min-h-0 grow overflow-y-auto">
        <PlanView plan={plan} viewer={null} viewerGuest={null} preview />
      </div>
    </div>
  );
}
