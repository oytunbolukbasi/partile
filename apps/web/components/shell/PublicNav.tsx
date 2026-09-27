import Link from "next/link";
import { MarkTile, Wordmark } from "@/components/brand/Mark";
import { routes } from "@/lib/routes";
import { PlusIcon } from "./icons";

export const occasions = [
  { slug: "dogum-gunu-davetiyesi", label: "Doğum günü" },
  { slug: "yemek-davetiyesi", label: "Yemek & brunch" },
  { slug: "ev-partisi-davetiyesi", label: "Ev partisi" },
  { slug: "yilbasi-davetiyesi", label: "Yılbaşı" },
  { slug: "kina-nisan-davetiyesi", label: "Kına & nişan" },
] as const;

/** Header for logged-out surfaces: landing, occasion pages. */
export function PublicNav({ active }: { active?: string }) {
  return (
    <header className="flex h-[76px] items-center gap-9 px-4 md:px-12">
      <Link href={routes.landing} className="flex items-center gap-2.5">
        <MarkTile />
        <Wordmark />
      </Link>
      <nav aria-label="Ana menü" className="hidden items-center gap-6 lg:flex">
        {occasions.map((o) => (
          <Link
            key={o.slug}
            href={routes.occasion(o.slug)}
            className={`py-2 text-[15px] ${o.slug === active ? "font-bold text-text" : "font-semibold text-muted hover:text-text"}`}
          >
            {o.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex gap-2.5">
        <Link href={routes.login} className="flex h-11 items-center rounded-pill border border-white/30 px-4.5 text-[15px] font-bold">
          Giriş
        </Link>
        <Link href={routes.create} className="flex h-11 items-center gap-2 rounded-pill bg-white px-5 text-[15px] font-extrabold text-bg">
          <PlusIcon />
          Oluştur
        </Link>
      </div>
    </header>
  );
}
