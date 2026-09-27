"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { comment } from "@/app/actions";
import { Avatar } from "@/components/plan/Avatar";

/** "+ Yorum yaz" composer on the plan feed; Enter or Gönder posts, the page refreshes with the new item. */
export function CommentBox({ code, initials, gradient, placeholder = "+ Yorum yaz" }: { code: string; initials: string; gradient: string; placeholder?: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const send = () => {
    const body = text.trim();
    if (!body || pending) return;
    start(async () => {
      const r = await comment(code, body);
      if (!r.ok) return setErr("Yorum gönderilemedi.");
      setErr(null);
      setText("");
      router.refresh();
    });
  };
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3 rounded-xl border border-white/14 bg-white/10 py-2.5 pl-3 pr-2">
        <Avatar initials={initials} gradient={gradient} size={40} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          maxLength={500}
          placeholder={placeholder}
          aria-label="Yorum"
          className="min-w-0 grow bg-transparent text-[17px] outline-none placeholder:opacity-60"
        />
        <button type="button" onClick={send} disabled={!text.trim() || pending} className="h-9 shrink-0 rounded-pill bg-white px-3.5 text-sm font-extrabold text-bg disabled:opacity-40">
          Gönder
        </button>
      </div>
      {err && <span className="text-sm font-bold" role="alert">{err}</span>}
    </div>
  );
}
