import { themeById } from "@partile/ui-tokens";
import { Mark } from "@/components/brand/Mark";
import { Poster } from "@/components/plan/Poster";
import { RsvpButtons } from "@/components/plan/RsvpButtons";
import { titleFontStyle } from "@/lib/fonts";

const chips = [
  { i: "MK", name: "Mert", status: "Geliyorum", bg: "linear-gradient(135deg, #1EC9B0, #0E7C86)", pos: "left-[380px] top-[330px] rotate-[5deg]", fg: "#0C0C0D" },
  { i: "BY", name: "Buse", status: "Geliyorum · +1", bg: "linear-gradient(135deg, #F59E0B, #C2410C)", pos: "left-[400px] top-[420px] -rotate-[3deg]", fg: "#0C0C0D" },
  { i: "EÇ", name: "Ege", status: "Belki", bg: "linear-gradient(135deg, #38BDF8, #1D4ED8)", pos: "left-[20px] top-[520px] rotate-[3deg]", fg: "#FFFFFF", muted: true },
];

/** Phone mock of an invitation with a WhatsApp bubble and floating RSVP chips (Landing hero, right). */
export function HeroVisual() {
  const t = themeById("kor");
  return (
    <div className="relative hidden h-[720px] w-[600px] shrink-0 lg:block" aria-hidden>
      <div className="absolute left-[150px] top-5 h-[680px] w-[320px] overflow-hidden rounded-[44px] border-8 border-[#1E1E21] bg-bg shadow-[0_50px_120px_rgba(0,0,0,0.6)]">
        <div className="flex h-full flex-col items-center gap-3.5 px-4.5 pt-[54px]" style={{ background: t.bg, color: t.fg }}>
          <span className="text-[34px] leading-none" style={titleFontStyle("eklektik")}>
            Ece 30 Oluyor
          </span>
          <Poster themeId="kor" text="30" className="w-[268px] !rounded-md" style={{ height: 220, aspectRatio: "auto" }} numeralSize="48%" />
          <div className="flex w-full flex-col">
            <span className="display text-[22px] tracking-normal">Cumartesi, 17 Ekim</span>
            <span className="text-[15px] opacity-85">20:00 · Moda, Kadıköy</span>
          </div>
          <span className="display mt-1 text-base tracking-normal">Geliyor musun?</span>
          <div className="scale-[0.75] origin-top">
            <RsvpButtons size={104} />
          </div>
        </div>
      </div>

      <div className="absolute left-0 top-[120px] flex w-[250px] -rotate-[4deg] flex-col gap-1.5 rounded-[16px_16px_16px_4px] bg-[#005C4B] px-3 py-2.5 text-[#E9EDEF] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <span className="flex items-center gap-2 text-xs font-bold text-amber-soft">
          <Mark size={16} solid /> partile
        </span>
        <span className="text-sm leading-snug">Cumartesi Moda’dayız, Ece’nin 30’u. Geliyor musun?</span>
        <span className="self-end text-[11px] text-[#8696A0]">14:02 ✓✓</span>
      </div>

      {chips.map((c) => (
        <div key={c.name} className={`absolute flex items-center gap-2.5 rounded-pill bg-text py-2.5 pl-2.5 pr-3.5 text-bg shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${c.pos}`}>
          <span className="flex size-8 items-center justify-center rounded-pill text-[11px] font-extrabold" style={{ background: c.bg, color: c.fg }}>
            {c.i}
          </span>
          <span className="flex flex-col leading-[1.1]">
            <span className="text-sm font-extrabold">{c.name}</span>
            <span className={`text-xs font-bold ${c.muted ? "text-[#5F584F]" : "text-[#0E5E57]"}`}>{c.status}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
