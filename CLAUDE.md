# partile

Türkiye için davetiye + katılım (RSVP) ürünü. Referans: Partiful. Tek cümle: **"Plan yap, linki WhatsApp'ta at, kim geliyor gör."**

Bu dosya projenin ana iskeletidir. Yeni bir oturumda önce burayı, sonra `research/MVP_EKRAN_ENVANTERI.md`'yi oku.

## Durum (27 Eylül 2026)

- **Canlıda (27 Eyl 2026):** https://getpartile.com — Railway (Docker, Amsterdam edge) + Neon Postgres + Resend + Cloudflare DNS/proxy (kök ve www). Test aşaması: örnek içerik yüklü, `DEMO_LOGIN_CODE` açık; halka açmadan önce ikisi de temizlenecek.

- Araştırma bitti, tasarım v1 bitti (35 artboard), MVP ekran envanteri yazıldı.
- **Faz 1 uçtan uca çalışıyor (27 Eyl 2026):** tüm ekranlar koda döküldü, **veri katmanı** (`packages/db`: Drizzle + Postgres — dev'de PGlite, prod'da Neon) ve **Resend** (giriş/katılım kodu + sihirli link, duyuru e-postası) bağlandı. Build, typecheck, core testleri ve db smoke testi temiz. Kullanıcı en son toplu test edecek.
- Yerel geliştirme: `DATABASE_URL` boşken `./.data/partile` altında dosya tabanlı Postgres açılır, migrasyonlar koşar ve örnek planlar (`ece30`, `sahil`, `mangal`) seed edilir. **Demo düzenleyen:** `demo@getpartile.com` ile giriş. `RESEND_API_KEY` yokken doğrulama kodu ekranda gösterilir. Sıfırlamak için dev sunucuyu durdurup `rm -rf .data`.
- Kalan yer tutucular: GIF arama, “Galerim”, görüntü boyutlandırma (sharp), hukuk metinlerinin son hâli. Prod: **Railway** (Vercel değil) — adımlar `DEPLOY.md`’de: kökteki `Dockerfile` (Next standalone) + `railway.toml`, Neon Postgres (`DATABASE_URL`, sürücü `pg`, TLS; migrasyonlar açılışta) — yerel `.env` de Neon’a bağlı (27 Eyl 2026), PGlite yalnız `DATABASE_URL` boşken, `/data` volume (`UPLOAD_DIR`), `AUTH_SECRET`, `CRON_SECRET`, saatlik cron servisi → `/api/cron/hatirlatma`, sağlık `/api/saglik`, OG kartı `/e/{kod}/opengraph-image`. Resend domain’i doğrulandı (27 Eyl 2026), anahtar yalnız `apps/web/.env`’de (git dışı).

## Kod

```
apps/web
  app/                page.tsx (landing) · giris · ilk-giris · [occasion] (5 SEO sayfası, SSG) · e/[kod] (misafir/düzenleyen; ?goruntule=misafir, ?paylas=1)
                      (app)/ planlar · kesfet · olustur · profil · bildirimler · mesajlar   (rail + mobil alt menü)
  components/         brand · shell (Rail, TabBar, PublicNav/Footer, icons) · landing · create (editör + pickers, Settings, Poll)
                      plan (PlanView, RsvpFlow, PollCard, Poster, ThemeSurface, Avatar) · host (HostView, GuestList, Blast, PollResults)
                      share (ShareModal, StoryPoster) · home · notifications · profile · auth (LoginForm, Onboarding) · ui (Modal, Toggle)
  lib/                routes · fixtures (Plan, me, roleFor, myPlans, notifications) · draft · guest (RSVP + anket oyu) · session · geocode (Photon) · occasions · fonts
  lib/storage.ts       yükleme deposu (dev: ./.data/uploads → /api/dosya/…; prod: blob servisi bağlanacak) · app/api/yukle (afiş/fotoğraf yükleme)
  lib/auth.ts          imzalı çerez oturumu (getViewer/requireViewer) · lib/mail.ts Resend şablonları · app/actions.ts tüm server action'lar
  app/giris/dogrula    sihirli link (e-postadaki kod + link aynı kaydı tüketir)
packages/db           Drizzle şeması (users, verification_codes, plans, plan_hosts, guests, poll_options, poll_votes, feed_items, blasts, notifications),
                      client (PGlite ↔ Neon), queries (okuma modelleri; misafir e-postası düzenleyene asla dönmez), mutations, seed, drizzle/ migrasyonlar
packages/ui-tokens    src/index.ts (renkler, 8 davetiye teması, başlık fontları) + src/tokens.css
packages/core         src/domain.ts (zod: PlanDraft, PollOption, Rsvp, Question, CostSettings, RsvpStatus, VerificationCode) · src/format.ts (TR tarih/saat/₺, formatPill, planUrl, initials) + testler
```

