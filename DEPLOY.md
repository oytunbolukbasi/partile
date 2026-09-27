# Canlı altyapı

getpartile.com şu parçalarla çalışır (27 Eyl 2026 itibarıyla kurulu):

| Parça | Ne yapar |
|---|---|
| **Railway — web servisi** | Kökteki `Dockerfile` (Next standalone) → `/app/start.sh`. `main` dalına her push otomatik deploy. Volume `/data` (yüklemeler). Sağlık: `/api/saglik`. |
| **Railway — cron servisi** | `curlimages/curl`, saatte bir `/api/cron/hatirlatma`'yı çağırır. |
| **Neon** | Postgres (`DATABASE_URL`). Migrasyonlar web açılışında uygulanır. Bölge şu an us-east-2. |
| **Resend** | Giriş kodu, davet, duyuru, hatırlatma, iptal e-postaları. Domain `getpartile.com` doğrulandı; bölge Tokyo. |
| **Cloudflare** | DNS + proxy (kök ve www), SSL/TLS **Full (strict)**, `www` → kök 301 kuralı. |

## 1. Web servisi

- **Build:** `railway.toml` Dockerfile builder'ı ve başlatma komutunu (`/app/start.sh`) tanımlar. Servis ayarında *Custom Start Command* boş kalmalı; doluysa (ör. `pnpm start`) “The executable `pnpm` could not be found” hatası gelir, çünkü çalışma imajında pnpm yok.
- **Port:** `start.sh` `0.0.0.0:$PORT` dinler. Railway kendi `PORT`'unu enjekte eder; domain 3000'e bağlı olduğundan Variables'ta `PORT=3000` var. Port uyuşmazsa 502 “Application failed to respond” görülür.
- **Volume:** mount path `/data`; imaj `UPLOAD_DIR=/data/uploads` ile gelir. Volume yoksa her deploy'da yüklenen afiş ve fotoğraflar kaybolur.
- **Custom domain:** Railway'de `getpartile.com` tanımlı. `www.getpartile.com` da tanımlı ama gereksiz; yönlendirme Cloudflare'de yapıldığı için silinebilir.

### Ortam değişkenleri

| Değişken | Değer |
|---|---|
| `DATABASE_URL` | Neon bağlantı dizesi (pooler). `sslmode`/`channel_binding` parametrelerini istemci ayıklar, TLS'i kendisi açar. |
| `AUTH_SECRET` | `openssl rand -hex 32`. Zorunlu; değişirse herkesin oturumu kapanır. |
| `CRON_SECRET` | `openssl rand -hex 24`. Cron servisindekiyle aynı. |
| `PORT` | `3000` |
| `NEXT_PUBLIC_SITE_URL` | `https://getpartile.com` (paylaşım linkleri, e-posta linkleri, OG, sihirli link yönlendirmesi) |
| `RESEND_API_KEY` | Resend panelinden |
| `RESEND_FROM` | `partile <merhaba@getpartile.com>` |
| `DEMO_LOGIN_CODE` | **Yalnız test:** demo@getpartile.com için sabit 6 haneli kod; bu adrese e-posta gitmez. Halka açmadan önce sil. |
| `SEED_SAMPLE` | `1` ise açılışta örnek planlar eklenir. **Halka açmadan önce sil.** |
| `PGSSL` | Gerekmez (uzak host'ta TLS zaten açılır). `1` TLS'i zorlar. |
| `DB_AUTO_MIGRATE` | `0` açılıştaki migrasyonu kapatır. Boş bırak. |

## 2. Hatırlatma cron'u

1. Projede **+ New → Docker Image** → `curlimages/curl:latest`.
2. Variables: `CRON_SECRET` (web servisindekiyle aynı; ya da referans `${{@partile/web.CRON_SECRET}}`).
3. **Settings → Deploy → Custom Start Command** (Railway komutu kabuksuz çalıştırır, değişkenin açılması için `sh -c` şart):

```bash
sh -c 'curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://getpartile.com/api/cron/hatirlatma'
```

4. **Settings → Cron Schedule:** `0 * * * *` (saatte bir, UTC). Her çalışmada komut koşup kapanır; “Completed” normaldir. Log'da `{"now":…,"sent":[…]}` görünmeli; 401 dönüyorsa anahtar yanlış.

Ne gönderir: katılım hatırlatması 1 hafta önce (davetli + belki), etkinlik hatırlatması 2 saat önce (geliyor), vakti gelen “Sonra hatırlat” istekleri. Sessize alanlar atlanır. Her tür plan başına bir kez.

## 3. Cloudflare

- **DNS:** kök (`@`) ve `www` Railway'e CNAME, **Proxied** (turuncu bulut). Resend'in verdiği kayıtlar (DKIM, SPF, MX) **DNS only** (gri bulut) kalmalı; Cloudflare'e taşırken eksik gelirse Resend → Domains'ten yeniden ekle.
- **SSL/TLS → Overview:** **Full (strict)**. Railway geçerli Let's Encrypt sertifikası sunduğu için sorunsuz.
- **SSL/TLS → Edge Certificates:** Always Use HTTPS açık olmalı.
- **Rules → Redirect Rules:** `https://www.getpartile.com/*` → `https://getpartile.com/${1}`, 301, sorgu dizesi korunur.

## 4. Kontrol listesi

```bash
curl -s https://getpartile.com/api/saglik
```

- Sağlık `{"ok":true,…}` döner; `https://www.getpartile.com/x?y=1` → 301 `https://getpartile.com/x?y=1`.
- `/giris` ile kendi e-postana kod gelir (Resend → Logs).
- Yayınlanan plan WhatsApp'ta kartla açılır (`/e/{kod}/opengraph-image`).
- Afiş yükle, yeniden deploy et, afiş hâlâ açılıyor olmalı (volume).

## 5. Sonraki deploy'lar ve geri alma

- Şema değişince `corepack pnpm --filter @partile/db generate` → oluşan `packages/db/drizzle/*` dosyalarını commit'le; açılışta uygulanır.
- Migrasyonlar yalnız ekleyici olmalı (yeni tablo/kolon). Railway → Deployments → **Rollback** kodu geri alır, şemayı almaz.
- Yerel `apps/web/.env` de Neon'a bağlı; yerel dev sunucusu açılırken yeni migrasyonları canlı veritabanına uygular.

## 6. Halka açmadan önce

1. Railway'den `DEMO_LOGIN_CODE` ve `SEED_SAMPLE`'ı sil.
2. Neon'daki örnek içeriği temizle (demo kullanıcı, `ece30`/`sahil`/`mangal` ve Keşfet örnekleri, `u_mert`/`u_buse` vb.).
3. Neon şifresini, Resend anahtarını ve `CRON_SECRET`'ı yenile (hem Railway'de hem yerel `.env`'de).
4. `apps/web/lib/legal.ts`'e veri sorumlusu adı ve adresini gir; hukuk metinlerini inceletip taslak notlarını kaldır.
5. İsteğe bağlı: Neon'u Frankfurt'a, Resend'i İrlanda'ya taşı.

## Yerelde imajı denemek (Docker varsa)

```bash
docker build -t partile . && docker run --rm -p 3000:3000 -e AUTH_SECRET=dev -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 -e DATABASE_URL=postgres://… partile
```

İmajda PGlite dosyaları yok; `DATABASE_URL` vermek şart.
