import Link from "next/link";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { ClosingCta, Customize, FeatureTrio, HowItWorks, TemplateStrip } from "@/components/landing/sections";
import { PublicFooter } from "@/components/shell/PublicFooter";
import { PublicNav } from "@/components/shell/PublicNav";
import { ArrowRightIcon } from "@/components/shell/icons";
import { routes } from "@/lib/routes";

/** Landing — `Landing` / `LandingMobile` artboards. */
export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] aura-top" aria-hidden />
      <div className="relative">
        <PublicNav />
        <section className="mx-auto flex max-w-[1248px] items-center gap-10 px-4 pb-16 pt-12 md:px-12 md:pb-24 md:pt-20">
          <div className="flex flex-col gap-6 md:gap-7">
            <span className="w-fit rounded-pill border border-white/25 bg-bg/35 px-3.5 py-2 text-[13px] font-bold md:text-sm">
              Ücretsiz · uygulama gerekmez · Türkiye için
            </span>
            <h1 className="display text-[54px] md:text-[88px] lg:whitespace-nowrap">
              Plan yap.
              <br />
              Linki at.
              <br />
              Kim geliyor gör.
            </h1>
            <p className="max-w-[520px] text-[17px] leading-snug text-muted md:text-[22px]">
              Dakikada davetiye hazırla, WhatsApp’ta paylaş, katılımları tek yerden takip et. Grup sohbeti karmaşasına son.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={routes.create}
                className="flex h-14 items-center gap-2.5 rounded-pill bg-white px-6 text-[17px] font-extrabold text-bg shadow-[0_16px_40px_rgba(0,0,0,0.35)] md:h-[60px] md:px-7 md:text-lg"
              >
                Davetiye oluştur
                <ArrowRightIcon />
              </Link>
              <a href="#nasil" className="flex h-14 items-center rounded-pill border border-white/30 px-5 text-[16px] font-bold md:h-[60px] md:px-5.5 md:text-[17px]">
                Nasıl çalışır?
              </a>
            </div>
          </div>
          <HeroVisual />
        </section>
        <Customize />
        <TemplateStrip />
        <FeatureTrio />
        <HowItWorks />
        <ClosingCta />
        <PublicFooter />
      </div>
    </div>
  );
}
