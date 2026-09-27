import Link from "next/link";
import { MarkTile, Wordmark } from "@/components/brand/Mark";
import { routes } from "@/lib/routes";

const links: [string, string][] = [["Gizlilik", "/gizlilik"], ["KVKK", "/kvkk"], ["Kullanım koşulları", "/kosullar"], ["İletişim", "mailto:merhaba@getpartile.com"]];

export function PublicFooter() {
  return (
    <footer className="mt-16 flex flex-col items-center gap-5 border-t border-line px-4 pb-8 pt-10">
      <div className="flex items-center gap-2.5">
        <MarkTile />
        <Wordmark size={24} />
      </div>
      <div className="flex gap-2.5">
        <Link href={routes.create} className="flex h-11 items-center rounded-pill bg-text px-4.5 text-sm font-extrabold text-bg">
          Ücretsiz plan oluştur
        </Link>
        <Link href={routes.occasion("dogum-gunu-davetiyesi")} className="flex h-11 items-center rounded-pill border border-line px-4.5 text-sm font-bold">
          Davetiye şablonları
        </Link>
      </div>
      <div className="flex flex-wrap justify-center gap-5 text-[15px] font-semibold text-subtle">
        <span>Türkçe ▾</span>
        {links.map(([l, href]) => (
          <Link key={l} href={href} className="hover:text-text">
            {l}
          </Link>
        ))}
      </div>
      <div className="text-xs text-subtle">© 2026 partile · İstanbul · getpartile.com</div>
    </footer>
  );
}
