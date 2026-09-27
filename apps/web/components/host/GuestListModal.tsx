"use client";

import { useState } from "react";
import { rsvpLabel, type RsvpStatus } from "@partile/core";
import { Avatar } from "@/components/plan/Avatar";
import { CheckIcon, CloseIcon, DownloadIcon, MoreIcon, SearchIcon } from "@/components/shell/icons";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import type { Guest, Plan } from "@partile/core";

type Filter = "all" | RsvpStatus;
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "going", label: "Geliyor" },
  { id: "maybe", label: "Belki" },
  { id: "no", label: "Gelemiyor" },
  { id: "invited", label: "Davetli" },
  { id: "pending", label: "Onay bekliyor" },
];
const PILL: Record<RsvpStatus, string> = {
  going: "bg-[rgba(30,201,176,0.18)] text-[#1EC9B0]",
  maybe: "bg-white/12 text-text",
  no: "bg-white/8 text-subtle",
  invited: "bg-white/8 text-subtle",
  pending: "bg-[rgba(255,181,71,0.18)] text-amber",
};

const timeAgo = (iso: string) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 60 ? `${m} dk önce` : m < 1440 ? `${Math.round(m / 60)} sa önce` : m < 2880 ? "dün" : `${Math.round(m / 1440)} gün önce`;
};

