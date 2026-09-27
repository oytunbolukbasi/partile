# partile — MVP Ekran Envanteri

> Tasarım tuvali: Claude Design "partile — Tasarım" (35 artboard). Bu doküman, kodlamaya başlamadan önce hangi ekranın çizili, hangisinin yalnızca spesifikasyonla geçileceğini ve hangi fazda olduğunu listeler.
> Tarih: 26 Eylül 2026 · Ürün kararları ve terminoloji: `CLAUDE.md` · Ham Partiful referansları: `research/screens/`, `research/text/`

## Tasarım dili (özet)

| Konu | Karar |
|---|---|
| Kabuk | "Gece": `#0C0C0D` zemin, `#121213` panel, `#F5F2EC` metin, `#A8A39B` ikincil. Beyaz pill birincil buton. Cam paneller beyaz %6–10, çizgi %8–16. |
| Aura | Mercan `#FF6A3D` → Kehribar `#FFB020` → Deniz `#1EC9B0`. **Mor kullanılmaz.** |
| Davetiye temaları | Kor, Derin deniz, Limonata, Gece, Zeytinlik★, Pudra, Kobalt★, Kiraz★ (★ Premium). Her tema: zemin gradyanı + metin + vurgu; açık temalarda cam koyu, koyu temalarda cam açık. |
| Fontlar | Schibsted Grotesk (kabuk başlıkları), Hanken Grotesk (gövde), Unbounded (afiş rakamları), Space Mono (kod). Davetiye başlık fontları: Klasik/Schibsted · Eklektik/Fraunces · Şık/Pinyon Script · Edebi/Libre Baskerville · Dijital/Space Mono · Zarif/Cormorant italik. Hepsi Google Fonts, TR glif destekli. |
| Logo | "Cam p + onay": p harfi, bowl deliğinde tik. Cam hâl ≥ 60 px (ikon, splash, landing); düz hâl ürün içi; 32 px altında dolu bowl; 16 px favicon = kehribar kare + tik. |
| Ölçüler | Masaüstü 1440 (rail 72 px, içerik x=128/216, afiş kolonu 346–358 px), mobil 390. Köşe 12/14/16/20/pill. Dokunma hedefi ≥ 44 px. |
| Ikonlar | Emoji yok; 24 px stroke SVG. Katılım butonları: tik / soru / çarpı. |

## Faz 1 — MVP ekranları (çizili)

