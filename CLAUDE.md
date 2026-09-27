# partile

Türkiye için davetiye + katılım (RSVP) ürünü. Referans: Partiful. Tek cümle: **"Plan yap, linki WhatsApp'ta at, kim geliyor gör."**

Bu dosya projenin ana iskeletidir. Yeni bir oturumda önce burayı, sonra `research/MVP_EKRAN_ENVANTERI.md`'yi oku. Deploy ve altyapı: `DEPLOY.md`.

## Durum (27 Eylül 2026)

- **Canlıda:** https://getpartile.com — Railway (Docker) + Neon Postgres + Resend + Cloudflare (DNS, proxy, SSL Full strict, www → kök 301). Saatlik cron servisi hatırlatmaları gönderir.
- **Test aşaması:** örnek içerik yüklü, `DEMO_LOGIN_CODE` açık. Halka açmadan önce yapılacaklar aşağıda “Açık işler”de.
- **Faz 1 uçtan uca çalışıyor:** giriş, oluştur, yayınla/paylaş, davetiye, katılım, plan sayfası (akış, albüm), düzenleyen paneli, bildirimler, mesajlar, Keşfet, profil, hatırlatmalar, iptal, sessize al, takip, sonra hatırlat.
- Tasarım tuvali v1 (35 artboard) ve envanter duruyor; son turdaki özellikler (bkz. envanter “Tasarımda olmayanlar”) henüz tuvale işlenmedi.

## Açık işler

- **Kullanıcıdan:** Railway cron’unun ilk çalışma kaydı; KVKK veri sorumlusu adı + adresi (`apps/web/lib/legal.ts`), hukuk metinlerinin incelenmesi; toplu test.
- **Halka açmadan önce:** `DEMO_LOGIN_CODE` ve `SEED_SAMPLE`’ı Railway’den kaldır; Neon’daki örnek plan/kullanıcıları temizle; sohbette paylaşılmış Neon şifresi, Resend anahtarı ve `CRON_SECRET`’ı yenile; Railway’deki fazla www özel alan adını sil (yönlendirme Cloudflare’de).
- **Ürün:** GIF arama (sağlayıcı + anahtar kararı bekliyor; şimdilik GIF “Yükle”den), tuval + envanterin son özelliklerle güncellenmesi.
- **Altyapı (acil değil):** Neon bölgesi us-east-2 → Frankfurt, Resend bölgesi Tokyo → İrlanda.
- **Faz 2+:** AI öneri, Premium kapsamı, organizasyon profili, kartlar, plan şifresi; Faz 3 tahsilat/bilet/Expo.

## Kod

```
apps/web
  app/          page.tsx landing · giris (+ giris/dogrula sihirli link) · ilk-giris · [occasion] (5 SEO sayfası, SSG)
                e/[kod] (misafir ↔ düzenleyen; ?goruntule=misafir, ?paylas=1, ?iptal=1; eski kod → 308) + opengraph-image
                (app)/ planlar · kesfet · olustur · profil · bildirimler · mesajlar   (masaüstü rail + mobil alt menü)
                kvkk · gizlilik · kosullar · not-found · actions.ts (tüm server action'lar)
                api/ saglik · yukle · dosya/[name] · takvim/[kod] (.ics) · cron/hatirlatma · eposta-onizleme (yalnız dev)
  components/   auth · brand · create (editör, tema/efekt paneli, tarih/konum/afiş/anket/ayarlar modalları, önizleme)
                plan (PlanView, RsvpFlow, RsvpButtons, PollCard, AlbumSection, CommentBox, CalendarMenu, RemindLaterMenu,
                GuestListSheet, EffectLayer, ThemeSurface, Poster, Avatar) · host (HostView, GuestListModal, BlastModal,
                CancelModal, PollResults) · share (ShareModal, StoryPoster) · home · explore · messages · notifications
                profile · legal · landing · shell (Rail, TabBar, PublicNav/Footer, icons) · ui (Modal, Toggle, TimeField)
  lib/          auth (imzalı çerez oturumu) · mail (Resend şablonları) · storage (yüklemeler) · draft (localStorage taslak)
                calendar (Google/.ics) · geocode (Photon) · fonts · occasions · legal · routes
  app/fonts/    self-hosted woff (scripts/fetch-fonts.mjs indirir)
packages/db     schema.ts · client.ts (Neon ↔ PGlite) · queries.ts (okuma modelleri) · mutations.ts · seed.ts
                drizzle/ migrasyonlar (açılışta uygulanır) · scripts/smoke.ts (yalnız PGlite)
packages/core   domain.ts (zod: PlanDraft, Rsvp, PlanCode, …) · model.ts (Plan, Guest, Notification … okuma tipleri)
                format.ts (TR tarih/saat/₺, planUrl, slugify, initials) + format.test.ts
packages/ui-tokens  src/index.ts (renkler, 8 davetiye teması, başlık fontları) + src/tokens.css
```

