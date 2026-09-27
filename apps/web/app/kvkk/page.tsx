import { LegalPage } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "KVKK Aydınlatma Metni", description: "partile’ın kişisel verileri nasıl işlediğine dair 6698 sayılı KVKK kapsamındaki aydınlatma metni." };

/** 6698 sayılı KVKK md. 10 aydınlatma metni. DRAFT — hukuki inceleme gerekir. */
export default function KvkkPage() {
  const controller = LEGAL.address ? `${LEGAL.controller} (${LEGAL.address})` : LEGAL.controller;
  return (
    <LegalPage current="/kvkk" title="KVKK Aydınlatma Metni" lead="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, partile’ı kullanırken hangi verilerini neden işlediğimizi açıklıyoruz.">
      <h2>1. Veri sorumlusu</h2>
      <p>Kişisel verilerin, veri sorumlusu sıfatıyla <strong>{controller}</strong> tarafından işlenir. Bize <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> adresinden ulaşabilirsin.</p>

      <h2>2. Hangi verileri işliyoruz</h2>
      <ul>
        <li><strong>Kimlik ve iletişim:</strong> e-posta adresin, adın; istersen doğum günün (yalnız gün/ay) ve kısa tanıtımın.</li>
        <li><strong>Plan içerikleri:</strong> oluşturduğun planların başlığı, tarihi, konumu, açıklaması, afişi, ayarları ve masraf bilgileri (IBAN/Papara yalnız senin girdiğin şekliyle).</li>
        <li><strong>Katılım verileri:</strong> katılım yanıtın (Geliyorum / Belki / Gelemiyorum), +1 misafir sayısı ve adları, düzenleyenin sorularına verdiğin cevaplar, notların, anket oyların, “gönderdim” işaretin.</li>
        <li><strong>Paylaşımların:</strong> yorumların, mesajların ve albüme yüklediğin fotoğraflar.</li>
        <li><strong>Teknik veriler:</strong> oturum çerezi, IP adresi, tarayıcı bilgisi ve sunucu kayıtları (güvenlik ve hata tespiti için).</li>
      </ul>
      <p>Düzenleyenler misafirlerin e-posta adreslerini <strong>göremez</strong>; e-posta yalnız giriş, doğrulama, duyuru ve hatırlatma için kullanılır.</p>

      <h2>3. Hangi amaçlarla</h2>
      <ul>
        <li>Hesabını oluşturmak ve e-postanı tek seferlik kodla doğrulamak,</li>
        <li>Plan oluşturma, davet, katılım, mesajlaşma, albüm ve takvim özelliklerini sunmak,</li>
        <li>Katıldığın ya da davet edildiğin planlarla ilgili duyuru, hatırlatma ve bildirim göndermek,</li>
        <li>Hizmetin güvenliğini sağlamak, kötüye kullanımı önlemek ve hataları gidermek,</li>
        <li>Yasal yükümlülüklerimizi yerine getirmek.</li>
      </ul>

      <h2>4. Hukuki sebepler</h2>
      <p>Verilerin KVKK md. 5/2 kapsamında; hizmeti sunabilmemiz için <strong>sözleşmenin kurulması ve ifası</strong> (c), <strong>hukuki yükümlülüklerimiz</strong> (ç) ve hizmetin güvenliği için <strong>meşru menfaatimiz</strong> (f) sebeplerine dayanılarak işlenir. Pazarlama amaçlı e-posta göndermiyoruz; ileride gönderirsek ayrıca açık rızanı ve İYS kaydını alırız. Plan duyuru ve hatırlatmaları, katıldığın hizmete ilişkin işlem iletileridir.</p>

      <h2>5. Kimlere aktarıyoruz</h2>
      <p>Verilerini satmayız ve reklam amacıyla paylaşmayız. Hizmeti çalıştırmak için aşağıdaki altyapı sağlayıcılarıyla, yalnız gerekli ölçüde paylaşılır. Bu sağlayıcıların bir kısmı yurt dışındadır; aktarım KVKK md. 9 ve ilgili düzenlemelere uygun güvencelerle yapılır.</p>
      <table>
        <thead><tr><th>Sağlayıcı</th><th>Amaç</th><th>Konum</th></tr></thead>
        <tbody>
          {LEGAL.processors.map((p) => (
            <tr key={p.name}><td>{p.name}</td><td>{p.role}</td><td>{p.where}</td></tr>
          ))}
        </tbody>
      </table>
      <p>Plan sayfasındaki bilgiler (adın, katılım yanıtın, yorumların, fotoğrafların) planın düzenleyenlerine ve katılım bildiren diğer misafirlere, planın ayarlarına göre görünür. Herkese açık planlar Keşfet’te listelenir.</p>

      <h2>6. Nasıl topluyoruz, ne kadar saklıyoruz</h2>
      <p>Veriler, siteyi kullanırken formlara girdiğin bilgilerden ve otomatik yollarla (çerez, sunucu kaydı) elektronik ortamda toplanır. Hesabın açık olduğu sürece saklanır; hesabını silmeni istediğinde 30 gün içinde silinir ya da anonimleştirilir. Tek seferlik doğrulama kodları 10 dakika geçerlidir. Yasal saklama süresi olan kayıtlar bu süre boyunca tutulur.</p>

      <h2>7. Hakların</h2>
      <p>KVKK md. 11 uyarınca; verilerinin işlenip işlenmediğini öğrenme, bilgi talep etme, amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı üçüncü kişileri bilme, eksik ya da yanlış işlenmişse düzeltilmesini, silinmesini veya yok edilmesini isteme, bu işlemlerin aktarılan kişilere bildirilmesini isteme, otomatik analiz sonucu aleyhine bir sonuca itiraz etme ve kanuna aykırı işleme sebebiyle zarara uğradıysan zararın giderilmesini talep etme hakların vardır.</p>
      <p>Başvurunu kayıtlı e-posta adresinden <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> adresine gönderebilirsin; en geç 30 gün içinde ücretsiz yanıtlarız.</p>
    </LegalPage>
  );
}