| # | Ekran | Artboard | Cihaz | Etkileşim | Not |
|---|---|---|---|---|---|
| 1 | Giriş: telefon → SMS kodu | `Login` | 1440 | adım geçişi | +90 varsayılan; WhatsApp'tan kod alternatifi |
| 2 | İlk giriş: ad + fotoğraf + doğum günü | `Onboarding` | 390 | — | Yalnızca yeni kullanıcı; fotoğraf yoksa baş harfler |
| 3 | Ana sayfa | `Home`, `HomeMobile` | 1440 · 390 | — | Sekmeler: Yaklaşan · Düzenlediklerim · Katıldıklarım · **Taslaklar** (web'de de var) |
| 4 | Plan oluştur (editör) | `Create`, `CreateMobile` | 1440 · 390 | tema seçimi canlı | Tema paneli sağda (masaüstü) / alt bar (mobil) |
| 5 | Tarih & saat seç | `DatePicker` | modal | takvim canlı | Hafta Pazartesi; TSİ sabit; "tarih kesin değil" anahtarı |
| 6 | Konum seç | `LocationPicker` | modal | semt/tam adres canlı | Google Places; "Yalnız semt" varsayılan (gizli planlar) |
| 7 | Afiş seç | `PosterPicker` | modal | sekmeler canlı | Şablonlar · Yükle · Galerim · GIF; kare, ≥1080 px |
| 8 | Tarih anketi — düzenleyen | `Poll` | modal | seçenek ekle/sil | Masrafı böl ve katılım onayıyla birlikte kapalı |
| 9 | Tarih anketi — misafir oyu | `PollGuest` | 390 | oy canlı | Evet/Belki/Hayır; gün seçilince oy → katılım |
| 10 | Plan ayarları: Katılım | `Settings` | modal | — | +1, ad iste, katılım onayı, kontenjan, buton stili, "Belki" |
| 11 | Plan ayarları: Masrafı böl | `SettingsCost` | modal | mod canlı | Kapalı / Sabit / Gönlünden ne koparsa; IBAN, Papara; "ödeme doğrulanmaz" |
| 12 | Plan ayarları: Misafirlere sor | `Questionnaire` | modal | — | Kısa cevap / tek seçim; zorunlu; hazır sorular; misafir önizlemesi |
| 13 | Planın hazır → paylaş | `Share` | modal | — | WhatsApp birincil; link, QR, hikâye afişi, ortak arkadaş daveti |
| 14 | Hikâye afişi | `Story` | 540×960 | — | 1080×1920 çıktı; güvenli alan üst/alt 250 px; QR |
| 15 | Plan sayfası — düzenleyen | `EventHost` | 1440 | — | Üst araç çubuğu, sayaçlar, onay bekleyenler kartı, link kutusu, hatırlatma özeti, iptal |
| 16 | Plan sayfası — katılım sonrası | `Event`, `EventMobile` | 1440 · 390 | — | 150 px "Geliyorum" küresi (masaüstü) / yapışkan hap (mobil); albüm; akış |
| 17 | Davetiye — linkten gelen (katılım öncesi) | `InviteMobile` | 390 | — | Viral bant; adres kilitli; "Katılımcılara özel" kartı |
| 18 | Katılım bildirme (3 adım) | `RsvpFlow` | 390 ×3 | — | Durum + ad + telefon → SMS kodu → +1, sorular, not, takip |
| 19 | Katılımcılar — düzenleyen paneli | `GuestList` | modal | filtre + giriş kontrolü canlı | Onayla/reddet; CSV; telefon numarası gösterilmez |
| 20 | Duyuru gönder | `Blast` | modal | hedef seçimi canlı | 10 duyuru/plan; kanal: push → WhatsApp → SMS; düzenlenemez |
| 21 | Bildirim paneli | `Notifications` | 1440 | — | Bugün/Dün; olay rozetleri; okunmamış |
| 22 | Profil (kendi) | `Profile` | 1440 | — | Yalnızca herkese açık planlar profilde |
| 23 | Boş durumlar | `Empty` | 1440 | — | Ortak arkadaşlar / Mesajlar / Bildirimler → "ilk planını oluştur" |
| 24 | Tasarım dili · Logo | `Main`, `LogoFinal` | 1440 | — | Referans panoları |

## Faz 1 — giriş yapmamış (public) yüzeyler (çizili)

| # | Ekran | Artboard | Cihaz | Not |
|---|---|---|---|---|
| 25 | Landing | `Landing`, `LandingMobile` | 1440 · 390 | Hero "Plan yap. Linki at. Kim geliyor gör." + telefon mock + WhatsApp balonu; 4 özelleştirme kartı; şablon şeridi; 3 büyük özellik (WhatsApp, kim geliyor, duyuru); "Nasıl çalışır" 3 adım + 6 küçük özellik; kapanış CTA; footer. **Sahte yorum/istatistik yok** — kullanıcı gelince eklenir. |
| 26 | Occasion / SEO sayfası | `Occasion` | 1440 | Örnek: `/dogum-gunu-davetiyesi`. Hero, 12 şablonlu grid (kategori çipleri), 3 özellik, SEO metni + SSS, diğer davetiyeler bandı. Aynı kalıp: yemek & brunch, ev partisi, kına & nişan, mangal, yılbaşı (sezonluk). |
| 27 | Davetiye — giriş yapmamış misafir (masaüstü) | `InviteDesktop` | 1440 | Üstte viral bant + logo/Giriş; rail yok. Üç yuvarlak buton → `RsvpFlow`; "Katılımcılara özel" kartı; takvime ekleme katılım sonrası. Mobil karşılığı `InviteMobile`. |
| 28 | Public nav / footer | `build.py` → `__PUBNAV__`, `__PUBFOOTER__` | — | Nav: logo · Doğum günü · Yemek & brunch · Ev partisi · Yılbaşı · Kına & nişan · Giriş · Oluştur. Footer: CTA çifti + Türkçe/Yardım/Blog/Hakkında/Gizlilik/KVKK/Koşullar/Uygulama. Keşfet Faz 2'de eklenir. |

**Giriş yapmadan oluşturma (spec):** `/create` girişsiz açılır (`Create` ile aynı; "Düzenleyen" satırı "Giriş yapınca adın görünür"). "Yayınla ve paylaş" → `Login` (telefon + kod) → taslak hesaba bağlanır → `Share`. Taslak, doğrulanana kadar tarayıcıda (localStorage) tutulur.

## Faz 1 — spesifikasyonla geçilecekler (çizim yok, aynı kalıplar)

| Ekran | Kalıp | Spesifikasyon |
|---|---|---|
| Ayarlar: Düzenleyenler | `Settings` modalı | Liste (Oluşturan · Sen), "+ Ortak düzenleyen" (ortak arkadaşlardan seç → davet, kabul edene dek *Bekliyor*), "Linkle ortak düzenleyen ekle" anahtarı (uyarı: linki alan herkes düzenleyen olur). |
| Ayarlar: Görünürlük & gizlilik | `Settings` modalı | Anahtarlar: akış zaman damgaları, misafir adları, misafir sayısı, plan şifresi (Faz 2), "Gizli beğeni" (Faz 2). Not: liste ve akış katılım öncesi her zaman gizli. |
| Ayarlar: Kitle | `Settings` modalı | Gizli (linke sahip olanlar) / Herkese açık (Faz 2'de açılır; MVP'de yalnız "Gizli"). |
| Ayarlar: Fotoğraf albümü | `Settings` modalı | Filtre (Yok / Sıcak / Siyah-beyaz), "Misafirler yükleyebilsin", albüm linki. |
| Ayarlar: Hatırlatmalar | `Settings` modalı | Tek anahtar. Sabit program: katılım hatırlatması 1 hafta önce (Davetli + Belki), etkinlik hatırlatması 2 saat önce (Geliyor). Kanal: push → WhatsApp → SMS. |
| Efekt paneli | `Create` tema panelinin 2. sekmesi | Yok · Konfeti · Kalpler · Kar (sezonluk) · Balon. Ekran üstü CSS/Canvas animasyonu; "Hareketi azalt" tercihine uyar. |
| Masrafı böl — misafir tarafı | `EventMobile` kartı + sheet | "IBAN'ı kopyala" / "Papara'yı aç" → "Gönderdim" onayı → düzenleyen panelinde beyan olarak görünür. Doğrulama yok. |
| Yorum / fotoğraf yükleme | `Event` akışı | Metin + GIF (GIPHY) + görsel; yanıt tek seviye; düzenleyen sabitler/siler. |
| İptal / sil / tarih değişikliği | Onay diyaloğu | İptal: misafirlere bildirim, sayfa "Bu plan iptal edildi" durumuna geçer. Tarih değişikliği: "Yeni tarih uyuyor mu?" bildirimi. Silme: 30 gün geri alma. |
| Sistem sayfaları | Kabuk | 404, link geçersiz, plan iptal edildi, plan sona erdi (fotoğraf albümü açık kalır). |
| Profil ayarları | `Settings` benzeri modal; giriş yalnızca profil avatarı → menü (rail’de ayar ikonu yok) | Hesap (numara değiştir, çıkış, hesabı sil), Bildirimler (katılım/yorum/fotoğraf/hatırlatma: Tümü/Kapalı), Takvim senkronu (Google, .ics), Dil, Erişilebilirlik (hareketi azalt). |
| Takvime ekle | — | `.ics` indir + Google Calendar linki; ekran yok. |
| Kart gönder, Keşfet, Organizasyon profili, Mesajlar | çizili (`Card`, `Explore`, `OrgProfile`) | **Faz 2** — MVP'de menüde görünmez. |

## Fazlar

- **Faz 1 (MVP):** giriş, oluştur (tema/afiş/tarih/konum/anket/sorular/masraf), yayınla+WhatsApp paylaşımı, davetiye, katılım (OTP), plan sayfası (akış, albüm), düzenleyen paneli (liste, onay, duyuru, giriş kontrolü), bildirimler, profil. Gizli planlar yalnızca.
- **Faz 2:** herkese açık planlar + Keşfet, organizasyon profili, kartlar, mesajlar, plan şifresi, gizli beğeni, premium temalar/efektler.
- **Faz 3:** gerçek tahsilat (iyzico/PayTR), bilet satışı, bekleme listesi otomasyonu.

## Açık sorular

1. Domain ve kısa link formatı (`/e/{kod}`) — tüm ekranlarda `[alan-adı]` yer tutucu.
2. SMS/OTP sağlayıcısı (Netgsm / İleti Merkezi / Twilio Verify) ve WhatsApp Business API onay süresi — duyuru kanalı sırasını etkiler.
3. Google Places lisansı vs. Yandex/Apple Maps linkleri — konum seçicide sağlayıcı.
4. GIPHY anahtarı (afiş ve yorum GIF'leri) — MVP'de kapalı tutulabilir.
5. Logo 3D render'ı: kullanıcı kendi aracında `#1EC9B0 → #FFB020 → #FF6A3D` ile üretecek; app ikonu ve landing hero'ya girecek.