- Komutlar: `corepack pnpm install` · `pnpm dev` (web :3000) · `pnpm build` (standalone çıktı) · `pnpm typecheck` · `pnpm --filter @partile/core test` · `pnpm --filter @partile/db smoke`. pnpm global kurulu değil; `corepack pnpm …` ya da `corepack enable`. `next build` çalışan dev sunucusuyla `.next`'i paylaşır: build'den önce dev'i durdur, sonra `rm -rf apps/web/.next`.
- Stil: Tailwind v4, token'lar `globals.css`'te `@theme inline` ile utility oluyor (`bg-panel`, `text-subtle`, `rounded-pill`, `glass`, `glass-menu`, `aura-top`, `display`). Renk/font değeri koda gömülmez, token'dan gelir.
- Fontlar **self-hosted** (`apps/web/app/fonts/*.woff`, `next/font/local`); `node apps/web/scripts/fetch-fonts.mjs` Google Fonts’tan indirir (latin + latin-ext). Karar (27 Eyl 2026): Railway builder Google Fonts’a erişemediği için build ağa bağımlı değil. Davetiye başlık fontları `preload: false`.
- Rotalar Türkçe: `/`, `/giris`, `/ilk-giris`, `/planlar`, `/kesfet`, `/olustur`, `/profil`, `/bildirimler`, `/mesajlar`, `/e/{kod}`, `/{occasion}-davetiyesi`. Rail'de Ayarlar yok; avatar → profil → Hesap ayarları.
- Doğrulama: 6 haneli kod 10 dk geçerli, tek kullanımlık; e-postada kod + link. Oturum `partile_session` httpOnly çerezi (`AUTH_SECRET` ile HMAC). Misafir katılımı = aynı doğrulama; sonra hesap oluşur.
- PGlite Next içinde `serverExternalPackages` ile bile bozuluyor (wasm yükleme URL hatası); `packages/db/src/client.ts` paketi Node'un kendi ESM yükleyicisiyle (`new Function("p","return import(p)")`) açar. Şema değişince `pnpm --filter @partile/db generate`; `pnpm --filter @partile/db smoke` uçtan uca test.
- Bağımlılıklar: `qrcode` (QR), `html-to-image` (hikâye afişi PNG), `resend`, `drizzle-orm` + `@electric-sql/pglite` + `@neondatabase/serverless`. Harita/adres: Photon.
- Env: `apps/web/.env.example` (NEXT_PUBLIC_SITE_URL, RESEND_API_KEY, RESEND_FROM, DATABASE_URL, AUTH_SECRET).
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
| Mesajlar | Karar (27 Eyl 2026): plan bazlı düzenleyen ↔ misafir yazışması (`conversations` + `messages`), grup sohbeti yok. Giriş noktaları: plan sayfası “Düzenleyene yaz”, katılımcı listesi “Mesaj” (hesabı olan misafir). Yeni mesaj bildirim üretir. |
| Fotoğraf & afiş | Karar (27 Eyl 2026): JPG/PNG/GIF/WebP, en fazla 8 MB, boyutlandırma yok (prod’da blob + görüntü işleme eklenecek). Giriş yapmadan seçilen afiş taslakta `data:` URL olarak durur (≤1,5 MB), yayınlanırken dosyaya dönüşür. Albüm: düzenleyen her zaman, misafir “albüme yükleyebilir” açıksa ve Geliyorum/Belki ise yükler; kendi fotoğrafını ve düzenleyen hepsini silebilir. |
| Davetli ekleme | Karar (27 Eyl 2026): düzenleyen “Misafir ekle” ile ad (+ isteğe bağlı e-posta) girer, satır başına bir kişi. E-postası olana davetiye e-postası (sihirli link) gider; hesap açınca davetli satırı kendisine bağlanır (`ensureUser`). E-posta yine düzenleyene görünmez. |
| Sessize al / Takip / Sonra hatırlat | Karar (27 Eyl 2026): **Sessize al** plan bazlı (`plan_mutes`): duyuru ve hatırlatma bildirimi/e-postası gitmez, düzenleyene katılım bildirimi gelmez; iptal bildirimi her zaman gider. **Takip et** kabul edilmiş düzenleyenleri takip eder (`follows`); takip edilen biri **herkese açık** plan yayınlayınca bildirim gelir, gizli planlar duyurulmaz. **Sonra hatırlat** giriş ister, seçenekler Yarın / 3 gün sonra / Plandan 1 gün önce (`later_reminders`); saatlik cron tek e-posta + bildirim gönderir, kişi önce katılım bildirirse iptal olur. |
| Paylaşım linki | Karar (27 Eyl 2026): kod başlıktan üretilir (`slugify`, en çok 20 karakter; doluysa `-xxxx` eki). Başlık değişince kod da değişir, eski kod `plan_code_aliases`’ta kalır ve `/e/{eski}` 308 ile yeni adrese gider; tüm paylaşım yolları (WhatsApp, kopyala, QR, e-posta, takvim) `plan.code` kullanır. “Planın adı” yer tutucusuyla yayın/kayıt yapılamaz. |
| Ortak arkadaşlar | Karar (27 Eyl 2026): hesabı olan ve seninle aynı planda Geliyorum/Belki diyen ya da o planı düzenleyen kişiler (`listCoAttendees`); ana sayfa kartı ve profil aynı veriyi kullanır. Profilde “Takip ettiklerin” listesi ve takibi bırakma var. |
| Açık temalar | Karar (27 Eyl 2026): `ThemeSurface` açık temada `--ink`/`--surface`/`--contrast` değişkenlerini çevirir; tema sayfalarında `border-ink/…`, `bg-ink/…`, `bg-surface/…`, `bg-contrast text-on-contrast` kullanılır (`white/…` değil). Modal paneli `shell-scope` ile koyu kabuğa döner. |
| Dağıtım | **WhatsApp birincil** (OG kartı: afiş + tarih + "Geliyor musun?"), sonra link/QR/hikâye afişi. Duyuru ve hatırlatma kanalı (MVP): **uygulama içi bildirim + e-posta (Resend)**. WhatsApp Business API ve SMS ileride. |
| Görünürlük | Varsayılan **Gizli** (linke sahip olanlar). Karar (27 Eyl 2026): **Herkese açık + Keşfet MVP'ye alındı** — `/kesfet` herkese açık planları semte göre listeler. Katılımcı listesi, akış, albüm ve tam adres her durumda yalnız katılım bildirenlere. |
| Gizlilik / mevzuat | Düzenleyen misafirin e-postasını **göremez**. KVKK aydınlatma + açık rıza (e-posta), İYS/ETK (hatırlatma e-postası işlem mesajıdır; pazarlama e-postası ayrı izin). |
| Ödeme | **Masrafı böl** = IBAN / Papara gösterimi + misafir "gönderdim" beyanı; doğrulama yok. Gerçek tahsilat (iyzico/PayTR) ve bilet Faz 3. |
| Tarih anketi | MVP'de var; masrafı böl ve katılım onayıyla aynı anda kapalı. Gün seçilince oylar katılıma dönüşür. |
| Hatırlatmalar | Sabit program: katılım hatırlatması 1 hafta önce (davetli + belki; plan en az 1 hafta önce yayınlandıysa), etkinlik hatırlatması 2 saat önce (geliyor). `reminder_log` plan+tür başına bir kez; e-posta (Resend) + uygulama içi bildirim; plan “hatırlatmalar kapalı” ise atlanır. Cron `/api/cron/hatirlatma`. |
| AI | Oluştur ekranında serbest metin → başlık/tarih/tema önerisi (Claude API). Sonuç her zaman düzenlenebilir form alanına dolar. Faz 1 sonu. |
| Premium | Karar (27 Eyl 2026): **şablon ve temalar Premium değil**, taç rozeti yok. Premium ileride başka özelliklere (ör. gelişmiş araçlar) ayrılacak; MVP'de ödeme yok. |
| Domain | **getpartile.com**. Paylaşım linki `getpartile.com/e/{kod}`. Gönderici e-postası `merhaba@getpartile.com` (Resend domain doğrulaması bekliyor). |

