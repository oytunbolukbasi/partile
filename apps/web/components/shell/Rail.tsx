"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MarkTile } from "@/components/brand/Mark";
import { routes } from "@/lib/routes";
import { BellIcon, CardIcon, CreateIcon, ExploreIcon, HomeIcon, MessagesIcon } from "./icons";

export type RailKey = "home" | "explore" | "create" | "card" | "messages" | "bell";

const items: { key: RailKey; href: string; label: string; Icon: typeof HomeIcon }[] = [
  { key: "home", href: routes.home, label: "Ana sayfa", Icon: HomeIcon },
  { key: "explore", href: routes.explore, label: "Keşfet", Icon: ExploreIcon },
  { key: "create", href: routes.create, label: "Plan oluştur", Icon: CreateIcon },
  { key: "card", href: "#", label: "Kart gönder", Icon: CardIcon },
  { key: "messages", href: "#", label: "Mesajlar", Icon: MessagesIcon },
  { key: "bell", href: routes.notifications, label: "Bildirimler", Icon: BellIcon },
];

/** 72 px icon rail for signed-in desktop screens. Settings live under the avatar, not here. */
export function Rail({ active, initials = "OB" }: { active?: RailKey; initials?: string }) {
  const path = usePathname();
  const current = active ?? items.find((i) => i.href !== "#" && path.startsWith(i.href))?.key;
  return (
    <nav
      aria-label="Ana menü"
      className="fixed left-0 top-0 hidden h-dvh w-[var(--rail-w)] flex-col items-center border-r border-line bg-bg/55 pb-4 pt-5 md:flex"
    >
      <Link href={routes.home} aria-label="partile">
        <MarkTile />
      </Link>
      <div className="mt-[88px] flex flex-col items-center gap-[22px]">
        {items.map(({ key, href, label, Icon }) => {
          const on = key === current;
          return (
            <Link
              key={key}
              href={href}
              aria-label={label}
              aria-current={on ? "page" : undefined}
              className={`flex size-11 items-center justify-center rounded-md ${on ? "bg-white/12 text-white" : "text-subtle hover:text-text"}`}
            >
              <Icon />
            </Link>
          );
        })}
      </div>
      <div className="mt-auto flex w-12 flex-col items-center border-t border-line pt-4">
        <Link
          href={routes.profile}
          aria-label="Profil"
          className="flex size-9 items-center justify-center rounded-pill text-[13px] font-extrabold text-bg"
          style={{ background: "linear-gradient(135deg, #1EC9B0, #FFB020)" }}
        >
          {initials}
        </Link>
      </div>
    </nav>
  );
}