/** `GuestList` artboard: host-side guest table with filters, search, approvals, check-in and CSV. No e-mail column (KVKK). */
export function GuestListModal({ plan, guests, open, onClose, onDecide, onFlag, onBlast, onMessage }: { plan: Plan; guests: Guest[]; open: boolean; onClose: () => void; onDecide: (guestId: string, decision: "approve" | "reject") => void; onFlag: (guestId: string, flag: "checkedIn" | "paid", value: boolean) => void; onBlast: () => void; onMessage?: (userId: string) => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [checkin, setCheckin] = useState(false);

  const counts = FILTERS.reduce((acc, f) => ({ ...acc, [f.id]: f.id === "all" ? guests.length : guests.filter((g) => g.status === f.id).length }), {} as Record<Filter, number>);
  const rows = guests.filter((g) => (filter === "all" || g.status === filter) && g.name.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR")));
  const noteOf = (g: Guest) => g.answers?.q1 || g.note || "—";

  const csv = () => {
    const head = ["Ad", "Durum", "+1", "+1 adı", "Not", ...plan.questions.map((x) => x.text)];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = guests.map((g) => [g.name, rsvpLabel[g.status], String(g.plusOnes ?? 0), g.plusOneNames?.join(" ") ?? "", g.note ?? "", ...plan.questions.map((x) => g.answers?.[x.id] ?? "")].map(esc).join(";"));
    const blob = new Blob(["﻿" + [head.map(esc).join(";"), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${plan.code}-katilimcilar.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const sub = `${counts.going} geliyor · ${counts.maybe} belki · ${counts.no} gelemiyor · ${counts.invited} davetli yanıtsız · ${counts.pending} onay bekliyor`;
  const btn = "flex h-10 items-center gap-2 rounded-pill border border-white/25 px-3.5 text-sm font-bold";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Katılımcılar · ${plan.title}`}
      width={1180}
      headerRight={
        <div className="hidden gap-2 md:flex">
          <button type="button" onClick={csv} className={btn}><DownloadIcon size={16} /> CSV indir</button>
          <button type="button" className={btn} title="Yakında">Misafir ekle</button>
          <button type="button" onClick={onBlast} className="flex h-10 items-center rounded-pill bg-white px-4 text-sm font-extrabold text-bg">Duyuru gönder</button>
        </div>
      }
    >
      <div className="flex min-h-0 flex-col">
        <p className="border-b border-line px-6 py-2.5 text-[13px] text-subtle">{sub}</p>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-6 py-3.5">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={`flex h-[38px] items-center gap-1.5 rounded-pill px-3.5 text-sm font-bold ${filter === f.id ? "border border-white/45 bg-white/14" : "bg-white/6"}`}>
              {f.label} <span className="font-medium text-subtle">{counts[f.id]}</span>
            </button>
          ))}
          <label className="flex h-[38px] w-full items-center gap-2 rounded-pill border border-white/12 bg-white/6 px-3 md:ml-auto md:w-[240px]">
            <SearchIcon size={16} className="text-subtle" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="İsim ara" className="min-w-0 grow bg-transparent text-sm font-medium outline-none placeholder:text-subtle" aria-label="Misafir ara" />
          </label>
          <button type="button" aria-pressed={checkin} onClick={() => setCheckin(!checkin)} className={`${btn} ${checkin ? "bg-[rgba(30,201,176,0.2)]" : ""}`}>
            <CheckIcon size={16} /> Giriş kontrolü
          </button>
        </div>

        <div className="hidden grid-cols-[1.6fr_1fr_0.6fr_1.4fr_0.8fr] gap-3 border-b border-white/6 px-6 py-2.5 text-xs font-extrabold tracking-wide text-subtle md:grid">
          <span>MİSAFİR</span><span>DURUM</span><span>+1</span><span>DİYET / NOT</span><span className="text-right">{checkin ? "GİRİŞ" : "İŞLEM"}</span>
        </div>
        <div className="flex flex-col overflow-y-auto">
          {rows.map((g) => (
            <div key={g.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-white/6 px-6 py-2.5 md:grid-cols-[1.6fr_1fr_0.6fr_1.4fr_0.8fr]">
              <span className="flex items-center gap-3">
                <Avatar initials={g.initials} gradient={g.gradient} size={40} />
                <span className="flex flex-col"><span className="text-[15px] font-bold">{g.name}</span><span className="text-xs text-subtle">{g.status === "invited" ? `davet ${timeAgo(g.at)}` : timeAgo(g.at)}</span></span>
              </span>
              <span className="order-last col-span-2 flex items-center gap-3 md:order-none md:col-span-1 md:contents">
                <span><span className={`inline-flex h-7 items-center rounded-pill px-2.5 text-xs font-extrabold ${PILL[g.status]}`}>{g.status === "pending" ? "Onay bekliyor" : g.status === "invited" ? "Davetli" : rsvpLabel[g.status]}</span></span>
                <span className="text-sm text-muted">{g.plusOnes ? `+${g.plusOnes}${g.plusOneNames?.length ? ` ${g.plusOneNames.join(", ")}` : ""}` : "—"}</span>
                <span className="truncate text-sm text-muted">{noteOf(g)}</span>
              </span>
              <span className="flex justify-end">
                {g.status === "pending" ? (
                  <span className="flex gap-1.5">
                    <button type="button" onClick={() => onDecide(g.id, "approve")} className="h-8 rounded-pill bg-[#1EC9B0] px-3 text-xs font-extrabold text-bg">Onayla</button>
                    <button type="button" aria-label="Reddet" onClick={() => onDecide(g.id, "reject")} className="flex size-8 items-center justify-center rounded-pill border border-white/25"><CloseIcon size={14} /></button>
                  </span>
                ) : checkin && g.status === "going" ? (
                  <Toggle checked={!!g.checkedIn} onChange={(v) => onFlag(g.id, "checkedIn", v)} label={`${g.name} giriş yaptı`} />
                ) : (
                  g.userId && onMessage ? (
                    <button type="button" onClick={() => onMessage(g.userId!)} className="h-8 rounded-pill border border-white/25 px-3 text-xs font-bold">Mesaj</button>
                  ) : (
                    <button type="button" aria-label="Daha fazla" title="Hesabı olmayan misafire mesaj gönderilemez" className="flex size-8 items-center justify-center rounded-pill text-subtle"><MoreIcon size={16} /></button>
                  )
                )}
              </span>
            </div>
          ))}
          {rows.length === 0 && <p className="px-6 py-10 text-center text-muted">Eşleşen misafir yok.</p>}
        </div>
        <div className="flex flex-col gap-1 border-t border-line px-6 py-3.5 text-[13px] text-subtle md:flex-row md:items-center">
          E-posta adresleri düzenleyene gösterilmez (KVKK).
          <span className="md:ml-auto">Giriş kontrolü yalnızca web’de · misafire bildirim gitmez</span>
        </div>
      </div>
    </Modal>
  );
}