**Tablolar:** users, verification_codes, plans, plan_hosts, guests, poll_options, poll_votes, feed_items, blasts, notifications, conversations, messages, photos, reminder_log, plan_mutes, follows, later_reminders, plan_code_aliases.

**Komutlar** (pnpm global değil, `corepack` ile):

```bash
corepack pnpm install
corepack pnpm --filter @partile/web dev       # web → http://localhost:3000
corepack pnpm --filter @partile/web build     # standalone çıktı
corepack pnpm -r typecheck                     # tüm paketler
corepack pnpm --filter @partile/core test
corepack pnpm --filter @partile/db generate    # şema değişince migrasyon üret, commit'le
corepack pnpm --filter @partile/db smoke       # yalnız DATABASE_URL boşken
```

- Kökteki `pnpm dev/build/typecheck` turbo üzerinden çalışır ve turbo pnpm'i PATH'te bulamayınca düşer (`corepack enable` yapılmamışsa). Yukarıdaki komutlar turbo'suz.
- `next build` dev sunucusuyla `.next`'i paylaşır: build'den önce dev'i durdur, `rm -rf apps/web/.next`.
- **Veritabanı:** `DATABASE_URL` doluysa `pg` + TLS (libpq parametreleri ayıklanır); boşsa `./.data/partile` altında PGlite, migrasyon + örnek veri otomatik. PGlite Next içinde paketlenince bozulur; `client.ts` onu Node'un kendi yükleyicisiyle açar. **Yerel `apps/web/.env` şu an canlı Neon'a bağlı:** yerelde yapılan her yazma canlıya gider.
- **Oturum:** 6 haneli kod 10 dk, tek kullanımlık; e-postada kod + sihirli link. `partile_session` httpOnly çerezi, `AUTH_SECRET` ile HMAC. Canlı dışında kod ekranda da görünür; `DEMO_LOGIN_CODE` demo@getpartile.com'a sabit kod verir ve bu adrese e-posta göndermez.
- **Yüklemeler:** JPG/PNG/GIF/WebP, en çok 8 MB. Durağan görseller `sharp` ile EXIF’e göre döndürülür, en çok 2048 px, WebP (kalite 82), meta veri (konum dahil) silinir; hareketli GIF/WebP olduğu gibi kalır; sharp yoksa orijinal saklanır. Yerelde `./.data/uploads`, canlıda Railway volume `/data/uploads`; `/api/dosya/…` sunar. `pg` ve `sharp` çalışma imajına ayrıca kurulur (Dockerfile).
- **Stil:** Tailwind v4, token'lar `globals.css`'te `@theme inline` ile utility (`bg-panel`, `text-subtle`, `rounded-pill`, `glass`, `glass-menu`, `aura-top`, `display`). Renk/font değeri koda gömülmez. Tema sayfalarında (`ThemeSurface` altı) `white/…` yerine `ink/…`, `bg-surface/…`, `bg-contrast text-on-contrast`; açık temada bunlar kendiliğinden döner. Modal paneli `shell-scope` ile koyu kabuğa döner.
- **Fontlar:** self-hosted (`next/font/local`), Railway build'i Google Fonts'a erişemediği için. Davetiye başlık fontları `preload: false`.
- **Env** (`apps/web/.env.example`): NEXT_PUBLIC_SITE_URL, DATABASE_URL, AUTH_SECRET, RESEND_API_KEY, RESEND_FROM, UPLOAD_DIR, CRON_SECRET, DEMO_LOGIN_CODE; ayrıca PGSSL, DB_AUTO_MIGRATE, SEED_SAMPLE. Gizli değerler yalnız `apps/web/.env`'de (git dışı) ve Railway'de.

## Kaynaklar

