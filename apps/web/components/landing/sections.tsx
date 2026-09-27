import Link from "next/link";
import { themeById } from "@partile/ui-tokens";
import { Mark } from "@/components/brand/Mark";
import { Poster } from "@/components/plan/Poster";
import { routes } from "@/lib/routes";
import { titleFontStyle } from "@/lib/fonts";

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="display text-[32px] md:text-[48px]">{children}</h2>;
const Lead = ({ children }: { children: React.ReactNode }) => <p className="text-[15px] text-muted md:text-[19px]">{children}</p>;
const Section = ({ children, id }: { children: React.ReactNode; id?: string }) => (
  <section id={id} className="mx-auto flex w-full max-w-[1248px] flex-col gap-6 px-4 py-10 md:px-12 md:py-14">
    {children}
  </section>
);

/* ---------- Tek dokunuşla modern davetiye ---------- */
const confetti = [
  "left-[30px] top-[40px] h-2.5 w-2.5 rotate-[20deg] bg-[#FFD166]",
  "left-[120px] top-[70px] h-3.5 w-2 -rotate-[30deg] bg-teal",
  "left-[210px] top-[30px] size-3 rounded-pill bg-coral",
  "left-[260px] top-[110px] h-2.5 w-2.5 rotate-45 bg-white",
  "left-[60px] top-[130px] h-1.5 w-3.5 rotate-[60deg] bg-amber",
  "left-[180px] top-[150px] size-2 rounded-pill bg-[#FFD166]",
];