## Tasarım dili (kısa)

- **Kabuk "Gece":** `#0C0C0D` zemin, `#121213` panel, `#F5F2EC` metin, `#A8A39B` ikincil, `#1EC9B0` onay. Beyaz pill birincil buton. Cam paneller: beyaz %6–10, çizgi %8–16.
- **Aura:** Mercan `#FF6A3D` → Kehribar `#FFB020` → Deniz `#1EC9B0`. **Mor yasak.** **Emoji yasak**, ikonlar 24 px stroke SVG.
- **Yalnız koyu tema.** Uygulama kabuğunda light mode yok (karar 27 Eyl 2026); açık zeminli olanlar yalnızca davetiye temalarıdır (Limonata, Pudra).
- **Durum noktası (dot indicator) yok.** Durum, metnin rengiyle ya da rozetle anlatılır; okunmamış bildirim rozeti (zil üstü) istisna.
- **Açılır menüler cam:** `rgba(28,28,31,0.72)` + `backdrop-filter: blur(24px)` + `1px rgba(255,255,255,0.16)` çizgi; ör. Ana sayfa kart menüsü.
- **Afiş üzerinde süs halka yok**; afiş yalnız görsel + köşe etiketleri.
- **Efekt:** davetiyenin üstünde parçacık katmanı (`EffectLayer`), en çok 60 parçacık, “açılışta bir kez” 4 sn ya da sürekli; `prefers-reduced-motion` açıkken oynamaz; misafir kapatabilir. Plan alanı `effect {id, level, mode}`.
- **Katılım butonu stili** (`rsvpStyle`): Simgeler (varsayılan) · Emoji (🎉 🤔 😢 — düzenleyen seçer, kabuk emoji kullanmaz) · Metin · Tek düğme. Etiketler hep Geliyorum / Belki / Gelemiyorum.
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
- Commit'ler `origin` (SSH) üzerinden. Geliştirme dalı `claude/compassionate-fermi-3a9llp`; **`main` = Railway'in deploy ettiği dal** (28 Eyl 2026'dan itibaren). Bir iş bitince fast-forward ile `main`'e alınır (`git push origin HEAD:main`); doğrudan `main`'e commit yok. `PLAN_*.docx` ve `.DS_Store` commit'lenmez.
- Partiful hesabıyla yapılan incelemede: gerçek etkinlik oluşturulmaz, kimseye mesaj/duyuru gönderilmez, ayar kaydedilmez.
- Tasarımda büyük değişiklik = önce tuval, sonra envanter güncellenir; ikisi birbirini tutmalı.
