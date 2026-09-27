# partile — MVP Ekran Envanteri

> Tasarım tuvali: Claude Design "partile — Tasarım" (35 artboard). Bu doküman hangi ekranın çizili, hangisinin yalnızca spesifikasyonla geçildiğini ve hangi fazda olduğunu listeler.
> İlk sürüm 26 Eylül 2026 · son güncelleme 27 Eylül 2026 · Ürün kararları ve terminoloji: `CLAUDE.md` · Ham Partiful referansları: `research/screens/`, `research/text/`

**Kod durumu (27 Eyl 2026):** Faz 1 ekranlarının tamamı `apps/web` altında ve canlıda (getpartile.com). Veri `packages/db` (Drizzle, Neon), e-postalar Resend. Ekran ↔ dosya eşlemesi: `CLAUDE.md` → “Kod”. Tasarımda karşılığı olmayan, doğrudan kodda eklenen özellikler en altta “Tasarımda olmayanlar” bölümünde; tuvale işlenmeleri bekliyor.

## Tasarım dili (özet)

| Konu | Karar |
|---|---|
| Kabuk | "Gece": `#0C0C0D` zemin, `#121213` panel, `#F5F2EC` metin, `#A8A39B` ikincil. Beyaz pill birincil buton. Cam paneller beyaz %6–10, çizgi %8–16. |
| Aura | Mercan `#FF6A3D` → Kehribar `#FFB020` → Deniz `#1EC9B0`. **Mor kullanılmaz.** |
| Davetiye temaları | Kor, Derin deniz, Limonata, Gece, Zeytinlik, Pudra, Kobalt, Kiraz (hepsi ücretsiz; şablon/tema Premium değil). Her tema: zemin gradyanı + metin + vurgu. Açık temalarda (Limonata, Pudra) cam, çip ve birincil buton `ink/surface/contrast` token'larıyla tersine döner: beyaz pill + koyu metin, koyu birincil buton. |
| Fontlar | Schibsted Grotesk (kabuk başlıkları), Hanken Grotesk (gövde), Unbounded (afiş rakamları), Space Mono (kod). Davetiye başlık fontları: Klasik/Schibsted · Eklektik/Fraunces · Şık/Pinyon Script · Edebi/Libre Baskerville · Dijital/Space Mono · Zarif/Cormorant italik. Hepsi Google Fonts, TR glif destekli. |
| Logo | "Cam p + onay": p harfi, bowl deliğinde tik. Cam hâl ≥ 60 px (ikon, splash, landing); düz hâl ürün içi; 32 px altında dolu bowl; 16 px favicon = kehribar kare + tik. |
| Ölçüler | Masaüstü 1440 (rail 72 px, içerik x=128/216, afiş kolonu 346–358 px), mobil 390. Köşe 12/14/16/20/pill. Dokunma hedefi ≥ 44 px. |
| İkonlar | Emoji yok; 24 px stroke SVG. Katılım butonları: tik / soru / çarpı (düzenleyen Emoji stilini seçerse 🎉 🤔 😢). |

## Faz 1 — MVP ekranları (çizili)

