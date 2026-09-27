"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { requestCode, verifyCode } from "@/app/actions";
import { MarkTile } from "@/components/brand/Mark";
import { routes } from "@/lib/routes";

const RESEND_SECONDS = 45;

/** `o•••n@gmail.com` — what the code step shows. */
export const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return `${user[0]}•••${user.length > 1 ? user[user.length - 1] : ""}@${domain}`;
};

/** Six code boxes with auto-advance and paste support. Shared by login and the RSVP flow. */
export function CodeBoxes({ value, onChange, onEnter, size = "md" }: { value: string[]; onChange: (v: string[]) => void; onEnter?: () => void; size?: "md" | "sm" }) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    boxes.current[0]?.focus();
  }, []);
  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "");
    const next = [...value];
    if (clean.length > 1) {
      clean.slice(0, 6 - i).split("").forEach((ch, k) => (next[i + k] = ch));
      onChange(next);
      boxes.current[Math.min(5, i + clean.length)]?.focus();
      return;
    }
    next[i] = clean;
    onChange(next);
    if (clean && i < 5) boxes.current[i + 1]?.focus();
  };
  const dims = size === "md" ? "h-[72px] w-[48px] text-[32px] md:w-[60px]" : "h-14 w-[42px] text-2xl md:w-[52px]";
  return (
    <div role="group" aria-label="6 haneli kod" className="flex gap-2 md:gap-2.5">
      {value.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            boxes.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`${i + 1}. hane`}
          value={d}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) boxes.current[i - 1]?.focus();
            if (e.key === "Enter") onEnter?.();
          }}
          onFocus={(e) => e.target.select()}
          className={`display rounded-lg border bg-white/8 text-center tracking-normal outline-none ${dims} ${d ? "border-white/35" : "border-white/18"} focus:border-2 focus:border-amber`}
        />
      ))}
    </div>
  );
}

/** `Login` artboard: e-mail → six code boxes. Until Resend is wired the code is shown on screen. */
export function LoginForm({ next, error }: { next?: string; error?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [err, setErr] = useState<string | null>(error ?? null);
  const [devCode, setDevCode] = useState<string | undefined>();
  const [left, setLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (step !== "code" || left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [step, left]);

  const sendCode = () =>
    start(async () => {
      const r = await requestCode(email, "login", next);
      if (!r.ok) return setErr(r.error);
      setErr(null);
      setDevCode(r.devCode);
      setDigits(Array(6).fill(""));
      setLeft(RESEND_SECONDS);
      setStep("code");
    });

  const verify = () =>
    start(async () => {
      const r = await verifyCode(email, digits.join(""));
      if (!r.ok) return setErr(r.error);
      setErr(null);
      router.push(r.onboarded ? next || routes.home : `${routes.onboarding}${next ? `?next=${encodeURIComponent(next)}` : ""}`);
      router.refresh();
    });

  const input = "h-14 w-full rounded-lg border border-white/18 bg-white/6 px-4 text-lg font-semibold outline-none placeholder:text-subtle focus:border-white/40";

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 aura-top" aria-hidden />
      <div className="relative flex w-full max-w-[460px] grow flex-col items-center justify-center gap-7 py-16">
        <MarkTile size={84} />
        {step === "email" ? (
          <>
            <div className="text-center">
              <h1 className="display text-[36px]">Giriş yap ya da kaydol</h1>
              <p className="mt-2 text-muted">Şifre yok. E-postana tek seferlik kod ve giriş linki göndeririz.</p>
            </div>
            <form
              className="flex w-full flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                sendCode();
              }}
            >
              <label htmlFor="email" className="sr-only">E-posta adresi</label>
              <input id="email" name="email" type="email" autoComplete="email" inputMode="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ad@ornek.com" className={input} />
              {err && <p className="text-sm font-bold text-[#FF8C6B]">{err}</p>}
              <button type="submit" disabled={pending} className="h-14 rounded-pill bg-white text-base font-extrabold text-bg disabled:opacity-60">{pending ? "Gönderiliyor…" : "Kodu gönder"}</button>
              <p className="text-center text-[13px] leading-relaxed text-subtle">
                Devam ederek <Link href="#" className="font-bold text-muted">Kullanım Koşulları</Link>’nı ve <Link href="#" className="font-bold text-muted">KVKK Aydınlatma Metni</Link>’ni kabul etmiş olursun. E-postan düzenleyenlere gösterilmez.
              </p>
              <p className="text-center text-xs text-subtle">Örnek planları düzenleyen olarak görmek için <strong className="text-muted">demo@getpartile.com</strong> ile gir.</p>
            </form>
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="display text-[36px]">E-postanı kontrol et</h1>
              <p className="mt-2 text-muted">
                <strong className="text-text">{maskEmail(email.trim())}</strong> adresine gönderdik. Linke tıkla ya da kodu gir ·{" "}
                <button type="button" onClick={() => setStep("email")} className="font-bold text-amber">Değiştir</button>
              </p>
            </div>
            <CodeBoxes value={digits} onChange={setDigits} onEnter={verify} />
            <div className="flex w-full flex-col gap-3">
              {err && <p className="text-center text-sm font-bold text-[#FF8C6B]">{err}</p>}
              <button type="button" onClick={verify} disabled={pending} className="h-14 rounded-pill bg-white text-base font-extrabold text-bg disabled:opacity-60">Giriş yap</button>
              <p className="text-center text-sm text-subtle">
                Kod gelmedi mi?{" "}
                {left > 0 ? <span className="text-muted">Yeniden gönder (0:{String(left).padStart(2, "0")})</span> : <button type="button" onClick={sendCode} className="font-bold text-muted">Yeniden gönder</button>} · Spam klasörüne de bak
              </p>
              {devCode && (
                <p className="rounded-lg border border-dashed border-amber/40 bg-amber/10 px-3.5 py-2.5 text-center text-sm">
                  Geliştirme: e-posta henüz bağlı değil, kodun <strong className="display text-lg tracking-[0.2em]">{devCode}</strong>
                </p>
              )}
            </div>
          </>
        )}
      </div>
      <div className="relative flex h-[88px] w-full items-center justify-center gap-7 border-t border-white/6 text-[15px] text-muted">
        <span>Türkçe ▾</span>
        {["Yardım", "Blog", "Hakkında", "Gizlilik"].map((l) => <Link key={l} href="#">{l}</Link>)}
      </div>
    </main>
  );
}
