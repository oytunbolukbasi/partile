# partile

Türkiye için davetiye + katılım (RSVP) ürünü. Referans: Partiful. Tek cümle: **"Plan yap, linki WhatsApp'ta at, kim geliyor gör."**

Bu dosya projenin ana iskeletidir. Yeni bir oturumda önce burayı, sonra `research/MVP_EKRAN_ENVANTERI.md`'yi oku.

## Durum (26 Eylül 2026)

- Araştırma bitti, tasarım v1 bitti (35 artboard; giriş yapmamış yüzeyler dahil), MVP ekran envanteri yazıldı.
- Sıradaki iş: **kod iskeleti** (Turborepo + Next.js + tasarım token'ları). Kullanıcı tasarımı inceliyor; düzeltmeler toplu gelecek.
- Kod henüz yok. `apps/`, `packages/` klasörleri açılmadı.

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
| Auth | **Telefon + SMS OTP**, şifre yok. Misafir katılım bildirirken ad + telefon verir, kodla doğrular; giriş duvarı yok. Sağlayıcı: Netgsm / İleti Merkezi, alternatif Twilio Verify (karar bekliyor). |
| Dağıtım | **WhatsApp birincil** (OG kartı: afiş + tarih + "Geliyor musun?"), sonra link/QR/hikâye afişi. Duyuru kanalı sırası: push → WhatsApp Business API → SMS. |
| Görünürlük | MVP'de yalnız **Gizli** (linke sahip olanlar). Herkese açık + Keşfet Faz 2. Katılımcı listesi, akış, albüm ve tam adres yalnız katılım bildirenlere. |
| Gizlilik / mevzuat | Düzenleyen misafirin telefonunu **göremez**. KVKK aydınlatma + açık rıza (telefon), İYS/ETK (hatırlatma SMS'i işlem mesajıdır). |
| Ödeme | **Masrafı böl** = IBAN / Papara gösterimi + misafir "gönderdim" beyanı; doğrulama yok. Gerçek tahsilat (iyzico/PayTR) ve bilet Faz 3. |
| Tarih anketi | MVP'de var; masrafı böl ve katılım onayıyla aynı anda kapalı. Gün seçilince oylar katılıma dönüşür. |
| Hatırlatmalar | Sabit program: katılım hatırlatması 1 hafta önce (davetli + belki), etkinlik hatırlatması 2 saat önce (geliyor). |
| AI | Oluştur ekranında serbest metin → başlık/tarih/tema önerisi (Claude API). Sonuç her zaman düzenlenebilir form alanına dolar. Faz 1 sonu. |
| Premium | Bazı tema/efekt/afiş şablonları taçlı = Premium. MVP'de rozet var, ödeme yok. |
| Domain | Belirsiz. Her yerde `[alan-adı]/e/{kod}` yer tutucu. |

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
- Telefon varsayılan +90, maske `5XX XXX XX XX`. Para `₺450`.
- Konum: semt gösterimi ("Moda, Kadıköy") varsayılan; tam adres + harita linki katılımdan sonra. Google Places + Yandex/Apple Maps linkleri (sağlayıcı kararı bekliyor).

## Fazlar

- **Faz 1 (MVP):** giriş/OTP, ilk giriş, ana sayfa, oluştur (tema, afiş, tarih, konum, anket, sorular, masraf), yayınla + WhatsApp paylaşımı, davetiye, katılım, plan sayfası (akış, albüm), düzenleyen paneli (liste, onay, duyuru, giriş kontrolü), bildirimler, profil, hatırlatmalar.
- **Faz 2:** herkese açık planlar + Keşfet, organizasyon profili, kartlar, mesajlar, plan şifresi, premium ödeme, AI öneri.
- **Faz 3:** iyzico/PayTR tahsilat, bilet satışı, bekleme listesi otomasyonu, Expo mobil uygulama.

## Çalışma kuralları

- Dil: dokümanlar ve UI Türkçe; kod, commit mesajları ve tanımlayıcılar İngilizce.
- Commit'ler `origin` (SSH) üzerinden, dal: `claude/compassionate-fermi-3a9llp` → `main`'e PR ile. `PLAN_*.docx` ve `.DS_Store` commit'lenmez.
- Partiful hesabıyla yapılan incelemede: gerçek etkinlik oluşturulmaz, kimseye mesaj/duyuru gönderilmez, ayar kaydedilmez.
- Tasarımda büyük değişiklik = önce tuval, sonra envanter güncellenir; ikisi birbirini tutmalı.
