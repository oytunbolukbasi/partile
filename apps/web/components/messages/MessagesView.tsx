"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { formatDayShort, formatTime, type Conversation, type Message } from "@partile/core";
import { postMessage } from "@/app/actions";
import { Avatar } from "@/components/plan/Avatar";
import { TabBar } from "@/components/shell/TabBar";
import { BellOffIcon, ImageIcon, PlusIcon, SearchIcon, ShareIcon } from "@/components/shell/icons";
import type { Viewer } from "@/lib/auth";
import { routes } from "@/lib/routes";

type Filter = "all" | "host" | "guest";
const when = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const same = d.toDateString() === today.toDateString();
  const yesterday = new Date(today.getTime() - 864e5).toDateString() === d.toDateString();
  return same ? formatTime(iso) : yesterday ? "dün" : formatDayShort(iso).split(",")[0]!;
};

/** `Messages` artboard: list on the left (Tümü · Planlar · Kişiler), thread on the right; full-screen thread on mobile. */
export function MessagesView({ viewer, conversations, thread }: { viewer: Viewer; conversations: Conversation[]; thread: { meta: Conversation; messages: Message[] } | null }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);
  const unread = conversations.reduce((n, c) => n + c.unread, 0);
  const list = conversations.filter((c) => (filter === "all" || c.role === filter) && `${c.other.name} ${c.planTitle}`.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR")));

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [thread?.messages.length, thread?.meta.id]);

  const send = () => {
    const body = text.trim();
    if (!thread || !body || pending) return;
    start(async () => {
      const r = await postMessage(thread.meta.id, body);
      if (r.ok) {
        setText("");
        router.refresh();
      }
    });
  };

  let lastDay = "";
  return (
    <main className="relative min-h-dvh pb-24 md:pb-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] aura-top opacity-70" aria-hidden />
      <div className="absolute right-4 top-[18px] z-10 hidden md:right-10 md:block">
        <Link href={routes.create} className="flex h-11 items-center gap-2 rounded-pill bg-white px-5 text-[15px] font-bold text-bg"><PlusIcon size={16} strokeWidth={2.6} /> Oluştur</Link>
      </div>

      <div className="relative mx-4 mt-4 flex h-[calc(100dvh-140px)] overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:mx-10 md:mt-[90px] md:h-[830px]">
        {/* list */}
        <aside className={`flex w-full shrink-0 flex-col border-r border-line md:w-[380px] ${thread ? "hidden md:flex" : "flex"}`}>
          <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
            <h1 className="text-[22px] font-bold tracking-tight">Mesajlar</h1>
            {unread > 0 && <span className="flex h-7 items-center rounded-pill bg-white/8 px-2.5 text-xs font-extrabold text-muted">{unread} okunmadı</span>}
          </div>
          <div className="border-b border-line px-4 py-3">
            <label className="flex h-10 items-center gap-2 rounded-pill border border-white/12 bg-white/6 px-3"><SearchIcon size={16} className="text-subtle" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kişi ya da plan ara" aria-label="Ara" className="min-w-0 grow bg-transparent text-sm font-medium outline-none placeholder:text-subtle" /></label>
          </div>
          <div className="flex gap-1.5 border-b border-line px-4 py-2.5">
            {([["all", "Tümü"], ["host", "Planlarım"], ["guest", "Katıldıklarım"]] as [Filter, string][]).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={`h-8 rounded-pill px-3 text-[13px] ${filter === id ? "border border-white/45 bg-white/14 font-bold text-white" : "bg-white/6 font-semibold"}`}>{label}</button>
            ))}
          </div>
          <div className="flex min-h-0 grow flex-col overflow-y-auto">
            {list.map((c) => (
              <Link key={c.id} href={`${routes.messages}?s=${c.id}`} aria-current={thread?.meta.id === c.id ? "true" : undefined} className={`flex gap-3 border-b border-white/6 px-4 py-3 ${thread?.meta.id === c.id ? "bg-white/6" : ""}`}>
                <Avatar initials={c.other.initials} gradient={c.other.gradient} size={44} />
                <span className="flex min-w-0 grow flex-col gap-0.5">
                  <span className="flex justify-between gap-2"><span className="truncate text-[15px] font-bold">{c.other.name}</span><span className="shrink-0 text-xs text-subtle">{when(c.lastAt)}</span></span>
                  <span className="text-xs font-bold text-amber">{c.planTitle} · {c.otherRoleLabel}</span>
                  <span className={`truncate text-[13px] ${c.unread ? "font-bold text-text" : "text-subtle"}`}>{c.lastText ?? "Henüz mesaj yok"}</span>
                </span>
              </Link>
            ))}
            {list.length === 0 && (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <span className="text-[22px] font-bold tracking-tight">Henüz mesajlaşacak kimse yok</span>
                <p className="max-w-[280px] text-[15px] leading-relaxed text-subtle">Bir plana katıl ya da bir plan düzenle; düzenleyenler ve misafirlerle buradan yazışırsın.</p>
                <div className="flex gap-2"><Link href={routes.explore} className="flex h-11 items-center rounded-pill border border-white/30 px-4.5 text-[15px] font-bold">Keşfet</Link><Link href={routes.create} className="flex h-11 items-center rounded-pill bg-white px-4.5 text-[15px] font-extrabold text-bg">Plan oluştur</Link></div>
              </div>
            )}
          </div>
          <div className="border-t border-line px-4 py-3 text-xs leading-relaxed text-subtle">Yalnızca aynı planda olduğun kişilere yazabilirsin: düzenleyen misafire, misafir düzenleyene. Grup sohbeti yok; plan akışı var.</div>
        </aside>

        {/* thread */}
        <section className={`min-w-0 grow flex-col ${thread ? "flex" : "hidden md:flex"}`}>
          {thread ? (
            <>
              <div className="flex h-[72px] items-center gap-3 border-b border-line px-4 md:px-6">
                <Link href={routes.messages} className="flex size-9 items-center justify-center rounded-pill hover:bg-white/8 md:hidden" aria-label="Listeye dön">‹</Link>
                <Avatar initials={thread.meta.other.initials} gradient={thread.meta.other.gradient} size={40} />
                <span className="flex min-w-0 flex-col"><span className="truncate text-[17px] font-bold">{thread.meta.other.name}</span><span className="truncate text-xs text-subtle">{thread.meta.otherRoleLabel} · {thread.meta.planTitle}</span></span>
                <Link href={routes.plan(thread.meta.planCode)} className="ml-auto flex h-9 shrink-0 items-center gap-2 rounded-pill border border-white/25 px-3 text-[13px] font-bold"><ShareIcon size={14} /> Plana git</Link>
                <button type="button" aria-label="Sessize al" title="Yakında" className="hidden size-9 items-center justify-center rounded-pill border border-white/25 md:flex"><BellOffIcon size={16} /></button>
              </div>
              <div className="flex min-h-0 grow flex-col gap-2.5 overflow-y-auto px-4 py-5 md:px-6">
                <div className="mx-auto max-w-[520px] rounded-lg border border-dashed border-white/16 bg-white/4 px-3.5 py-2.5 text-center text-[13px] leading-relaxed text-muted">
                  Bu yazışma <strong className="text-text">{thread.meta.planTitle}</strong> ile ilgili; plan bitince arşivlenir.
                </div>
                {thread.messages.map((m) => {
                  const day = formatDayShort(m.at);
                  const showDay = day !== lastDay;
                  lastDay = day;
                  const mine = m.senderId === viewer.id;
                  return (
                    <div key={m.id} className="flex flex-col gap-1">
                      {showDay && <div className="self-center py-1 text-xs text-subtle">{day}</div>}
                      {mine ? (
                        <div className="flex max-w-[620px] flex-col items-end gap-1 self-end">
                          <span className="rounded-[16px_4px_16px_16px] bg-amber px-3.5 py-2.5 text-[15px] font-medium leading-relaxed text-[#160804]">{m.text}</span>
                          <span className="text-[11px] text-subtle">{formatTime(m.at)}{m.read ? " · Okundu" : ""}</span>
                        </div>
                      ) : (
                        <div className="flex max-w-[620px] items-end gap-2.5 self-start">
                          <Avatar initials={thread.meta.other.initials} gradient={thread.meta.other.gradient} size={32} />
                          <div className="flex flex-col gap-1">
                            <span className="rounded-[4px_16px_16px_16px] border border-white/10 bg-white/8 px-3.5 py-2.5 text-[15px] leading-relaxed">{m.text}</span>
                            <span className="text-[11px] text-subtle">{formatTime(m.at)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={bottom} />
              </div>
              <div className="flex items-center gap-2.5 border-t border-line px-4 py-3.5 md:px-6">
                <button type="button" aria-label="Fotoğraf ekle" title="Yakında" className="hidden size-11 shrink-0 items-center justify-center rounded-pill border border-white/20 md:flex"><ImageIcon size={18} /></button>
                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} maxLength={1000} placeholder="Mesaj yaz…" aria-label="Mesaj" className="h-12 min-w-0 grow rounded-pill border border-white/14 bg-white/6 px-4 text-[15px] font-medium outline-none placeholder:text-subtle focus:border-white/40" />
                <button type="button" onClick={send} disabled={!text.trim() || pending} className="flex h-12 shrink-0 items-center gap-2 rounded-pill bg-white px-4.5 text-sm font-extrabold text-bg disabled:opacity-40">Gönder <ShareIcon size={14} /></button>
              </div>
            </>
          ) : (
            <div className="flex grow flex-col items-center justify-center gap-2 p-10 text-center text-subtle">
              <span className="text-lg font-bold text-text">Bir yazışma seç</span>
              <span className="max-w-[320px] text-sm">Plan sayfasından “Düzenleyene yaz” ya da katılımcı listesinden “Mesaj” ile yeni yazışma başlatırsın.</span>
            </div>
          )}
        </section>
      </div>
      <TabBar initials={viewer.initials} />
    </main>
  );
}
