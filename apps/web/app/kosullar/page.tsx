import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "Kullanım Koşulları", description: "partile’ı kullanırken geçerli kurallar." };

/** Terms of use. DRAFT — hukuki inceleme gerekir. */
export default function TermsPage() {
  return (
    <LegalPage current="/kosullar" title="Kullanım Koşulları" lead={`${LEGAL.site} adresindeki partile hizmetini kullanarak bu koşulları kabul etmiş olursun.`}>
      <h2>1. Hizmet</h2>
      <p>partile; plan oluşturma, davetiye paylaşma, katılım toplama, duyuru, mesajlaşma ve fotoğraf albümü sunan ücretsiz bir çevrim içi hizmettir. Hizmeti zaman zaman değiştirebilir, geliştirebilir ya da bazı özellikleri kaldırabiliriz.</p>

      <h2>2. Hesap</h2>
      <ul>
        <li>Hesap e-posta adresinle açılır; giriş, e-postana gelen tek seferlik kodla yapılır. E-posta hesabının güvenliğinden sen sorumlusun.</li>
        <li>Hizmeti kullanmak için en az 13 yaşında olmalısın; 18 yaşından küçüksen velinin iznine ihtiyacın var.</li>
        <li>Başkası adına, yanıltıcı bir kimlikle ya da otomatik araçlarla hesap açamazsın.</li>
      </ul>

      <h2>3. İçeriğin</h2>
      <p>Planlar, afişler, yorumlar, mesajlar ve fotoğraflar senindir. Bunları hizmeti sunmak için (saklamak, göstermek, davet ettiğin kişilere iletmek) kullanmamıza izin verirsin. Paylaştığın içerik için gerekli haklara sahip olmalısın; başkalarının fotoğraflarını onların izni olmadan yüklememelisin.</p>

      <h2>4. Yasak kullanımlar</h2>
      <ul>
        <li>Yasa dışı, nefret söylemi içeren, taciz eden, müstehcen ya da şiddeti özendiren içerik paylaşmak,</li>
        <li>İstenmeyen toplu ileti (spam) göndermek ya da davet özelliğini tanımadığın kişilere reklam için kullanmak,</li>
        <li>Hizmetin güvenliğini aşmaya, başkalarının verilerine erişmeye ya da hizmeti aşırı yüklemeye çalışmak,</li>
        <li>Bilet satışı, dolandırıcılık ya da sahte etkinlik amacıyla plan oluşturmak.</li>
      </ul>
      <p>Bu kurallara aykırı içerikleri kaldırabilir, hesabı askıya alabilir ya da kapatabiliriz.</p>

      <h2>5. Düzenleyenin sorumluluğu</h2>
      <p>Planın düzenleyeni; planın içeriğinden, etkinliğin kendisinden ve misafirlerden topladığı bilgilerin (soru cevapları, +1 adları) amacına uygun kullanılmasından sorumludur. partile etkinliklerin organizatörü değildir.</p>

      <h2>6. Masrafı böl</h2>
      <p>“Masrafı böl” yalnız düzenleyenin girdiği IBAN ya da Papara bilgisini gösterir ve misafirin “gönderdim” işaretini kaydeder. partile ödeme almaz, aracılık etmez, ödemeleri doğrulamaz; taraflar arasındaki ödemelerden sorumlu değildir.</p>

      <h2>7. Sorumluluğun sınırı</h2>
      <p>Hizmeti olduğu gibi sunarız ve kesintisiz ya da hatasız çalışacağını garanti etmeyiz. Yasaların izin verdiği ölçüde, hizmetin kullanımından doğan dolaylı zararlardan sorumlu değiliz. Önemli planlarda katılım listesini ayrıca yedeklemeni öneririz (katılımcılar → CSV indir).</p>

      <h2>8. Değişiklikler ve fesih</h2>
      <p>Bu koşulları güncelleyebiliriz; önemli değişiklikleri sitede ya da e-postayla duyururuz. Hesabını istediğin zaman kapatabilirsin. Kişisel verilerinle ilgili ayrıntılar <Link href="/kvkk">KVKK Aydınlatma Metni</Link> ve <Link href="/gizlilik">Gizlilik ve Çerezler</Link> sayfalarındadır.</p>

      <h2>9. Uygulanacak hukuk</h2>
      <p>Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıklarda İstanbul mahkemeleri ve icra daireleri yetkilidir; tüketici sıfatıyla yasal başvuru hakların saklıdır.</p>
    </LegalPage>
  );
}
