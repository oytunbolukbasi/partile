"use client";

import { useState } from "react";
import type { Guest } from "@partile/core";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/plan/Avatar";

type Tab = "going" | "maybe" | "no";
const TABS: { id: Tab; label: string }[] = [
  { id: "going", label: "Geliyor" },
  { id: "maybe", label: "Belki" },
  { id: "no", label: "Gelemiyor" },
];

/** Guest-side "Katılımcılar → Tümünü gör": names by answer. No e-mails, notes or answers; invites and pending approvals stay hidden. */
export function GuestListSheet({ open, onClose, guests }: { open: boolean; onClose: () => void; guests: Guest[] }) {
  const [tab, setTab] = useState<Tab>("going");
  const byTab = (t: Tab) => guests.filter((g) => g.status === t);
  const heads = (t: Tab) => byTab(t).reduce((n, g) => n + 1 + (t === "no" ? 0 : g.plusOnes ?? 0), 0);
  const list = byTab(tab);
  return (
    <Modal open={open} onClose={onClose} title="Katılımcılar" width={520}>
      <div role="tablist" aria-label="Katılım durumu" className="flex gap-1.5 border-b border-line px-5 py-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex h-10 items-center gap-1.5 rounded-pill px-4 text-sm font-bold ${tab === t.id ? "bg-white text-bg" : "border border-white/20 text-muted"}`}
          >
            {t.label} <span className={tab === t.id ? "opacity-60" : "text-subtle"}>{heads(t.id)}</span>
          </button>
        ))}
      </div>
      <ul className="flex flex-col px-5 py-2" role="tabpanel">
        {list.length === 0 && <li className="py-8 text-center text-[15px] text-subtle">Henüz kimse yok.</li>}
        {list.map((g) => (
          <li key={g.id} className="flex items-center gap-3 border-b border-white/6 py-3 last:border-0">
            <Avatar initials={g.initials} gradient={g.gradient} size={40} />
            <div className="flex min-w-0 grow flex-col">
              <span className="truncate text-[15px] font-bold">{g.name}</span>
              {!!g.plusOnes && tab !== "no" && (
                <span className="truncate text-[13px] text-subtle">+{g.plusOnes} misafir{g.plusOneNames?.length ? ` · ${g.plusOneNames.join(", ")}` : ""}</span>
              )}
            </div>
            {tab === "going" && g.checkedIn && <span className="text-[13px] font-bold text-teal">Geldi</span>}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
