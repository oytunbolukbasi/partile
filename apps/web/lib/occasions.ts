/**
 * Copy and template sets for the SEO occasion pages (`Occasion` artboard): `/{slug}`.
 * Slugs mirror `occasions` in PublicNav. Templates reference themes/fonts from ui-tokens.
 */
export type Template = { name: string; text: string; theme: string; font: string; size: number };
export type Occasion = {
  slug: string;
  eyebrow: string;
  title: string;
  lead: string;
  templates: Template[];
  h2: string;
  seo: [string, string];
  faq: { q: string; a: string }[];
};

const T = (name: string, text: string, theme: string, font: string, size: number): Template => ({ name, text, theme, font, size });

export const occasions: Occasion[] = [
  {
    slug: "dogum-gunu-davetiyesi",
    eyebrow: "DOĞUM GÜNÜ",
    title: "Doğum günü davetiyesi, saniyeler içinde",
    lead: "Tarzına uyan ücretsiz doğum günü davetiyeleri. Şablonu seç, tarihi yaz, linki WhatsApp’ta paylaş; uygulama gerekmez.",
    templates: [
      T("Otuzuna girdi", "30", "kor", "klasik", 84),
      T("Balonlar", "iyi ki\ndoğdun", "pudra", "sik", 44),
      T("29 Kulübü", "29\nKULÜBÜ", "kobalt", "dijital", 26),
      T("Kadeh kaldır", "kadeh\nkaldır", "derin-deniz", "eklektik", 34),
      T("Sürpriz!", "ŞŞŞ.\nSÜRPRİZ", "gece", "klasik", 30),
      T("Bir devrin sonu", "bir devrin\nsonu", "kiraz", "edebi", 24),
      T("Minimal", "yirmi\nbeş", "limonata", "klasik", 32),
      T("Gün batımı", "40", "kiraz", "klasik", 84),
      T("Bahçe", "bahçede\nçay", "zeytinlik", "eklektik", 30),
      T("Havuz başı", "havuz\nbaşı", "limonata", "klasik", 32),
      T("Kutlama", "KUTLAMA", "kor", "klasik", 24),
      T("Parti zamanı", "parti\nzamanı", "kor", "sik", 44),
    ],
    h2: "Doğum günün başlasın",
    seo: [
      "Toplanmak kolay; herkesi aynı gün aynı yere getirmek zor. partile ile dakikalar içinde ücretsiz bir doğum günü davetiyesi hazırlarsın, linki WhatsApp’tan gönderirsin, katılımları anında görürsün. Reklam yok, ücret yok, grup sohbeti kaosu yok.",
      "Davetiyene “Misafirlere sor” ekle: pasta mı tatlı mı, kim ne getiriyor, ortak hediye olacak mı; baştan öğren. Tarihi kesinleştiremediysen “Hangi gün?” anketiyle misafirlere sor. Doğum günü sahibinin gelmemesi gereken bir sürpriz planlıyorsan davetiyeyi gizli tut; linki alan görür, arayan bulamaz.",
    ],
    faq: [
      { q: "Gerçekten ücretsiz mi?", a: "Evet. Davetiye, katılım takibi, duyuru ve hatırlatmalar ücretsiz." },
      { q: "Misafirler uygulama indirmek zorunda mı?", a: "Hayır. Linke dokunan herkes adı ve e-postasıyla katılımını bildirir; e-postasına gelen kodla doğrular." },
      { q: "Sürpriz parti için gizli tutabilir miyim?", a: "Evet. Planlar varsayılan olarak gizlidir: yalnızca linke sahip olanlar görür, arama ve Keşfet’te çıkmaz." },
      { q: "E-posta adreslerim kimde kalıyor?", a: "Misafir e-postaları yalnızca giriş ve hatırlatma için kullanılır; düzenleyene gösterilmez. KVKK’ya uygun aydınlatma ve rıza alınır." },
    ],
  },
  {
    slug: "yemek-davetiyesi",
    eyebrow: "YEMEK & BRUNCH",
    title: "Akşam yemeği ya da brunch, tek linkle toplanın",
    lead: "Kim geliyor, kim ne getiriyor, masrafı nasıl bölüyoruz; hepsi davetiyede. Rezervasyon için kaç kişi olduğunuzu anında gör.",
    templates: [
      T("Uzun masa", "uzun\nmasa", "zeytinlik", "eklektik", 34),
      T("Brunch", "brunch", "limonata", "sik", 48),
      T("Şarap gecesi", "şarap\ngecesi", "kiraz", "edebi", 26),
      T("Herkes bir şey", "sen ne\ngetiriyorsun?", "pudra", "klasik", 24),
      T("Balık ekmek", "balık\nekmek", "derin-deniz", "klasik", 30),
      T("Pazar kahvaltısı", "pazar\nkahvaltısı", "limonata", "eklektik", 28),
      T("Mangal", "mangal", "kor", "klasik", 40),
      T("Meze", "meze\nmasası", "zeytinlik", "sik", 40),
      T("Chef’s table", "chef’s\ntable", "gece", "dijital", 24),
      T("Yeni tarif", "yeni\ntarif", "kobalt", "klasik", 32),
      T("Rakı sofrası", "rakı\nsofrası", "gece", "edebi", 26),
      T("Kahve", "kahve\nsaati", "pudra", "zarif", 36),
    ],
    h2: "Sofra kurulsun",
    seo: [
      "Yemek davetlerinde en zor iş kaç kişi olacağını bilmek. partile ile davetiyeyi WhatsApp’ta paylaşırsın; herkes tek dokunuşla Geliyorum / Belki / Gelemiyorum der, sen de rezervasyonu ona göre yaparsın.",
      "“Misafirlere sor” ile diyet kısıtlarını ve kimin ne getireceğini baştan öğren. Hesabı bölüşüyorsanız IBAN ya da Papara bilgisini davetiyeye ekle; herkes kendi payını gönderip işaretlesin.",
    ],
    faq: [
      { q: "Masrafı nasıl bölüyoruz?", a: "Kişi başı tutarı ya da “gönlünden ne koparsa” seçeneğini aç, IBAN/Papara ekle. Misafir gönderince işaretler; tahsilat ya da kesinti yok." },
      { q: "Diyet kısıtlarını nasıl toplarım?", a: "Ayarlar → Misafirlere sor’dan kısa cevaplı ya da tek seçimli soru ekle; cevaplar katılımcı listesinde görünür." },
      { q: "Tarihi netleştiremedim.", a: "Tarih anketi aç; misafirler günlere oy versin. Günü seçince oylar katılıma dönüşür." },
      { q: "Misafirler uygulama indirmek zorunda mı?", a: "Hayır. Linke dokunan herkes adı ve e-postasıyla katılımını bildirir." },
    ],
  },
  {
    slug: "ev-partisi-davetiyesi",
    eyebrow: "EV PARTİSİ",
    title: "Ev partisi davetiyesi: linki at, kapı çalsın",
    lead: "Adresi yalnızca gelenler görsün, +1’leri baştan bil, gece 22:00’de herkese tek mesajla ulaş.",
    templates: [
      T("Ev partisi", "EV\nPARTİSİ", "gece", "klasik", 34),
      T("Yeni ev", "yeni ev,\nyeni parti", "zeytinlik", "eklektik", 26),
      T("Film gecesi", "film\ngecesi", "kobalt", "dijital", 26),
      T("Oyun gecesi", "oyun\ngecesi", "kor", "klasik", 30),
      T("Terasta", "terasta", "derin-deniz", "sik", 46),
      T("Çatı katı", "çatı\nkatı", "gece", "edebi", 28),
      T("Sabaha kadar", "sabaha\nkadar", "kiraz", "klasik", 30),
      T("Sessiz parti", "kulaklık\ngetir", "kobalt", "dijital", 22),
      T("Bahçe", "bahçe\npartisi", "limonata", "eklektik", 28),
      T("Karaoke", "karaoke", "kor", "klasik", 34),
      T("Kış", "kışa\nmerhaba", "gece", "zarif", 36),
      T("Yaz", "yaz\ngeldi", "limonata", "sik", 46),
    ],
    h2: "Kapıyı aç",
    seo: [
      "Ev partisinde adres herkese açık olmasın: partile davetiyesi semti gösterir, tam adres yalnızca katılımını bildirenlere açılır. Kontenjan koy, katılım onayı iste, +1 misafirlerin adını al.",
      "Gece boyunca duyuru gönder: “Kapı kodu 4471”, “Buz bitti, gelen alsın”. Uygulama içi bildirim ve e-posta ile herkese ulaşır; WhatsApp grubuna gerek kalmaz.",
    ],
    faq: [
      { q: "Adresi herkes görebilir mi?", a: "Hayır. Varsayılan olarak yalnızca semt görünür; tam adres ve harita linki katılım bildirenlere açılır." },
      { q: "Kontenjan koyabilir miyim?", a: "Evet. Kontenjan dolunca gelenler bekleme listesine düşer." },
      { q: "Katılım onayı nasıl çalışır?", a: "Açarsan katılım bildirenler önce “onay bekliyor” olur; sen listeye alırsın." },
      { q: "Misafirler uygulama indirmek zorunda mı?", a: "Hayır. Linke dokunan herkes adı ve e-postasıyla katılımını bildirir." },
    ],
  },
  {
    slug: "yilbasi-davetiyesi",
    eyebrow: "YILBAŞI",
    title: "Yılbaşı davetiyesi: geri sayımı birlikte yapın",
    lead: "Kim geliyor, kim ne getiriyor, hediye çekilişi var mı; tek davetiyede. Linki WhatsApp’ta at, gece 00:00’da herkes orada olsun.",
    templates: [
      T("2027", "2027", "kobalt", "klasik", 52),
      T("Geri sayım", "10\n9\n8", "gece", "dijital", 26),
      T("Kadeh", "kadeh\nkaldır", "derin-deniz", "eklektik", 32),
      T("Yeni yıl", "yeni yıl,\nyeni sen", "kiraz", "sik", 36),
      T("Havai fişek", "00:00", "kobalt", "klasik", 48),
      T("Yılın son gecesi", "yılın son\ngecesi", "gece", "edebi", 26),
      T("Kar", "kar\nyağarsa", "limonata", "zarif", 34),
      T("Çekiliş", "hediye\nçekilişi", "kor", "klasik", 28),
      T("Pijama", "pijama\npartisi", "pudra", "sik", 40),
      T("Konfeti", "konfeti", "kor", "klasik", 34),
      T("Şehir ışıkları", "şehir\nışıkları", "kobalt", "eklektik", 30),
      T("Yeni sayfa", "yeni\nsayfa", "zeytinlik", "zarif", 36),
    ],
    h2: "Yeni yıla hazırlan",
    seo: [
      "Yılbaşı planı en çok ertelenen plandır. partile ile bir dakikada davetiye hazırla, linki WhatsApp’ta at; Geliyorum / Belki / Gelemiyorum cevapları anında toplansın.",
      "Hediye çekilişi mi var? “Misafirlere sor” ile bütçeyi belirle. Masrafı bölüşüyorsanız IBAN’ı ekle. Gece boyunca duyuru gönder: “Taksi çağırdık, aşağıda buluşalım.”",
    ],
    faq: [
      { q: "Gerçekten ücretsiz mi?", a: "Evet. Davetiye, katılım takibi, duyuru ve hatırlatmalar ücretsiz." },
      { q: "Hediye çekilişini nasıl yaparım?", a: "Şimdilik “Misafirlere sor” ile bütçe ve tercih topla; çekiliş eşleştirmesi yol haritasında." },
      { q: "Misafirler uygulama indirmek zorunda mı?", a: "Hayır. Linke dokunan herkes adı ve e-postasıyla katılımını bildirir." },
      { q: "Hatırlatma gider mi?", a: "Evet: 1 hafta önce katılım hatırlatması, 2 saat önce etkinlik hatırlatması." },
    ],
  },
  {
    slug: "kina-nisan-davetiyesi",
    eyebrow: "KINA & NİŞAN",
    title: "Kına ve nişan davetiyesi, aileye de arkadaşlara da",
    lead: "Zarif şablonlar, +1 ve çocuk sayısı, ulaşım ve konaklama soruları; WhatsApp’tan iki aileye tek linkle ulaş.",
    templates: [
      T("Kına gecesi", "kına\ngecesi", "kiraz", "sik", 46),
      T("Nişan", "nişan", "pudra", "zarif", 48),
      T("Söz", "söz\nkesildi", "limonata", "edebi", 26),
      T("Bekârlığa veda", "son\ngece", "gece", "klasik", 34),
      T("Al yazma", "al\nyazma", "kiraz", "eklektik", 32),
      T("Beyaz", "evet", "pudra", "sik", 56),
      T("Bahçe nişanı", "bahçede\nnişan", "zeytinlik", "zarif", 34),
      T("Deniz kenarı", "deniz\nkenarı", "derin-deniz", "eklektik", 30),
      T("Altın", "altın\ngece", "kor", "edebi", 26),
      T("Modern", "N & E", "gece", "dijital", 28),
      T("Klasik", "Nişan\nDavetiyesi", "limonata", "edebi", 22),
      T("Çiçek", "çiçek\nbahçesi", "pudra", "zarif", 34),
    ],
    h2: "Mutlu gün yaklaşıyor",
    seo: [
      "Kına ve nişan davetiyesi basılı olmak zorunda değil. partile ile şık bir dijital davetiye hazırla, linki iki ailenin WhatsApp gruplarına at; kim geliyor, kaç kişi, çocuk var mı anında gör.",
      "“Misafirlere sor” ile ulaşım ve konaklama ihtiyacını topla, +1 misafirlerin adını iste. Katılımcı listesini CSV olarak indirip masa düzenine geç.",
    ],
    faq: [
      { q: "Basılı davetiye de kullanabilir miyim?", a: "Evet. Hikâye afişi ve QR kodu indirip basılı davetiyeye ekleyebilirsin; okutan doğrudan katılım bildirir." },
      { q: "Çocuk sayısını nasıl öğrenirim?", a: "+1 misafir sayısını aç ya da “Misafirlere sor” ile çocuk sayısı sor." },
      { q: "Listeyi dışa aktarabilir miyim?", a: "Evet. Katılımcılar panelinden CSV indir; e-posta adresleri dahil edilmez." },
      { q: "Misafirler uygulama indirmek zorunda mı?", a: "Hayır. Linke dokunan herkes adı ve e-postasıyla katılımını bildirir." },
    ],
  },
];

export const getOccasion = (slug: string) => occasions.find((o) => o.slug === slug);