| Ne | Nerede |
|---|---|
| Ekran envanteri, spesifikasyonlar | `research/MVP_EKRAN_ENVANTERI.md` |
| Deploy, DNS, cron, env | `DEPLOY.md` |
| Tasarım tuvali (Claude Design) | https://claude.ai/artifact/KLWKamPCYizEYELznkYSif — gizli; sahibi Oytun |
| Tuval kaynak dosyaları | `design/canvas/` — `tpl/*.tpl.html` şablonlar, `build.py` ortak parçaları (rail, logo, alt menü) üretir, `project/*.dc.html` yayınlanan artboard'lar, `project/canvas.json` yerleşim |
| Partiful ham referans | `research/screens/` (ekran görüntüleri), `research/text/` (sayfa metinleri) — yalnız iç referans, ürüne kopyalanmaz |
| Orijinal strateji dokümanı | `PLAN_Urun_Stratejisi_UX_UI_Moodboard_v2.docx` (repoda değil, yerel) |

Tuvali güncelleme: şablonu `design/canvas/tpl/` altında düzenle → `python3 design/canvas/build.py` → `project/` altındaki dosyayı Artifact aracıyla aynı URL'ye yayınla. `canvas.json` yalnızca artboard ekleme/silme/taşıma için gönderilir; göndermeden önce mutlaka tuvalden yeniden okunur (editör de yazıyor).

## Ürün kararları

