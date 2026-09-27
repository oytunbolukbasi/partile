import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { themeById } from "@partile/ui-tokens";
import { Poster } from "@/components/plan/Poster";
import { PublicFooter } from "@/components/shell/PublicFooter";
import { PublicNav } from "@/components/shell/PublicNav";
import { MessagesIcon, ShareIcon, SparklesIcon } from "@/components/shell/icons";
import { titleFontStyle } from "@/lib/fonts";
import { getOccasion, occasions } from "@/lib/occasions";
import { routes } from "@/lib/routes";

type Props = { params: Promise<{ occasion: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return occasions.map((o) => ({ occasion: o.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = getOccasion((await params).occasion);
  if (!o) return {};
  return { title: o.title, description: o.lead, alternates: { canonical: `https://getpartile.com/${o.slug}` } };
}

/** `Occasion` artboard: SEO landing per occasion — hero, template grid, feature trio, copy + FAQ, other occasions band. */
export default async function OccasionPage({ params }: Props) {
  const o = getOccasion((await params).occasion);
  if (!o) notFound();
  const others = occasions.filter((x) => x.slug !== o.slug);
  const heroA = o.templates[0]!;
  const heroB = o.templates[1]!;

  return (
    <main className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] aura-top" aria-hidden />
      <div className="relative">
        <PublicNav active={o.slug} />

        <section className="flex flex-col items-center gap-10 px-4 pb-16 pt-8 md:flex-row md:px-24 md:py-20 md:gap-16">
          <div className="flex max-w-[680px] flex-col gap-5">
            <span className="text-sm font-extrabold tracking-wider text-amber">{o.eyebrow}</span>
            <h1 className="display text-[44px] leading-[0.98] tracking-[-0.04em] md:text-[76px]">{o.title}</h1>
            <p className="max-w-[560px] text-lg leading-relaxed text-[#E6E1D8] md:text-xl">{o.lead}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={routes.create} className="flex h-14 items-center rounded-pill bg-white px-6.5 text-[17px] font-extrabold text-bg">Ücretsiz davetiye oluştur</Link>
              <Link href="#sablonlar" className="flex h-14 items-center rounded-pill border border-white/30 px-5.5 text-base font-bold">Şablonlara bak</Link>
            </div>
          </div>
          <div className="relative h-[340px] w-full max-w-[520px] shrink-0 md:h-[420px]">
            <TemplateTile t={heroA} className="absolute left-[8%] top-[6%] w-[58%] -rotate-6 shadow-[0_40px_80px_rgba(0,0,0,0.5)]" />
            <TemplateTile t={heroB} className="absolute left-[46%] top-[22%] w-[50%] rotate-[7deg] shadow-[0_40px_80px_rgba(0,0,0,0.5)]" />
          </div>
        </section>

        <section id="sablonlar" className="flex flex-col gap-6 px-4 md:px-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5"><h2 className="display text-[32px] tracking-tight md:text-[40px]">Sonsuz tasarım seçeneği</h2><p className="text-[17px] text-muted">Şablonla başla ya da kendininkini yap.</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {o.templates.map((t) => (
              <Link key={t.name} href={routes.create} className="relative flex flex-col gap-2">
                <TemplateTile t={t} className="w-full" />
                <span className="text-sm font-bold">{t.name}</span>
              </Link>
            ))}
          </div>
          <Link href={routes.create} className="flex h-12 items-center self-center rounded-pill border border-white/30 px-5.5 text-[15px] font-bold">Tüm şablonlar</Link>
        </section>

        <section className="flex flex-col gap-6 px-4 pt-20 md:px-24">
          <div className="flex flex-col gap-1.5"><h2 className="display text-[32px] tracking-tight md:text-[40px]">{o.h2}</h2><p className="text-[17px] text-muted">Tarayıcıda, iPhone’da, Android’de %100 ücretsiz.</p></div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { Icon: SparklesIcon, c: "#FF6A3D", t: "Tema ve efektler", d: "Renk, font, konfeti: davetiye senin havanı taşısın.", href: routes.create },
              { Icon: ShareIcon, c: "#1EC9B0", t: "Tek linkle davet", d: "WhatsApp’a at; misafirlerin uygulama indirmesi gerekmez.", href: routes.create },
              { Icon: MessagesIcon, c: "#FFB020", t: "Herkese duyur", d: "Geç mi kaldın? Bir mesajla herkese ulaş.", href: routes.create },
            ].map(({ Icon, c, t, d, href }) => (
              <div key={t} className="flex flex-col gap-2.5 rounded-2xl border border-white/8 bg-panel p-6">
                <span className="flex size-11 items-center justify-center rounded-md" style={{ background: `${c}2E`, color: c }}><Icon size={22} /></span>
                <span className="text-[22px] font-bold tracking-tight">{t}</span>
                <span className="text-[15px] leading-relaxed text-muted">{d}</span>
                <Link href={href} className="text-sm font-bold text-amber">Dene ↗</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 px-4 pt-20 md:grid-cols-[1.2fr_1fr] md:gap-12 md:px-24">
          <div className="flex flex-col gap-3.5">
            <h2 className="display text-[28px] tracking-tight md:text-[32px]">İyi bir {o.eyebrow.toLocaleLowerCase("tr-TR")} davetiyesi nasıl olur?</h2>
            {o.seo.map((p) => <p key={p.slice(0, 20)} className="leading-relaxed text-muted">{p}</p>)}
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-xl font-bold">Sık sorulanlar</span>
            {o.faq.map((f) => (
              <details key={f.q} className="group rounded-lg border border-white/8 bg-white/5 px-4 py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-bold [&::-webkit-details-marker]:hidden">{f.q}<span className="text-subtle transition group-open:rotate-45">+</span></summary>
                <p className="pt-2.5 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-4 mt-20 flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[#161618] p-6 md:mx-24 md:flex-row md:items-center md:justify-between md:px-10 md:py-9" style={{ backgroundImage: "radial-gradient(50% 100% at 10% 50%, rgba(194,65,12,0.7), rgba(194,65,12,0) 70%), radial-gradient(45% 100% at 95% 50%, rgba(255,176,32,0.6), rgba(255,176,32,0) 70%)" }}>
          <span className="display text-[24px] tracking-tight md:text-[34px]">
            Diğer davetiyeler:{" "}
            <span className="font-semibold text-muted">
              {others.map((x, i) => (
                <span key={x.slug}>{i > 0 && " · "}<Link href={routes.occasion(x.slug)} className="hover:text-text">{x.eyebrow.charAt(0) + x.eyebrow.slice(1).toLocaleLowerCase("tr-TR")}</Link></span>
              ))}
            </span>
          </span>
          <Link href={routes.landing} className="flex h-[52px] shrink-0 items-center rounded-pill bg-white px-5.5 text-base font-extrabold text-bg">Tümünü gör</Link>
        </section>

        <PublicFooter />
      </div>
    </main>
  );
}

function TemplateTile({ t, className = "" }: { t: { text: string; theme: string; font: string; size: number }; className?: string }) {
  const th = themeById(t.theme);
  const numeral = /^\d+$/.test(t.text);
  if (numeral) return <Poster themeId={t.theme} text={t.text} className={`rounded-xl ${className}`} />;
  return (
    <span className={`flex aspect-square items-center justify-center whitespace-pre-line rounded-xl p-3 text-center leading-none ${className}`} style={{ background: th.poster, color: th.fg, fontSize: t.size, ...titleFontStyle(t.font) }}>
      {t.text}
    </span>
  );
}
