"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";
import { BellIcon, ExploreIcon, HomeIcon, PlusIcon } from "./icons";

/** Mobile bottom navigation (`__TABBAR__` on the canvas). Desktop uses `Rail`. */
export function TabBar({ initials = "OB" }: { initials?: string }) {
  const path = usePathname();
  const items = [
    { href: routes.home, label: "Ana sayfa", Icon: HomeIcon },
    { href: routes.explore, label: "Keşfet", Icon: ExploreIcon },
    { href: routes.create, label: "Oluştur", Icon: null },
    { href: routes.notifications, label: "Bildirimler", Icon: BellIcon },
    { href: routes.profile, label: "Profil", Icon: null },
  ];
  return (
    <nav aria-label="Alt menü" className="fixed inset-x-0 bottom-0 z-30 flex h-[84px] items-center justify-around border-t border-line bg-bg/88 px-3 pb-[22px] pt-1.5 backdrop-blur-md md:hidden">
      {items.map(({ href, label, Icon }) => {
        const on = path.startsWith(href);
        return (
          <Link key={label} href={href} aria-label={label} aria-current={on ? "page" : undefined} className={`flex size-14 items-center justify-center ${on ? "text-white" : "text-subtle"}`}>
            {label === "Oluştur" ? (
              <span className="flex size-12 items-center justify-center rounded-pill bg-white text-bg"><PlusIcon size={22} strokeWidth={2.6} /></span>
            ) : Icon ? (
              <Icon size={26} />
            ) : (
              <span className="flex size-7 items-center justify-center rounded-pill text-[11px] font-extrabold text-bg" style={{ background: "linear-gradient(135deg, #1EC9B0, #FFB020)", border: `2px solid ${on ? "#FFFFFF" : "#A8A39B"}` }}>{initials}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
