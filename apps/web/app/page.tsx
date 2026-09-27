import Link from "next/link";
import { PublicFooter } from "@/components/shell/PublicFooter";
import { PublicNav } from "@/components/shell/PublicNav";
import { ArrowRightIcon } from "@/components/shell/icons";
import { routes } from "@/lib/routes";

/** Landing hero — first slice of the `Landing` artboard. Sections below the hero come next. */
export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] aura-top" aria-hidden />
      <div className="relative">
        <PublicNav />
        <section className="mx-auto flex max-w-[1248px] flex-col gap-7 px-4 pb-24 pt-16 md:px-12 md:pt-28">
          <span className="w-fit rounded-pill border border-white/25 bg-bg/35 px-3.5 py-2 text-sm font-bold">
            Ücretsiz · uygulama gerekmez · Türkiye için
          </span>
          <h1 className="display text-[54px] md:text-[96px]">
            Plan yap.
            <br />
            Linki at.
            <br />
            Kim geliyor gör.
          </h1>
          <p className="max-w-[520px] text-lg leading-snug text-muted md:text-[22px]">
            Dakikada davetiye hazırla, WhatsApp’ta paylaş, katılımları tek yerden takip et. Grup sohbeti karmaşasına son.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={routes.create}
              className="flex h-[60px] items-center gap-2.5 rounded-pill bg-white px-7 text-lg font-extrabold text-bg shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
            >
              Davetiye oluştur
              <ArrowRightIcon />
            </Link>
            <a href="#nasil" className="flex h-[60px] items-center rounded-pill border border-white/30 px-5.5 text-[17px] font-bold">
              Nasıl çalışır?
            </a>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            <span>Giriş duvarı yok</span>
            <span aria-hidden>·</span>
            <span>Misafirin e-postası sende kalmaz</span>
            <span aria-hidden>·</span>
            <span>KVKK uyumlu</span>
          </div>
        </section>
        <PublicFooter />
      </div>
    </div>
  );
}
