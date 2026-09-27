# partile

Türkiye için davetiye + katılım (RSVP) ürünü. Referans: Partiful. Tek cümle: **"Plan yap, linki WhatsApp'ta at, kim geliyor gör."**

Bu dosya projenin ana iskeletidir. Yeni bir oturumda önce burayı, sonra `research/MVP_EKRAN_ENVANTERI.md`'yi oku.

## Durum (26 Eylül 2026)

- Araştırma bitti, tasarım v1 bitti (35 artboard), MVP ekran envanteri yazıldı; kullanıcı tuvalde yorumla inceliyor.
- **Kod iskeleti kuruldu (27 Eyl 2026):** Turborepo + pnpm, `apps/web` (Next.js 15, App Router, Tailwind v4), `packages/ui-tokens`, `packages/core`. Build ve typecheck temiz; landing hero ilk gerçek ekran.
- Sıradaki iş: ekranları envanter sırasıyla koda dökmek (landing'in kalanı → oluştur → davetiye → katılım). **Resend en son** bağlanacak (tüm sayfalar bitince). Veritabanı seçimi bekliyor (öneri: Postgres/Neon + Drizzle).

## Kod

```
apps/web            Next.js 15 · app/ (page.tsx landing, giris, (app)/planlar|olustur|profil, e/[kod]) · components/{brand,shell} · lib/routes.ts
packages/ui-tokens  src/index.ts (renkler, 8 davetiye teması, fontlar, köşe) + src/tokens.css (CSS değişkenleri)
packages/core       src/domain.ts (zod: PlanDraft, Rsvp, Question, CostSettings, RsvpStatus) · src/format.ts (TR tarih/saat/₺, planUrl, initials)
```

- Komutlar: `corepack pnpm install` · `pnpm dev` (web :3000) · `pnpm build` · `pnpm typecheck` · `pnpm --filter @partile/core test`. pnpm global kurulu değil; `corepack pnpm …` ya da `corepack enable`.
- Stil: Tailwind v4, token'lar `globals.css`'te `@theme inline` ile utility oluyor (`bg-panel`, `text-subtle`, `rounded-pill`, `glass`, `glass-menu`, `aura-top`, `display`). Renk/font değeri koda gömülmez, token'dan gelir.
- Fontlar `next/font/google` ile (Schibsted Grotesk, Hanken Grotesk, Unbounded); davetiye başlık fontları plan sayfasında ihtiyaç anında yüklenir.
- Rotalar Türkçe: `/`, `/giris`, `/planlar`, `/olustur`, `/profil`, `/e/{kod}`, `/{occasion}-davetiyesi`. Rail'de Ayarlar yok; avatar → profil.
- Env: `apps/web/.env.example` (NEXT_PUBLIC_SITE_URL, RESEND_API_KEY, RESEND_FROM, DATABASE_URL).
- Kod, commit mesajları, tanımlayıcılar İngilizce; UI metinleri Türkçe ve `core`'daki `rsvpLabel` gibi sözlüklerden gelir.

## Kaynaklar

| Ne | Nerede |
|---|---|
| Ekran envanteri, fazlar, spesifikasyonlar | `research/MVP_EKRAN_ENVANTERI.md` — kodlama için tek liste |
| Tasarım tuvali (Claude Design) | https://claude.ai/artifact/KLWKamPCYizEYELznkYSif — gizli; sahibi Oytun |
| Tuval kaynak dosyaları | `design/canvas/` — `tpl/*.tpl.html` şablonlar, `build.py` ortak parçaları (rail, logo, alt menü) üretir, `project/*.dc.html` yayınlanan artboard'lar, `project/canvas.json` yerleşim |
| Partiful ham referans | `research/screens/` (ekran görüntüleri), `research/text/` (sayfa metinleri) |
| Orijinal strateji dokümanı | `PLAN_Urun_Stratejisi_UX_UI_Moodboard_v2.docx` (repoda değil, yerel) |

Tuvali güncelleme: şablonu `design/canvas/tpl/` altında düzenle → `python3 design/canvas/build.py` → `project/` altındaki dosyayı Artifact aracıyla aynı URL'ye yayınla. `canvas.json` yalnızca artboard ekleme/silme/taşıma için gönderilir; göndermeden önce mutlaka tuvalden yeniden okunur (editör de yazıyor).

## Ürün kararları

| Konu | Karar |
|---|---|
| Platform | Önce **Next.js web (mobile-first)**, sonra Expo RN. Monorepo (Turborepo): `apps/web`, `apps/mobile`, `packages/ui-tokens`, `packages/core` (tipler, validasyon, API client). |
| Auth | **E-posta + tek seferlik kod / sihirli link (Resend)**, şifre yok. Misafir katılım bildirirken ad + e-posta verir, e-postadaki 6 haneli kodu girer ya da linke tıklar; giriş duvarı yok. Karar (27 Eyl 2026): SMS/Twilio maliyeti MVP'de üstlenilmiyor; ürün tutarsa telefon + SMS OTP ikinci doğrulama yöntemi olarak eklenir. Resend hesabı hazır. |
| Dağıtım | **WhatsApp birincil** (OG kartı: afiş + tarih + "Geliyor musun?"), sonra link/QR/hikâye afişi. Duyuru ve hatırlatma kanalı (MVP): **uygulama içi bildirim + e-posta (Resend)**. WhatsApp Business API ve SMS ileride. |
| Görünürlük | MVP'de yalnız **Gizli** (linke sahip olanlar). Herkese açık + Keşfet Faz 2. Katılımcı listesi, akış, albüm ve tam adres yalnız katılım bildirenlere. |
| Gizlilik / mevzuat | Düzenleyen misafirin e-postasını **göremez**. KVKK aydınlatma + açık rıza (e-posta), İYS/ETK (hatırlatma e-postası işlem mesajıdır; pazarlama e-postası ayrı izin). |
| Ödeme | **Masrafı böl** = IBAN / Papara gösterimi + misafir "gönderdim" beyanı; doğrulama yok. Gerçek tahsilat (iyzico/PayTR) ve bilet Faz 3. |
| Tarih anketi | MVP'de var; masrafı böl ve katılım onayıyla aynı anda kapalı. Gün seçilince oylar katılıma dönüşür. |
| Hatırlatmalar | Sabit program: katılım hatırlatması 1 hafta önce (davetli + belki), etkinlik hatırlatması 2 saat önce (geliyor). |
| AI | Oluştur ekranında serbest metin → başlık/tarih/tema önerisi (Claude API). Sonuç her zaman düzenlenebilir form alanına dolar. Faz 1 sonu. |
| Premium | Bazı tema/efekt/afiş şablonları taçlı = Premium. MVP'de rozet var, ödeme yok. |
| Domain | **getpartile.com**. Paylaşım linki `getpartile.com/e/{kod}`. Gönderici e-postası `merhaba@getpartile.com` (Resend domain doğrulaması bekliyor). |

## Tasarım dili (kısa)

- **Kabuk "Gece":** `#0C0C0D` zemin, `#121213` panel, `#F5F2EC` metin, `#A8A39B` ikincil, `#1EC9B0` onay. Beyaz pill birincil buton. Cam paneller: beyaz %6–10, çizgi %8–16.
- **Aura:** Mercan `#FF6A3D` → Kehribar `#FFB020` → Deniz `#1EC9B0`. **Mor yasak.** **Emoji yasak**, ikonlar 24 px stroke SVG.
- **Yalnız koyu tema.** Uygulama kabuğunda light mode yok (karar 27 Eyl 2026); açık zeminli olanlar yalnızca davetiye temalarıdır (Limonata, Pudra).
- **Durum noktası (dot indicator) yok.** Durum, metnin rengiyle ya da rozetle anlatılır; okunmamış bildirim rozeti (zil üstü) istisna.
- **Açılır menüler cam:** `rgba(28,28,31,0.72)` + `backdrop-filter: blur(24px)` + `1px rgba(255,255,255,0.16)` çizgi; ör. Ana sayfa kart menüsü.
- **Afiş üzerinde süs halka yok**; afiş yalnız görsel + köşe etiketleri.
- **Davetiye temaları** kendi zemin/metin/vurgu üçlüsünü taşır; kabuk temaya bürünür (Partiful modeli).
- **Fontlar:** Schibsted Grotesk (kabuk başlık), Hanken Grotesk (gövde), Unbounded (afiş rakam). Davetiye başlık fontları: Klasik/Schibsted · Eklektik/Fraunces · Şık/Pinyon Script · Edebi/Libre Baskerville · Dijital/Space Mono · Zarif/Cormorant italik. Hepsi Google Fonts, TR glif destekli.
- **Logo:** "cam p + onay" — p harfi, bowl deliğinde tik. ≥60 px cam, ürün içinde düz, <32 px dolu bowl, 16 px yalnız tik. Kullanıcı 3D render'ı kendi aracında üretecek (`#1EC9B0 → #FFB020 → #FF6A3D`, siyah zemin).
- **Ölçüler:** masaüstü 1440 (rail 72 px), mobil 390. Köşe 12/14/16/20/pill. Dokunma hedefi ≥44 px. Metin kontrastı ≥4.5:1.

Token detayı ve bileşen listesi: envanterin "Tasarım dili" tablosu ve tuvaldeki `Main` artboard'u.

## Terminoloji (UI metinleri — kodda bunlar kullanılır)

Plan (etkinlik değil) · Davetiye · Plan oluştur · **Geliyorum / Belki / Gelemiyorum** · Katılımını bildir · Katılımcılar · Düzenleyen / Ortak düzenleyen · Duyuru gönder · Misafirlere sor (soru formu) · Misafirlere sor: hangi gün? (tarih anketi) · Katılım onayı iste · Kontenjan yok · Kişi başı tutar · Masrafı böl · Bilet sat (Faz 3) · Taslağı kaydet · Yayınla ve paylaş · Tema · Efekt · Ayarlar · Önizle · Gizli / Herkese açık · Katılımcılara özel · Keşfet · Ortak arkadaşlar · Sessize al · Giriş kontrolü · Bekleme listesi · +1 misafir · Afiş (poster) · Hikâye afişi (flyer) · Kartlar · Tarih netleşmedi · Sonra hatırlat · Takvime ekle · "Plan yapmak bu kadar kolay — Sen de oluştur".

Ton: samimi "sen" dili, kısa cümle. Emoji yok.

## Format kuralları

- Tarih `Cumartesi, 17 Ekim` · saat 24 s `20:00` · hafta Pazartesi başlar · saat dilimi sabit TSİ (Europe/Istanbul), seçici yok.
- Telefon MVP'de toplanmaz. (İleride eklenirse: varsayılan +90, maske `5XX XXX XX XX`.) Para `₺450`.
- Konum: semt gösterimi ("Moda, Kadıköy") varsayılan; tam adres + harita linki katılımdan sonra. **Adres autocomplete ücretsiz bir API'den gelecek** (Google Places ücretli): ilk aday Photon (komoot, OSM, anahtarsız), alternatif Geoapify / LocationIQ. Karar (27 Eyl 2026): **Photon bağlandı** — `apps/web/lib/geocode.ts`, İstanbul’a ağırlıklı, 300 ms debounce, semt etiketi `mahalle, ilçe`.

## Fazlar

- **Faz 1 (MVP):** giriş (e-posta kodu/link), ilk giriş, ana sayfa, oluştur (tema, afiş, tarih, konum, anket, sorular, masraf), yayınla + WhatsApp paylaşımı, davetiye, katılım, plan sayfası (akış, albüm), düzenleyen paneli (liste, onay, duyuru, giriş kontrolü), bildirimler, profil, hatırlatmalar.
- **Faz 2:** herkese açık planlar + Keşfet, organizasyon profili, kartlar, mesajlar, plan şifresi, premium ödeme, AI öneri.
- **Faz 3:** iyzico/PayTR tahsilat, bilet satışı, bekleme listesi otomasyonu, Expo mobil uygulama.

## Çalışma kuralları

- Dil: dokümanlar ve UI Türkçe; kod, commit mesajları ve tanımlayıcılar İngilizce.
- Commit'ler `origin` (SSH) üzerinden, dal: `claude/compassionate-fermi-3a9llp` → `main`'e PR ile. `PLAN_*.docx` ve `.DS_Store` commit'lenmez.
- Partiful hesabıyla yapılan incelemede: gerçek etkinlik oluşturulmaz, kimseye mesaj/duyuru gönderilmez, ayar kaydedilmez.
- Tasarımda büyük değişiklik = önce tuval, sonra envanter güncellenir; ikisi birbirini tutmalı.