| Konu | Karar |
|---|---|
| Platform | Önce **Next.js web (mobile-first)**, sonra Expo RN (Faz 3). Monorepo: `apps/web`, `packages/{db,core,ui-tokens}`. |
| Altyapı | Railway (Docker, `main` dalı) + Neon + Resend + Cloudflare. Vercel değil. |
| Auth | **E-posta + tek seferlik kod / sihirli link (Resend)**, şifre yok. Misafir katılım bildirirken ad + e-posta verir, kodu girer ya da linke tıklar; giriş duvarı yok. SMS/Twilio MVP'de yok; ürün tutarsa ikinci yöntem olarak eklenir. |
| Dağıtım | **WhatsApp birincil** (OG kartı: temanın zemini, planın başlık fontu, tarih, semt, afiş + "Geliyor musun?"), sonra link/QR/hikâye afişi. Duyuru + hatırlatma kanalı: uygulama içi bildirim + e-posta. WhatsApp Business API ve SMS ileride. |
| Paylaşım linki | `getpartile.com/e/{kod}`; kod başlıktan üretilir (`slugify`, en çok 20 karakter, doluysa `-xxxx`). Başlık değişince kod değişir, eski kod `plan_code_aliases`'ta kalır ve 308 ile yönlenir. Tüm paylaşım yolları `plan.code` kullanır. "Planın adı" yer tutucusuyla yayın/kayıt yapılamaz. |
| Görünürlük | Varsayılan **Gizli** (linke sahip olanlar). **Herkese açık + Keşfet MVP'de** (`/kesfet`, semte göre). Katılımcı listesi, akış, albüm ve tam adres her durumda yalnız katılım bildirenlere. |
| Gizlilik / mevzuat | Düzenleyen misafirin e-postasını **göremez** (CSV'de de yok). KVKK aydınlatma + gizlilik + koşullar sayfaları taslak (`/kvkk`, `/gizlilik`, `/kosullar`). Hatırlatma e-postası işlem mesajıdır; pazarlama e-postası ayrı izin (İYS/ETK). |
| Mesajlar | Plan bazlı düzenleyen ↔ misafir yazışması, grup sohbeti yok. Giriş: plan sayfası “Düzenleyene yaz”, katılımcı listesi “Mesaj”. Yeni mesaj bildirim üretir. |
| Ortak düzenleyen | Sahibi e-postayla davet eder; kabul edene dek yetkisi yok (`plan_hosts.accepted`). |
| Davetli ekleme | Düzenleyen “Misafir ekle” ile ad (+ isteğe bağlı e-posta) girer. E-postası olana davetiye e-postası gider; hesap açınca satır ona bağlanır. |
| Fotoğraf & afiş | Girişsiz seçilen afiş taslakta `data:` URL (≤1,5 MB), yayınlanınca dosyaya dönüşür. Afiş seçici: Şablonlar (kategori filtreli) · Yükle · Galerim (düzenlediğin planların afişleri + albüm fotoğrafların) · GIF (yakında). Albüm: düzenleyen her zaman; misafir “albüme yükleyebilir” açıksa ve Geliyorum/Belki ise. Kendi fotoğrafını, düzenleyen hepsini silebilir. |
| Ödeme | **Masrafı böl** = IBAN / Papara gösterimi + misafir “Gönderdim” beyanı; doğrulama yok. Gerçek tahsilat ve bilet Faz 3. |
| Tarih anketi | MVP'de var; masrafı böl ve katılım onayıyla aynı anda kapalı. Gün seçilince oylar katılıma dönüşür. |
| Hatırlatmalar | Katılım hatırlatması 1 hafta önce (davetli + belki; plan en az 1 hafta önce yayınlandıysa), etkinlik hatırlatması 2 saat önce (geliyor). `reminder_log` plan+tür başına bir kez. Plan “hatırlatmalar kapalı” ise atlanır. |
| Sessize al | Plan bazlı (`plan_mutes`): duyuru ve hatırlatma bildirimi/e-postası gitmez, düzenleyene katılım bildirimi gelmez. İptal bildirimi her zaman gider. Plan sayfasındaki zil ve ana sayfa kart menüsü. |
| Takip | Davetiyede “Takip et” ya da katılım formundaki kutu kabul edilmiş düzenleyenleri takip eder (`follows`). Takip edilen biri **herkese açık** plan yayınlayınca bildirim; gizli planlar duyurulmaz. Profilde “Takip ettiklerin” + takibi bırak. |
| Sonra hatırlat | Giriş ister; Yarın / 3 gün sonra / Plandan 1 gün önce (`later_reminders`). Cron tek e-posta + bildirim gönderir; kişi önce katılım bildirirse düşer. Düzenleyen kendi planına kuramaz. |
| Ortak arkadaşlar | Hesabı olan ve seninle aynı planda Geliyorum/Belki diyen ya da o planı düzenleyen kişiler (`listCoAttendees`). Ana sayfa kartı + profil. |
| İptal | Düzenleyen not ekleyerek iptal eder; misafirlere bildirim + e-posta, davetiye “Bu plan iptal edildi”, katılım ve hatırlatmalar durur. Geri alınabilir. |
| AI | Oluştur ekranında serbest metin → başlık/tarih/tema önerisi (Claude API), sonuç düzenlenebilir alana dolar. Faz 1 sonu, henüz yok. |
| Premium | Şablon ve temalar Premium değil, taç rozeti yok. Premium ileride başka özelliklere; MVP'de ödeme yok. |
| Domain / e-posta | **getpartile.com**; gönderen `partile <merhaba@getpartile.com>`, Resend domain'i doğrulandı. |

## Tasarım dili (kısa)

- **Kabuk "Gece":** `#0C0C0D` zemin, `#121213` panel, `#F5F2EC` metin, `#A8A39B` ikincil, `#1EC9B0` onay. Beyaz pill birincil buton. Cam paneller: beyaz %6–10, çizgi %8–16.
- **Aura:** Mercan `#FF6A3D` → Kehribar `#FFB020` → Deniz `#1EC9B0`. **Mor yasak.** **Emoji yasak** (tek istisna: düzenleyenin seçtiği Emoji katılım butonu stili), ikonlar 24 px stroke SVG.
- **Yalnız koyu tema.** Kabukta light mode yok; açık zeminli olanlar yalnız davetiye temaları (Limonata, Pudra) ve onlarda kontroller `ink/surface/contrast` token'larıyla döner.
- **Durum noktası (dot indicator) yok.** Durum metin rengiyle ya da rozetle anlatılır; zil üstü okunmamış rozeti istisna.
- **Açılır menüler cam:** `rgba(28,28,31,0.72)` + `backdrop-filter: blur(24px)` + `1px rgba(255,255,255,0.16)` çizgi (`glass-menu`).
- **Afiş üzerinde süs halka yok**; afiş yalnız görsel + köşe etiketleri.
- **Efekt:** davetiye üstünde parçacık katmanı (`EffectLayer`), en çok 60 parçacık, “açılışta bir kez” 4 sn ya da sürekli; `prefers-reduced-motion` açıkken oynamaz; misafir kapatabilir. Plan alanı `effect {id, level, mode}`.
- **Katılım butonu stili** (`rsvpStyle`): Simgeler (varsayılan) · Emoji (🎉 🤔 😢) · Metin · Tek düğme. Etiketler hep Geliyorum / Belki / Gelemiyorum.
- **Davetiye temaları** (8): Kor, Derin deniz, Limonata, Gece, Zeytinlik, Pudra, Kobalt, Kiraz. Her biri zemin/metin/vurgu taşır; kabuk temaya bürünür (Partiful modeli).
- **Fontlar:** Schibsted Grotesk (kabuk başlık), Hanken Grotesk (gövde), Unbounded (afiş rakam). Davetiye başlık fontları: Klasik/Schibsted · Eklektik/Fraunces · Şık/Pinyon Script · Edebi/Libre Baskerville · Dijital/Space Mono · Zarif/Cormorant italik. Hepsi TR glif destekli.
- **Logo:** "cam p + onay" — p harfi, bowl deliğinde tik. ≥60 px cam, ürün içinde düz, <32 px dolu bowl, 16 px yalnız tik. 3D render'ı kullanıcı üretecek (`#1EC9B0 → #FFB020 → #FF6A3D`, siyah zemin).
- **Ölçüler:** masaüstü 1440 (rail 72 px), mobil 390. Köşe 12/14/16/20/pill. Dokunma hedefi ≥44 px. Metin kontrastı ≥4.5:1.

Token detayı: envanterin “Tasarım dili” tablosu ve tuvaldeki `Main` artboard'u.

## Terminoloji (UI metinleri)

Plan (etkinlik değil) · Davetiye · Plan oluştur · **Geliyorum / Belki / Gelemiyorum** · Katılımını bildir · Katılımcılar · Düzenleyen / Ortak düzenleyen · Duyuru gönder · Misafirlere sor (soru formu) · Misafirlere sor: hangi gün? (tarih anketi) · Katılım onayı iste · Kontenjan yok · Kişi başı tutar · Masrafı böl · Bilet sat (Faz 3) · Taslağı kaydet · Yayınla ve paylaş · Tema · Efekt · Ayarlar · Önizle · Gizli / Herkese açık · Katılımcılara özel · Keşfet · Ortak arkadaşlar · Sessize al · Takip et · Giriş kontrolü · Bekleme listesi · +1 misafir · Afiş (poster) · Hikâye afişi (flyer) · Kartlar · Tarih netleşmedi · Sonra hatırlat · Takvime ekle · Planı iptal et · "Plan yapmak bu kadar kolay — Sen de oluştur".

Ton: samimi "sen" dili, kısa cümle. Emoji yok. UI metinleri Türkçe ve mümkünse `core`'daki sözlüklerden (`rsvpLabel` gibi) gelir.

## Format kuralları

- Tarih `Cumartesi, 17 Ekim` · saat 24 s `20:00` · hafta Pazartesi başlar · saat dilimi sabit TSİ (Europe/Istanbul), seçici yok.
- Telefon MVP'de toplanmaz (ileride: varsayılan +90, maske `5XX XXX XX XX`). Para `₺450`.
- Konum: semt gösterimi (“Moda, Kadıköy”) varsayılan; tam adres + harita linki katılımdan sonra. Adres autocomplete **Photon** (komoot, OSM, anahtarsız; `lib/geocode.ts`, İstanbul ağırlıklı, 300 ms debounce, semt etiketi `mahalle, ilçe`). Harita yok. Google Places kullanılmıyor (ücretli).

## Fazlar

- **Faz 1 (MVP, kodda):** giriş, ilk giriş, ana sayfa, oluştur (tema, efekt, afiş, tarih, konum, anket, sorular, masraf, buton stili), yayınla + paylaş, davetiye, katılım, plan sayfası (akış, albüm), düzenleyen paneli (liste, onay, duyuru, giriş kontrolü, misafir ekle, ortak düzenleyen, iptal), bildirimler, mesajlar, Keşfet, profil, hatırlatmalar, SEO davetiye sayfaları, hukuk sayfaları.
- **Faz 2:** organizasyon profili, kartlar, plan şifresi, gizli beğeni, Premium ödeme, AI öneri, GIF arama.
- **Faz 3:** iyzico/PayTR tahsilat, bilet satışı, bekleme listesi otomasyonu, Expo mobil uygulama, SMS/WhatsApp kanalları.

## Çalışma kuralları

- Dil: dokümanlar ve UI Türkçe; kod, commit mesajları ve tanımlayıcılar İngilizce.
- Git: geliştirme dalı `claude/compassionate-fermi-3a9llp`; **`main` = Railway'in deploy ettiği dal**. İş bitince fast-forward: `git push origin HEAD` ve `git push origin HEAD:main`; doğrudan `main`'e commit yok. `PLAN_*.docx`, `.DS_Store`, `.env` commit'lenmez.
- Canlı veriyle test: yerel `.env` Neon'a bağlı. Deneme için geçici/boş plan oluştur, bitince sil. demo@getpartile.com ve örnek adreslere (mert@example.com vb.) e-posta gönderme.
- Gizli değerleri (Neon, Resend, CRON_SECRET, AUTH_SECRET) commit'leme, çıktıda tekrarlama.
- Partiful hesabıyla inceleme: gerçek etkinlik oluşturulmaz, kimseye mesaj/duyuru gönderilmez, ayar kaydedilmez.
- Tasarımda büyük değişiklik = önce tuval, sonra envanter; ikisi birbirini tutmalı.
