"use client";

import { useState, useTransition } from "react";
import { Rsvp, type Plan } from "@partile/core";
import { requestCode, submitRsvp, verifyCode } from "@/app/actions";
import { CodeBoxes, maskEmail } from "@/components/auth/LoginForm";
import { CheckIcon, CloseIcon } from "@/components/shell/icons";
import { Modal } from "@/components/ui/Modal";
import type { Viewer } from "@/lib/auth";

type Status = "going" | "maybe" | "no";
const STATUS: { id: Status; label: string }[] = [
  { id: "going", label: "Geliyorum" },
  { id: "maybe", label: "Belki" },
  { id: "no", label: "Gelemiyorum" },
];

export type ExistingRsvp = { status: string; name: string; plusOnes?: number; plusOneNames?: string[]; note?: string; answers?: Record<string, string>; followHost?: boolean };

/**
 * `RsvpFlow` artboard: 1) status + name + e-mail → 2) e-mail code → 3) +1, questions, note, follow.
 * A signed-in viewer skips the code step. Until Resend is wired the code is shown on screen.
 */
export function RsvpFlow({ plan, viewer, open, initial = "going", existing, onClose, onDone }: { plan: Plan; viewer: Viewer | null; open: boolean; initial?: Status; existing?: ExistingRsvp | null; onClose: () => void; onDone: () => void }) {
  const [pending, start] = useTransition();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<Status>(existing && existing.status !== "invited" && existing.status !== "pending" ? (existing.status as Status) : initial);
  const [name, setName] = useState(existing?.name ?? viewer?.name ?? "");
  const [email, setEmail] = useState(viewer?.email ?? "");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [devCode, setDevCode] = useState<string | undefined>();
  const [plusOnes, setPlusOnes] = useState(existing?.plusOnes ?? 0);
  const [plusName, setPlusName] = useState(existing?.plusOneNames?.[0] ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>(existing?.answers ?? {});
  const [note, setNote] = useState(existing?.note ?? "");
  const [follow, setFollow] = useState(existing?.followHost ?? true);
  const [err, setErr] = useState<string | null>(null);

  const [seed, setSeed] = useState({ open, initial });
  if (seed.open !== open || seed.initial !== initial) {
    setSeed({ open, initial });
    setStep(1);
    setStatus(initial);
    setDigits(Array(6).fill(""));
    setErr(null);
  }

  const askDetails = status !== "no";
  const input = "h-[52px] w-full rounded-lg border border-[#CFC9C0] bg-white px-4 text-[17px] font-semibold text-bg outline-none placeholder:text-[#8A857C] focus:border-bg";
  const label = "text-[13px] font-bold";

  const finish = (currentStatus: Status = status) =>
    start(async () => {
      const missing = plan.questions.find((q) => q.required && !answers[q.id]?.trim());
      if (currentStatus !== "no" && missing) return setErr(`“${missing.text}” zorunlu.`);
      const r = Rsvp.safeParse({ status: currentStatus, name: name.trim(), email: email.trim(), plusOnes: currentStatus !== "no" ? plusOnes : 0, plusOneNames: plusOnes ? [plusName] : undefined, note: note || undefined, answers, followHost: follow });
      if (!r.success) return setErr("Bir şeyler eksik görünüyor.");
      const res = await submitRsvp(plan.code, r.data);
      if (!res.ok) return setErr(res.error);
      onDone();
    });

  const next1 = () => {
    if (!name.trim()) return setErr("Adını yaz.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Geçerli bir e-posta gir.");
    setErr(null);
    if (viewer && viewer.email === email.trim().toLowerCase()) return askDetails ? setStep(3) : finish();
    start(async () => {
      const r = await requestCode(email, "rsvp", `/e/${plan.code}`);
      if (!r.ok) return setErr(r.error);
      setDevCode(r.devCode);
      setStep(2);
    });
  };
  const next2 = () =>
    start(async () => {
      const r = await verifyCode(email, digits.join(""));
      if (!r.ok) return setErr(r.error);
      setErr(null);
      if (askDetails) setStep(3);
      else finish();
    });

  return (
    <Modal open={open} onClose={onClose} title={step === 1 ? "Geliyor musun?" : step === 2 ? "Kodu gir" : "Son birkaç şey"} width={520} headerRight={<span className="text-xs font-extrabold text-subtle">{Math.min(step, 3)} / 3</span>}>
      <div className="flex flex-col gap-4 bg-text p-5 text-bg">
        {step === 1 && (
          <>
            <div role="radiogroup" aria-label="Katılım" className="grid grid-cols-3 gap-2">
              {STATUS.filter((s) => s.id !== "maybe" || plan.allowMaybe).map((s) => {
                const on = status === s.id;
                return (
                  <button key={s.id} type="button" role="radio" aria-checked={on} onClick={() => setStatus(s.id)} className={`flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-sm font-extrabold ${on ? "border-bg bg-bg text-white" : "border-[#CFC9C0] bg-white"}`}>
                    {s.id === "going" ? <CheckIcon size={22} className={on ? "text-amber" : ""} /> : s.id === "maybe" ? <span className="text-xl leading-none">?</span> : <CloseIcon size={22} />}
                    {s.label}
                  </button>
                );
              })}
            </div>
            <label className="flex flex-col gap-1.5">
              <span className={label}>Adın</span>
              <input data-autofocus value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} placeholder="Ad Soyad" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={label}>E-posta</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" className={input} placeholder="ad@ornek.com" disabled={!!viewer} />
              <span className="text-xs text-[#5F584F]">{viewer ? "Bu e-postayla giriş yapmışsın." : "Şifre yok; e-postana tek seferlik kod gelir. E-postanı düzenleyenler göremez."}</span>
            </label>
            <label className="flex items-start gap-2.5 text-xs leading-relaxed text-[#5F584F]">
              <input type="checkbox" defaultChecked className="mt-0.5 size-5 shrink-0 accent-bg" />
              <span>Bu plan için hatırlatma ve duyuru almayı kabul ediyorum. KVKK aydınlatma metni</span>
            </label>
            {err && <p className="text-sm font-bold text-[#C2410C]">{err}</p>}
            <button type="button" onClick={next1} disabled={pending} className="h-14 rounded-pill bg-bg text-base font-extrabold text-white disabled:opacity-60">
              {viewer ? (askDetails ? "Devam et" : "Kaydet") : "Kodu gönder"}
            </button>
            {existing && <p className="text-center text-xs text-[#5F584F]">Şu anki cevabın: <strong>{STATUS.find((s) => s.id === existing.status)?.label ?? "—"}</strong></p>}
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-[15px] text-[#5F584F]">
              <strong className="text-bg">{maskEmail(email.trim())}</strong> adresine kod gönderdik. Linke tıkla ya da kodu gir ·{" "}
              <button type="button" onClick={() => setStep(1)} className="font-bold text-bg underline-offset-2 hover:underline">Değiştir</button>
            </p>
            <div className="flex justify-center [&_input]:border-[#CFC9C0] [&_input]:bg-white [&_input]:text-bg"><CodeBoxes value={digits} onChange={setDigits} onEnter={next2} size="sm" /></div>
            {devCode && <p className="rounded-lg border border-dashed border-[#C2410C]/40 bg-[#C2410C]/8 px-3.5 py-2.5 text-center text-sm">Geliştirme: e-posta henüz bağlı değil, kodun <strong className="display text-lg tracking-[0.2em]">{devCode}</strong></p>}
            <div className="rounded-lg border border-[#E2D7C5] bg-white px-3.5 py-3 text-sm">Kod gelmedi mi? <button type="button" onClick={next1} className="font-bold">Yeniden gönder</button> · Spam klasörüne bak</div>
            {err && <p className="text-sm font-bold text-[#C2410C]">{err}</p>}
            <button type="button" onClick={next2} disabled={pending} className="h-14 rounded-pill bg-bg text-base font-extrabold text-white disabled:opacity-60">Doğrula</button>
          </>
        )}

        {step === 3 && (
          <>
            {plan.plusOnesMax > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-[#E2D7C5] bg-white px-3.5 py-3">
                <span className="flex flex-col"><span className="font-bold">+1 misafir</span><span className="text-xs text-[#5F584F]">En fazla {plan.plusOnesMax} kişi</span></span>
                <span className="flex items-center gap-3">
                  <button type="button" aria-label="Azalt" onClick={() => setPlusOnes(Math.max(0, plusOnes - 1))} className="size-10 rounded-pill border border-[#CFC9C0] text-lg font-bold">−</button>
                  <span className="min-w-4 text-center text-lg font-extrabold">{plusOnes}</span>
                  <button type="button" aria-label="Artır" onClick={() => setPlusOnes(Math.min(plan.plusOnesMax, plusOnes + 1))} className="size-10 rounded-pill border border-[#CFC9C0] text-lg font-bold">+</button>
                </span>
              </div>
            )}
            {plusOnes > 0 && plan.requirePlusOneNames && (
              <label className="flex flex-col gap-1.5"><span className={label}>+1 misafirin adı</span><input value={plusName} onChange={(e) => setPlusName(e.target.value)} className={`${input} h-12`} placeholder="Ad" /></label>
            )}
            {plan.questions.map((q) => (
              <div key={q.id} className="flex flex-col gap-1.5">
                <span className={label}>{q.text} {q.required && <span className="text-[#C2410C]">*</span>} <span className="font-medium text-[#5F584F]">· {plan.hosts[0]?.name} soruyor</span></span>
                {q.type === "single" ? (
                  <div className="flex flex-wrap gap-2">
                    {(q.options ?? []).map((o) => (
                      <button key={o} type="button" aria-pressed={answers[q.id] === o} onClick={() => setAnswers({ ...answers, [q.id]: o })} className={`h-11 grow rounded-pill border text-sm font-bold ${answers[q.id] === o ? "border-bg bg-bg text-white" : "border-[#CFC9C0] bg-white"}`}>{o}</button>
                    ))}
                  </div>
                ) : (
                  <input value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} className={`${input} h-12`} placeholder="Cevabın" />
                )}
              </div>
            ))}
            <label className="flex flex-col gap-1.5">
              <span className={label}>Bir not bırak <span className="font-medium text-[#5F584F]">(akışta görünür)</span></span>
              <input value={note} onChange={(e) => setNote(e.target.value)} className={`${input} h-12`} placeholder="Tatlıyı ben getiriyorum!" maxLength={280} />
            </label>
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} className="size-5 accent-bg" />
              {plan.hosts.map((h) => h.name).join(" & ")}’i takip et, sonraki planlardan haberim olsun
            </label>
            {err && <p className="text-sm font-bold text-[#C2410C]">{err}</p>}
            <button type="button" onClick={() => finish()} disabled={pending} className="flex h-14 items-center justify-center gap-2 rounded-pill bg-bg text-base font-extrabold text-white disabled:opacity-60">
              <CheckIcon size={18} className="text-amber" /> {STATUS.find((s) => s.id === status)?.label}!
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
