import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = { title: "Gizlilik ve Çerezler", description: "partile’da neyin kime görünür olduğu ve kullandığımız çerezler." };

/** Plain-language privacy summary + cookie notice. DRAFT — hukuki inceleme gerekir. */
export default function PrivacyPage() {
  return (
    <LegalPage current="/gizlilik" title="Gizlilik ve Çerezler" lead="Kısaca: e-postan sende kalır, reklam yok, izleme yok. Ayrıntılar aşağıda.">
      <h2>Kim neyi görür</h2>
      <ul>
        <li><strong>Gizli plan</strong> (varsayılan): yalnız linke sahip olanlar davetiyeyi görür. Semt görünür; tam adres, katılımcı listesi, akış ve albüm yalnız katılım bildirenlere açılır.</li>
        <li><strong>Herkese açık plan:</strong> Keşfet’te ve düzenleyenin profilinde listelenir; katılımcı listesi ve tam adres yine katılım bildirenlere özeldir.</li>
        <li><strong>E-posta adresin</strong> hiçbir düzenleyene ya da misafire gösterilmez. Düzenleyen katılımcı listesini CSV olarak indirse bile e-posta sütunu yoktur.</li>
        <li><strong>Mesajlar</strong> yalnız aynı planda olan düzenleyen ile misafir arasındadır; grup sohbeti yoktur.</li>
      </ul>

      <h2>Çerezler ve tarayıcı depolaması</h2>
      <table>
        <thead><tr><th>Ad</th><th>Tür</th><th>Neden</th><th>Süre</th></tr></thead>
        <tbody>
          <tr><td>partile_session</td><td>Zorunlu çerez</td><td>Giriş yaptığında oturumunu hatırlar</td><td>90 gün</td></tr>
          <tr><td>partile:draft:v1</td><td>Tarayıcı depolaması</td><td>Giriş yapmadan başladığın plan taslağını saklar</td><td>Sen silene kadar</td></tr>
        </tbody>
      </table>
      <p>Analiz, reklam ya da üçüncü taraf izleme çerezi kullanmıyoruz; bu yüzden çerez onay penceresi göstermiyoruz. İleride eklersek önce iznini alırız. Altyapı sağlayıcımız Cloudflare, güvenlik amacıyla kendi teknik çerezlerini koyabilir.</p>

      <h2>E-postalar</h2>
      <p>Sana yalnız giriş kodu, davet, duyuru ve katıldığın planların hatırlatmalarını göndeririz. Bir planın bildirimlerini plan sayfasındaki zil ile sessize alabilir, hatırlatmaları profil → hesap ayarlarından kapatabilirsin.</p>

      <h2>Verilerini silmek</h2>
      <p>Hesabını ve verilerini silmemizi istediğinde 30 gün içinde yaparız. Ayrıntılar ve hakların için <Link href="/kvkk">KVKK Aydınlatma Metni</Link>’ne bak.</p>
    </LegalPage>
  );
}
