"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { VerificationCode } from "@partile/core";
import { MarkTile } from "@/components/brand/Mark";
import { routes } from "@/lib/routes";
import { maskEmail, useSession } from "@/lib/session";

const RESEND_SECONDS = 45;

/** `Login` artboard: e-mail → six code boxes. Any 6 digits pass until Resend is wired. */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { signIn } = useSession();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [err, setErr] = useState<string | null>(null);
  const [left, setLeft] = useState(RESEND_SECONDS);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "code" || left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [step, left]);

  const sendCode = () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Geçerli bir e-posta gir.");
    setErr(null);
    setLeft(RESEND_SECONDS);
    setStep("code");
    setTimeout(() => boxes.current[0]?.focus(), 50);
  };

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length > 1) {
      // paste: spread across the boxes
      const next = [...digits];
      clean.slice(0, 6).split("").forEach((ch, k) => (next[i + k] = ch));
      setDigits(next.slice(0, 6));
      boxes.current[Math.min(5, i + clean.length)]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < 5) boxes.current[i + 1]?.focus();
  };

  const verify = () => {
    const code = digits.join("");
    if (!VerificationCode.safeParse(code).success) return setErr("6 haneli kodu gir.");
    setErr(null);
    const s = signIn(email.trim().toLowerCase());
    router.push(s.onboarded ? next || routes.home : `${routes.onboarding}${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  };

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
              <button type="submit" className="h-14 rounded-pill bg-white text-base font-extrabold text-bg">Kodu gönder</button>
              <p className="text-center text-[13px] leading-relaxed text-subtle">
                Devam ederek <Link href="#" className="font-bold text-muted">Kullanım Koşulları</Link>’nı ve <Link href="#" className="font-bold text-muted">KVKK Aydınlatma Metni</Link>’ni kabul etmiş olursun. E-postan düzenleyenlere gösterilmez.
              </p>
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
            <div role="group" aria-label="6 haneli kod" className="flex gap-2 md:gap-2.5">
              {digits.map((d, i) => (
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
                    if (e.key === "Enter") verify();
                  }}
                  onFocus={(e) => e.target.select()}
                  className={`display h-[72px] w-[48px] rounded-lg border bg-white/8 text-center text-[32px] tracking-normal outline-none md:w-[60px] ${d ? "border-white/35" : "border-white/18"} focus:border-amber focus:border-2`}
                />
              ))}
            </div>
            <div className="flex w-full flex-col gap-3">
              {err && <p className="text-center text-sm font-bold text-[#FF8C6B]">{err}</p>}
              <button type="button" onClick={verify} className="h-14 rounded-pill bg-white text-base font-extrabold text-bg">Giriş yap</button>
              <p className="text-center text-sm text-subtle">
                Kod gelmedi mi?{" "}
                {left > 0 ? (
                  <span className="text-muted">Yeniden gönder (0:{String(left).padStart(2, "0")})</span>
                ) : (
                  <button type="button" onClick={() => setLeft(RESEND_SECONDS)} className="font-bold text-muted">Yeniden gönder</button>
                )}{" "}
                · Spam klasörüne de bak
              </p>
              <p className="text-center text-xs text-subtle">Geliştirme: e-posta bağlanana kadar herhangi bir 6 hane geçer.</p>
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