export function Customize() {
  const card = "flex h-[150px] flex-col justify-between rounded-modal p-4 md:h-[300px] md:p-5.5";
  const title = "display text-xl tracking-tight md:text-[26px]";
  const sub = "hidden text-[15px] opacity-85 md:block";
  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <H2>Tek dokunuşla modern davetiye</H2>
          <Lead>%100 ücretsiz, paywall yok. Her plan kendi temasını taşır.</Lead>
        </div>
        <Link href={routes.create} className="hidden h-12 items-center rounded-pill border border-white/30 px-5 text-[15px] font-bold md:flex">
          Hemen dene
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-5">
        <div className={card} style={{ background: themeById("derin-deniz").bg, color: themeById("derin-deniz").fg }}>
          <div className="flex gap-2">
            {["#F59E0B,#C2410C", "#FFF0A8,#D9F99D", "#38BDF8,#1D4ED8", "#FB7185,#B91C3C"].map((g, i) => (
              <span key={g} className={`size-6 rounded-pill md:size-[34px] ${i === 0 ? "border-2 border-current" : ""}`} style={{ background: `linear-gradient(135deg, ${g})` }} />
            ))}
          </div>
          <div>
            <div className={title}>Temalar</div>
            <div className={sub}>8 hazır palet + özel renk</div>
          </div>
        </div>
        <div className={`${card} border border-line`} style={{ background: themeById("gece").bg }}>
          <div className="flex flex-col gap-1 leading-none">
            <span className="display text-lg tracking-tight md:text-[26px]">Klasik</span>
            <span className="text-lg md:text-[26px]" style={titleFontStyle("eklektik")}>Eklektik</span>
            <span className="text-[26px] md:text-[34px]" style={titleFontStyle("sik")}>Şık</span>
            <span className="hidden text-xl md:block" style={titleFontStyle("dijital")}>Dijital</span>
          </div>
          <div>
            <div className={title}>Fontlar</div>
            <div className={sub}>Türkçe karakterleriyle</div>
          </div>
        </div>
        <div className={`${card} relative overflow-hidden`} style={{ background: themeById("kor").bg, color: themeById("kor").fg }}>
          {confetti.map((c) => (
            <span key={c} className={`absolute rounded-sm ${c}`} aria-hidden />
          ))}
          <div />
          <div>
            <div className={title}>Efektler</div>
            <div className={sub}>Konfeti, kar, balon</div>
          </div>
        </div>
        <div className={card} style={{ background: themeById("pudra").bg, color: themeById("pudra").fg }}>
          <div className="flex gap-2">
            <Poster themeId="kor" text="30" className="w-[46px] !rounded-[10px] md:w-[72px]" numeralSize="55%" />
            <Poster themeId="zeytinlik" text="M" className="w-[46px] !rounded-[10px] md:w-[72px]" numeralSize="55%" />
            <Poster themeId="limonata" text="b" className="hidden w-[72px] !rounded-[10px] md:block" numeralSize="55%" />
          </div>
          <div>
            <div className={title}>Afişler</div>
            <div className={sub}>Şablon, fotoğraf ya da GIF</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Her plana, her havaya ---------- */
export const templates = [
  { name: "Otuzuna girdi", text: "30", theme: "kor", font: "klasik", size: 84 },
  { name: "Akşam yemeği", text: "akşam\nyemeği", theme: "limonata", font: "eklektik", size: 34 },
  { name: "Ev partisi", text: "EV\nPARTİSİ", theme: "gece", font: "klasik", size: 34 },
  { name: "Kına gecesi", text: "kına\ngecesi", theme: "kiraz", font: "sik", size: 46 },
  { name: "Mangal", text: "mangal", theme: "derin-deniz", font: "eklektik", size: 40 },
  { name: "Yılbaşı", text: "2027", theme: "kobalt", font: "klasik", size: 52 },
];

export function TemplateStrip() {
  const chips = ["Doğum günü", "Yemek", "Ev partisi", "Kına", "Yılbaşı"];
  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <H2>Her plana, her havaya</H2>
          <Lead>Şablonla başla, tek dokunuşla senin olsun.</Lead>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {chips.map((c, i) => (
            <Link
              key={c}
              href={i === 0 ? routes.occasion("dogum-gunu-davetiyesi") : "#"}
              className={`flex h-10 shrink-0 items-center rounded-pill px-4 text-sm ${i === 0 ? "border border-white/40 bg-white/14 font-bold" : "bg-white/8 font-semibold"}`}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-6 md:overflow-visible md:px-0">
        {templates.map((t) => {
          const th = themeById(t.theme);
          const isPoster = t.font === "klasik" && /^\d+$/.test(t.text);
          return (
            <Link key={t.name} href={routes.create} className="flex w-[150px] shrink-0 flex-col gap-2.5 md:w-auto">
              <span
                className="flex h-[150px] items-center justify-center whitespace-pre-line rounded-xl p-3 text-center leading-none md:h-[196px]"
                style={{ background: th.bg, color: th.fg, fontSize: t.size, ...(isPoster ? { fontFamily: "var(--font-poster)", fontWeight: 800, letterSpacing: "-0.06em" } : titleFontStyle(t.font)) }}
              >
                {t.text}
              </span>
              <span className="text-[15px] font-bold">{t.name}</span>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------- Diğer davetiyelere benzemiyoruz ---------- */
const Avatar = ({ bg, children, className = "" }: { bg: string; children?: React.ReactNode; className?: string }) => (
  <span className={`flex size-11 items-center justify-center rounded-pill border-[3px] border-panel text-xs font-extrabold ${className}`} style={{ background: bg }}>
    {children}
  </span>
);

export function FeatureTrio() {
  const card = "flex min-h-[420px] flex-col gap-4.5 overflow-hidden rounded-[28px] border border-line bg-panel p-6 md:h-[520px] md:p-7";
  const t = themeById("kor");
  return (
    <Section>
      <H2>Diğer davetiyelere benzemiyoruz</H2>
      <div className="grid gap-5 md:grid-cols-3">
        <div className={card}>
          <div className="flex flex-col gap-1.5">
            <span className="display text-[28px] tracking-tight">WhatsApp’ta paylaş</span>
            <span className="text-base leading-snug text-muted">Link atınca afiş, tarih ve “Geliyor musun?” kartı görünür. Misafir uygulama indirmez.</span>
          </div>
          <div className="mt-auto flex flex-col rounded-[18px] bg-[#0B141A] p-3">
            <div className="flex flex-col gap-1.5 rounded-[14px_4px_14px_14px] bg-[#005C4B] p-1.5 text-[#E9EDEF]">
              <div className="overflow-hidden rounded-[10px] bg-[#0B141A]">
                <div className="flex h-[120px] items-center justify-between px-3.5" style={{ background: t.poster, color: t.fg }}>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-xl" style={titleFontStyle("eklektik")}>Ece 30 Oluyor</span>
                    <span className="text-xs font-bold">Cmt, 17 Ekim · 20:00</span>
                    <span className="text-[11px] opacity-85">Geliyor musun?</span>
                  </span>
                  <span className="font-poster text-[52px] font-extrabold tracking-[-0.06em]">30</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold">
                  <Mark size={16} solid /> partile · getpartile.com/e/ece30
                </div>
              </div>
              <span className="px-1 text-[13px]">Geliyor musun?</span>
            </div>
          </div>
        </div>

        <div className={card}>
          <div className="flex flex-col gap-1.5">
            <span className="display text-[28px] tracking-tight">Kim geliyor, gör</span>
            <span className="text-base leading-snug text-muted">Katılımcı listesi, yorumlar, yanıtlar, fotoğraf albümü. Parti sayfada başlar.</span>
          </div>
          <div className="mt-auto flex flex-col gap-2.5">
            <div className="flex">
              <Avatar bg="linear-gradient(135deg, #FFD166, #FF6A3D)" />
              <Avatar bg="linear-gradient(135deg, #1EC9B0, #0E7C86)" className="-ml-3" />
              <Avatar bg="linear-gradient(135deg, #F59E0B, #C2410C)" className="-ml-3" />
              <Avatar bg="linear-gradient(135deg, #38BDF8, #1D4ED8)" className="-ml-3" />
              <Avatar bg="rgba(255,255,255,0.14)" className="-ml-3">+10</Avatar>
            </div>
            <div className="text-sm text-muted">14 geliyor · 3 belki</div>
            {[
              { i: "MK", bg: "linear-gradient(135deg, #1EC9B0, #0E7C86)", who: "Mert", tag: "Geliyorum", msg: "Tatlıyı ben getiriyorum." },
              { i: "BY", bg: "linear-gradient(135deg, #F59E0B, #C2410C)", who: "Buse", tag: "yanıtladı", msg: "Gluten yok ama pasta serbest." },
            ].map((c) => (
              <div key={c.who} className="flex gap-2.5">
                <span className="size-[34px] shrink-0 rounded-pill" style={{ background: c.bg }} />
                <div className="flex flex-col gap-1">
                  <span className="text-sm">
                    <strong>{c.who}</strong> · <span className={c.tag === "Geliyorum" ? "font-bold text-amber-soft" : ""}>{c.tag}</span>
                  </span>
                  <span className="rounded-[4px_12px_12px_12px] bg-white/8 px-3 py-2 text-sm">{c.msg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <div className="flex flex-col gap-1.5">
            <span className="display text-[28px] tracking-tight">Herkese tek seferde duyur</span>
            <span className="text-base leading-snug text-muted">Geç mi kaldın, adres mi değişti? Bir mesaj yaz, sadece gelenlere gitsin.</span>
          </div>
          <div className="mt-auto flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-1.5 text-[13px] font-bold">
              <span className="flex h-8 items-center rounded-pill border border-white/40 bg-white/14 px-3 text-teal">Geliyor 14</span>
              <span className="flex h-8 items-center rounded-pill border border-white/40 bg-white/14 px-3">Belki 3</span>
              <span className="flex h-8 items-center rounded-pill border border-line px-3 text-subtle">Yanıtsız 9</span>
            </div>
            <div className="rounded-lg border border-white/12 bg-white/6 p-3.5 text-[15px] leading-snug">Terası 20:00’de açıyorlar, erken gelenler 19:30’da sahilde buluşalım.</div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-subtle">Bildirim + e-posta</span>
              <span className="flex h-10 items-center rounded-pill bg-white px-4 text-[13px] font-extrabold text-bg">17 kişiye gönder</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Nasıl çalışır ---------- */
const steps = [
  { n: "1", bg: "bg-coral", title: "Oluştur", text: "Başlık, tarih, yer; tema ve afiş seç. Giriş yapmadan başla, yayınlarken e-postanı doğrula." },
  { n: "2", bg: "bg-amber", title: "Paylaş", text: "Linki WhatsApp grubuna at ya da hikâye afişini indir. Misafirlerin uygulama indirmesine gerek yok." },
  { n: "3", bg: "bg-teal", title: "Takip et", text: "Kim geliyor, kim belki; sorulara cevaplar, masraf beyanları. Hatırlatmalar kendiliğinden gider." },
];
const small = [
  ["Hangi gün?", "Tarihi seçmeden önce misafirlere sor."],
  ["Misafirlere sor", "Diyet, +1, ne getiriyorsun — baştan öğren."],
  ["Masrafı böl", "IBAN ya da Papara; kim gönderdi görün."],
  ["Fotoğraf albümü", "Herkes ekler, herkes indirir."],
  ["Hikâye afişi", "Instagram ve WhatsApp durumuna hazır."],
  ["Hatırlatmalar", "1 hafta ve 2 saat önce, otomatik."],
];

export function HowItWorks() {
  return (
    <Section id="nasil">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <H2>Nasıl çalışır?</H2>
          <div className="flex flex-col gap-3.5">
            {steps.map((s) => (
              <div key={s.n} className="flex items-start gap-4">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-pill text-lg font-extrabold text-bg ${s.bg}`}>{s.n}</span>
                <div className="flex flex-col gap-1">
                  <span className="display text-[22px] tracking-tight">{s.title}</span>
                  <span className="text-base leading-snug text-muted">{s.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          {small.map(([t, d]) => (
            <div key={t} className="flex flex-col gap-1.5 rounded-[18px] border border-line bg-white/5 p-4.5">
              <span className="display text-lg tracking-tight">{t}</span>
              <span className="text-sm leading-snug text-muted">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------- Kapanış ---------- */
export function ClosingCta() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 md:px-12">
      <section
        className="flex flex-col gap-5 overflow-hidden rounded-[32px] bg-panel-raised p-7 md:flex-row md:items-center md:justify-between md:px-12 md:py-14"
        style={{
          backgroundImage:
            "radial-gradient(50% 100% at 10% 50%, rgba(255,106,61,0.7) 0%, rgba(255,106,61,0) 70%), radial-gradient(40% 100% at 55% 0%, rgba(255,176,32,0.6) 0%, rgba(255,176,32,0) 70%), radial-gradient(45% 100% at 95% 50%, rgba(30,201,176,0.6) 0%, rgba(30,201,176,0) 70%)",
        }}
      >
        <div className="flex flex-col gap-1.5">
          <span className="display text-[28px] md:text-[44px]">Sıradaki planın hazır olsun.</span>
          <span className="text-lg text-muted">Ücretsiz. Uygulama gerekmez. Bir dakika sürer.</span>
        </div>
        <Link href={routes.create} className="flex h-[60px] shrink-0 items-center justify-center rounded-pill bg-white px-7 text-lg font-extrabold text-bg">
          Davetiye oluştur
        </Link>
      </section>
    </div>
  );
}