| # | Ekran | Artboard | Cihaz | Etkileşim | Not |
|---|---|---|---|---|---|
| 1 | Giriş: e-posta → kod / sihirli link | `Login` | 1440 | adım geçişi | Resend ile e-posta; e-postada hem 6 haneli kod hem giriş linki; "spam klasörüne bak" notu |
| 2 | İlk giriş: ad + fotoğraf + doğum günü | `Onboarding` | 390 | — | Yalnızca yeni kullanıcı; fotoğraf yoksa baş harfler |
| 3 | Ana sayfa | `Home`, `HomeMobile` | 1440 · 390 | — | Sekmeler: Yaklaşan · Düzenlediklerim · Katıldıklarım · **Taslaklar** (web'de de var) |
| 4 | Plan oluştur (editör) | `Create`, `CreateMobile` | 1440 · 390 | tema seçimi canlı | Tema paneli sağda (masaüstü) / alt bar (mobil) |
| 5 | Tarih & saat seç | `DatePicker` | modal | takvim canlı | Hafta Pazartesi; TSİ sabit; "tarih kesin değil" anahtarı |
| 6 | Konum seç | `LocationPicker` | modal | semt/tam adres canlı | Photon (OSM, ücretsiz) autocomplete; harita yok; "Yalnız semt" varsayılan |
| 7 | Afiş seç | `PosterPicker` | modal | sekmeler canlı | Şablonlar · Yükle · Galerim · GIF; kare, ≥1080 px. Kodda: şablon kategorileri filtreler, Galerim = önceki afişler + albüm fotoğrafları, GIF “yakında” (GIF şimdilik Yükle’den). Yüklenen görsel en çok 2048 px WebP’ye çevrilir. |
| 8 | Tarih anketi — düzenleyen | `Poll` | modal | seçenek ekle/sil | Masrafı böl ve katılım onayıyla birlikte kapalı |
| 9 | Tarih anketi — misafir oyu | `PollGuest` | 390 | oy canlı | Evet/Belki/Hayır; gün seçilince oy → katılım |
| 10 | Plan ayarları: Katılım | `Settings` | modal | — | +1, ad iste, katılım onayı, kontenjan, buton stili, "Belki" |
| 11 | Plan ayarları: Masrafı böl | `SettingsCost` | modal | mod canlı | Kapalı / Sabit / Gönlünden ne koparsa; IBAN, Papara; "ödeme doğrulanmaz" |
| 12 | Plan ayarları: Misafirlere sor | `Questionnaire` | modal | — | Kısa cevap / tek seçim; zorunlu; hazır sorular; misafir önizlemesi |
| 13 | Planın hazır → paylaş | `Share` | modal | — | WhatsApp birincil; link, QR, hikâye afişi, ortak arkadaş daveti. Link başlıktan üretilir, başlık değişince güncellenir, eski link yönlenir. |
| 14 | Hikâye afişi | `Story` | 540×960 | — | 1080×1920 çıktı; güvenli alan üst/alt 250 px; QR |
| 15 | Plan sayfası — düzenleyen | `EventHost` | 1440 | — | Üst araç çubuğu (kodda “Sen düzenliyorsun” çubuğun üstünde etiket; masaüstünde satır kırılır), sayaçlar, onay bekleyenler kartı, link kutusu, hatırlatma özeti, iptal |
| 16 | Plan sayfası — katılım sonrası | `Event`, `EventMobile` | 1440 · 390 | — | 150 px "Geliyorum" küresi (masaüstü) / yapışkan hap (mobil); albüm; akış |
| 17 | Davetiye — linkten gelen (katılım öncesi) | `InviteMobile` | 390 | — | Viral bant; adres kilitli; "Katılımcılara özel" kartı |
| 18 | Katılım bildirme (3 adım) | `RsvpFlow` | 390 ×3 | — | Durum + ad + e-posta → e-posta kodu / link → +1, sorular, not, takip |
| 19 | Katılımcılar — düzenleyen paneli | `GuestList` | modal | filtre + giriş kontrolü canlı | Onayla/reddet; CSV; e-posta adresi gösterilmez |
| 20 | Duyuru gönder | `Blast` | modal | hedef seçimi canlı | 10 duyuru/plan; kanal: uygulama içi bildirim + e-posta (Resend); e-posta önizlemesi; düzenlenemez |
| 21 | Bildirim paneli | `Notifications` | 1440 | — | Bugün/Dün; olay rozetleri; okunmamış |
| 22 | Profil (kendi) | `Profile` | 1440 | — | Ortak arkadaşlar (gerçek veri), takipçi sayısı, “Takip ettiklerin” listesi; hesap ayarları modalı |
| 23 | Boş durumlar | `Empty` | 1440 | — | Ortak arkadaşlar / Mesajlar / Bildirimler → "ilk planını oluştur" |
| 24 | Tasarım dili · Logo | `Main`, `LogoFinal` | 1440 | — | Referans panoları |

## Eklenen artboard'lar (27 Eyl 2026 — kullanıcı revizyonu)

| # | Ekran | Artboard | Cihaz | Etkileşim | Not |
|---|---|---|---|---|---|
| 29 | Mesajlar | `Messages` | 1440 | sohbet seçimi canlı | Plan bazlı yazışma: düzenleyen ↔ misafir; sol liste (Tümü · Planlar · Kişiler), sağ yazışma, plan çipi, sessize al. Grup sohbeti yok. Rail'de zarf ikonu; "Kart gönder" rail'den kaldırıldı. |
| 30 | Efekt paneli | `Effects` | 1440 | efekt/yoğunluk/zaman seçimi canlı | Tema paneliyle aynı yer ve ölçü; Yok · Konfeti · Işıltı · Kar · Balon · Kalp · Havai fişek; yoğunluk Az/Orta/Çok; "açılışta bir kez (4 sn)" / "sürekli"; misafir kapatabilir; hareketi azalt'a saygı; `extras.effect` olarak kaydedilir. |
| 31 | Katılım butonu stili | `RsvpStyles` | 1440 | menü canlı | Editör kartındaki açılır menü: Simgeler (varsayılan) · Emoji (🎉 🤔 😢) · Metin · Tek düğme; Ayarlar → Katılım ile aynı değer. |

## Faz 1 — giriş yapmamış (public) yüzeyler (çizili)

| # | Ekran | Artboard | Cihaz | Not |
|---|---|---|---|---|
| 25 | Landing | `Landing`, `LandingMobile` | 1440 · 390 | Hero "Plan yap. Linki at. Kim geliyor gör." + telefon mock + WhatsApp balonu; 4 özelleştirme kartı; şablon şeridi; 3 büyük özellik (WhatsApp, kim geliyor, duyuru); "Nasıl çalışır" 3 adım + 6 küçük özellik; kapanış CTA; footer. **Sahte yorum/istatistik yok** — kullanıcı gelince eklenir. |
| 26 | Occasion / SEO sayfası | `Occasion` | 1440 | Örnek: `/dogum-gunu-davetiyesi`. Hero, 12 şablonlu grid (kategori çipleri), 3 özellik, SEO metni + SSS, diğer davetiyeler bandı. Aynı kalıp: yemek & brunch, ev partisi, kına & nişan, mangal, yılbaşı (sezonluk). |
| 27 | Davetiye — giriş yapmamış misafir (masaüstü) | `InviteDesktop` | 1440 | Üstte viral bant + logo/Giriş; rail yok. Üç yuvarlak buton → `RsvpFlow`; "Katılımcılara özel" kartı; takvime ekleme katılım sonrası. Mobil karşılığı `InviteMobile`. |
| 28 | Public nav / footer | `build.py` → `__PUBNAV__`, `__PUBFOOTER__` | — | Nav: logo · Doğum günü · Yemek & brunch · Ev partisi · Yılbaşı · Kına & nişan · Giriş · Oluştur. Footer: CTA çifti + Gizlilik/KVKK/Koşullar (kodda sayfaları var) ve diğer bağlantılar. |

**Giriş yapmadan oluşturma (spec, kodda):** `/olustur` girişsiz açılır (`Create` ile aynı; "Düzenleyen" satırı "Giriş yapınca adın görünür"). "Yayınla ve paylaş" → `Login` (e-posta + kod/link) → taslak hesaba bağlanır → `Share`. Taslak, doğrulanana kadar tarayıcıda (localStorage) tutulur.

## Faz 1 — spesifikasyonla geçilecekler (çizim yok, aynı kalıplar)

| Ekran | Kalıp | Spesifikasyon |
|---|---|---|
| Ayarlar: Düzenleyenler | `Settings` modalı | Liste (Oluşturan · Sen), "+ Ortak düzenleyen" (ortak arkadaşlardan seç → davet, kabul edene dek *Bekliyor*), "Linkle ortak düzenleyen ekle" anahtarı (uyarı: linki alan herkes düzenleyen olur). |
| Ayarlar: Görünürlük & gizlilik | `Settings` modalı | Anahtarlar: akış zaman damgaları, misafir adları, misafir sayısı, plan şifresi (Faz 2), "Gizli beğeni" (Faz 2). Not: liste ve akış katılım öncesi her zaman gizli. |
| Ayarlar: Kitle | `Settings` modalı | Gizli (linke sahip olanlar, varsayılan) / Herkese açık (Keşfet'te listelenir; MVP'de açık). |
| Ayarlar: Fotoğraf albümü | `Settings` modalı | Filtre (Yok / Sıcak / Siyah-beyaz), "Misafirler yükleyebilsin", albüm linki. |
| Ayarlar: Hatırlatmalar | `Settings` modalı | Tek anahtar. Sabit program: katılım hatırlatması 1 hafta önce (Davetli + Belki), etkinlik hatırlatması 2 saat önce (Geliyor). Kanal: uygulama içi bildirim + e-posta (Resend). |
| Efekt paneli | Çizildi → `Effects` (#30) | Bu satır #30 ile değişti. |
| Masrafı böl — misafir tarafı | `EventMobile` kartı + sheet | "IBAN'ı kopyala" / "Papara'yı aç" → "Gönderdim" onayı → düzenleyen panelinde beyan olarak görünür. Doğrulama yok. |
| Yorum / fotoğraf yükleme | `Event` akışı | Kodda: metin yorumu (misafir + düzenleyen), düzenleyen siler; fotoğraflar albümde. GIF ve yanıtlar yok. |
| İptal / sil / tarih değişikliği | Onay diyaloğu | **İptal kodda:** isteğe bağlı not, misafirlere bildirim + e-posta, davetiye "Bu plan iptal edildi", geri alınabilir. Tarih değişikliği bildirimi ve silme (30 gün geri alma) henüz yok. |
| Sistem sayfaları | Kabuk | Kodda 404 ve plan iptal edildi. Plan sona erdi durumu yok. |
| Profil ayarları | Profil → “Hesap ayarları” modalı (rail’de ayar ikonu yok) | Kodda: e-posta (salt okunur), bildirimler anahtarı, çıkış. Takvim senkronu ve “Verilerim” (KVKK indir/sil) “Yakında”. Dil ve erişilebilirlik yok. |
| Takvime ekle | Cam açılır menü | Kodda: Google Takvim linki + `.ics` (`/api/takvim/{kod}`), katılım sonrası. |
| Kart gönder, Organizasyon profili | çizili (`Card`, `OrgProfile`) | **Faz 2** — menüde görünmez; ana sayfada Kartlar kartı “Yakında”. Keşfet (`Explore`) ve Mesajlar (#29) MVP'ye alındı, kodda. |

## Fazlar

- **Faz 1 (MVP, kodda):** giriş (e-posta kodu/link, Resend), oluştur (tema/efekt/afiş/tarih/konum/anket/sorular/masraf/buton stili), yayınla + WhatsApp paylaşımı, davetiye, katılım (e-posta doğrulama), plan sayfası (akış, albüm), düzenleyen paneli (liste, onay, duyuru, giriş kontrolü, misafir ekle, ortak düzenleyen, iptal), bildirimler, mesajlar, herkese açık planlar + Keşfet, profil, hatırlatmalar.
- **Faz 2:** organizasyon profili, kartlar, plan şifresi, gizli beğeni, Premium (tema dışı özellikler), AI öneri, GIF arama.
- **Faz 3:** gerçek tahsilat (iyzico/PayTR), bilet satışı, bekleme listesi otomasyonu, Expo mobil uygulama.

## Açık sorular

1. ~~Domain~~ Karar: **getpartile.com**, link formatı `/e/{kod}`.
2. ~~SMS/OTP sağlayıcısı~~ Karar: MVP'de e-posta + Resend; SMS/WhatsApp doğrulama ürün tutarsa. WhatsApp Business API duyuru kanalı Faz 2.
3. ~~Konum sağlayıcısı~~ Karar: Photon (OSM, anahtarsız); harita linki Google Maps araması.
4. GIF sağlayıcısı (GIPHY ya da Tenor) ve anahtarı — afiş seçicideki GIF sekmesi için; yorumlarda GIF yok.
5. Logo 3D render'ı: kullanıcı kendi aracında `#1EC9B0 → #FFB020 → #FF6A3D` ile üretecek; app ikonu ve landing hero'ya girecek.

## Tasarımda olmayanlar (kodda var, tuvale işlenecek)

27 Eylül 2026'da doğrudan koda eklendi. Kural gereği önce tuval, sonra envanter güncellenmeli; bu liste o işi bekliyor.

| Özellik | Nerede | Kısa tanım |
|---|---|---|
| Sessize al | Plan sayfası zil çipi (katılım sonrası), ana sayfa kart menüsü | Plan bazlı; duyuru ve hatırlatma bildirimi/e-postası gitmez, düzenleyene katılım bildirimi gelmez. İptal her zaman gider. Açıkken çip “Sessizde”. |
| Takip et | Davetiye “Düzenleyenler” satırı; katılım formundaki takip kutusu | “Takip et” ↔ “Takip ediliyor”. Takip edilen herkese açık plan yayınlayınca bildirim. Profilde “Takip ettiklerin” + “Takibi bırak”. Düzenleyen satırında takipçi sayısı. |
| Sonra hatırlat | Davetiye (katılım öncesi) cam açılır menü | Yarın / 3 gün sonra / Plandan 1 gün önce, yanında tarih-saat. Kurulunca çip “Hatırlatma: Pzt, 28 Eyl · 17:45”, menüde “Hatırlatmayı kaldır”. Giriş ister. |
| Katılımcılar → Tümünü gör | Plan sayfası (katılım sonrası) → modal | Geliyor / Belki / Gelemiyor sekmeleri, kişi sayısı (+1'ler dahil), ad + avatar + “+N misafir”, girişte “Geldi”. E-posta, not, cevap yok. |
| Ortak arkadaşlar kartı | Ana sayfa | Gerçek veri: “Birlikte eğlendiğin N kişi” + ilk üç ad; kişi yoksa boş durum. Profile gider. |
| Planı iptal et | Düzenleyen: kart menüsü ve plan sayfası | Not alanlı onay modalı; iptal bandı misafir ve düzenleyen sayfasında; “Geri al”. |
| Ortak düzenleyen daveti | Ayarlar → Düzenleyenler; davetiye üstünde kabul/reddet bandı | E-postayla davet, kabul edene dek yetki yok. |
| Misafir ekle | Katılımcılar modalı | Satır başına bir kişi: ad (+ e-posta). E-postası olana davetiye e-postası. |
| Masrafı böl — misafir | Plan sayfası kartı | IBAN kopyala, Papara, “Gönderdim” ↔ “Geri al”. |
| Açık tema kontrolleri | Tüm tema sayfaları | Limonata/Pudra'da çipler beyaz pill + koyu metin, birincil buton koyu. |
| Hukuk sayfaları | `/kvkk`, `/gizlilik`, `/kosullar` | Taslak metin, footer bağlantıları. |
