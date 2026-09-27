import Link from "next/link";
import { PublicFooter } from "@/components/shell/PublicFooter";
import { PublicNav } from "@/components/shell/PublicNav";
import { LEGAL } from "@/lib/legal";

const TABS = [
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/gizlilik", label: "Gizlilik ve Çerezler" },
  { href: "/kosullar", label: "Kullanım Koşulları" },
];

/** Shared frame for the legal pages: public header, tabs between the three texts, readable column. */
export function LegalPage({ current, title, lead, children }: { current: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <main className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] aura-top opacity-60" aria-hidden />
      <div className="relative">
        <PublicNav />
        <article className="mx-auto flex max-w-[760px] flex-col gap-6 px-4 pb-10 pt-10 md:pt-16">
          <nav aria-label="Yasal metinler" className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <Link key={t.href} href={t.href} aria-current={t.href === current ? "page" : undefined} className={`flex h-9 items-center rounded-pill px-3.5 text-[13px] ${t.href === current ? "border border-white/40 bg-white/14 font-bold" : "bg-white/8 font-semibold text-muted hover:text-text"}`}>
                {t.label}
              </Link>
            ))}
          </nav>
          <header className="flex flex-col gap-2">
            <h1 className="display text-[34px] leading-tight tracking-tight md:text-[44px]">{title}</h1>
            <p className="text-muted">{lead}</p>
            <p className="text-[13px] text-subtle">Son güncelleme: {LEGAL.updated}</p>
          </header>
          <div className="legal flex flex-col gap-5 text-[16px] leading-relaxed text-[#E6E1D8] [&_h2]:display [&_h2]:pt-3 [&_h2]:text-[22px] [&_h2]:tracking-tight [&_h2]:text-text [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-text [&_a]:font-bold [&_a]:text-text [&_a]:underline-offset-2 hover:[&_a]:underline [&_table]:w-full [&_td]:border-b [&_td]:border-white/8 [&_td]:py-2 [&_td]:pr-3 [&_td]:align-top [&_th]:pb-2 [&_th]:pr-3 [&_th]:text-left [&_th]:text-[13px] [&_th]:text-subtle">
            {children}
          </div>
          <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted">
            Sorun ya da talebin için: <a href={`mailto:${LEGAL.email}`} className="font-bold text-text">{LEGAL.email}</a>
          </p>
        </article>
        <PublicFooter />
      </div>
    </main>
  );
}
