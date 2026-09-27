import { MarkTile } from "@/components/brand/Mark";

export const metadata = { title: "Giriş" };

/** Maps to `Login`: e-mail → 6-digit code / magic link via Resend. Wired up last. */
export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 aura-top" aria-hidden />
      <div className="relative flex w-full max-w-[460px] flex-col items-center gap-7">
        <MarkTile size={84} />
        <div className="text-center">
          <h1 className="display text-[36px]">Giriş yap ya da kaydol</h1>
          <p className="mt-2 text-muted">Şifre yok. E-postana tek seferlik kod ve giriş linki göndeririz.</p>
        </div>
        <form className="flex w-full flex-col gap-3" action="#">
          <label htmlFor="email" className="sr-only">
            E-posta adresi
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ad@ornek.com"
            className="h-14 rounded-lg border border-white/18 bg-white/6 px-4 text-lg font-semibold placeholder:text-subtle"
          />
          <button type="submit" className="h-14 rounded-pill bg-white text-base font-extrabold text-bg">
            Kodu gönder
          </button>
          <p className="text-center text-[13px] leading-relaxed text-subtle">
            Devam ederek Kullanım Koşulları’nı ve KVKK Aydınlatma Metni’ni kabul etmiş olursun. E-postan düzenleyenlere gösterilmez.
          </p>
        </form>
      </div>
    </main>
  );
}
