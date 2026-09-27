# Railway'e çıkış

Tek servis (web) + Postgres + kalıcı volume + saatlik cron. Görsel dosyalar volume'da, e-posta Resend'de.

## 1. Proje ve servisler

1. Railway → **New Project → Deploy from GitHub repo** → `oytunbolukbasi/partile`, dal `main` (ya da bu dal). Builder otomatik **Dockerfile** (kökteki `Dockerfile`, `railway.toml` sağlık kontrolünü tanımlar).
2. Veritabanı: **Neon** projesi kullanılıyor (27 Eyl 2026’da bağlandı, şema + örnek içerik yüklendi). Railway Postgres tercih edilirse **+ New → Database → PostgreSQL** ve `${{Postgres.DATABASE_URL}}`.
3. Web servisi → **Volumes → Add Volume**, mount path **`/data`** (yüklemeler `/data/uploads`'a yazılır; `UPLOAD_DIR` imajda hazır).
4. **Settings → Networking → Custom Domain**: `getpartile.com` ve `www.getpartile.com`. Railway'in verdiği CNAME'leri DNS'e ekle (apex için ALIAS/ANAME ya da Railway'in IP yönergesi).

Sık görülen hata: **“The executable `pnpm` could not be found”** — Railway servis ayarında bir *Custom Start Command* (ör. `pnpm start`) kalmıştır. Settings → Deploy → Custom Start Command alanını boşalt; `railway.toml` zaten `node apps/web/server.js` ile başlatır. Servis “Unexposed” görünüyorsa Settings → Networking → **Generate Domain** (ya da custom domain) ile dışa aç.

## 2. Ortam değişkenleri (web servisi)

| Değişken | Değer |
|---|---|
| `DATABASE_URL` | Neon bağlantı dizesi (pooler, `sslmode=require`) — ya da Railway Postgres için `${{Postgres.DATABASE_URL}}` |
| `AUTH_SECRET` | `openssl rand -hex 32` çıktısı — zorunlu, değişirse herkes çıkış yapar |
| `CRON_SECRET` | `openssl rand -hex 24` — cron servisiyle aynı değer |
| `NEXT_PUBLIC_SITE_URL` | `https://getpartile.com` (paylaşım linkleri, e-posta linkleri, OG görseli) |
| `RESEND_API_KEY` | Resend panelinden |
| `RESEND_FROM` | `partile <merhaba@getpartile.com>` |
| `PGSSL` | Railway Postgres için boş bırak; harici SSL zorunlu DB'de `1` |
| `SEED_SAMPLE` | İlk açılışta örnek planları istiyorsan `1`, sonra kaldır. Prod'da önerilmez. |

Migrasyonlar her açılışta otomatik uygulanır (`drizzle-orm` migrator, `packages/db/drizzle`). Kapatmak için `DB_AUTO_MIGRATE=0`.

## 3. Hatırlatma cron'u

**+ New → Empty Service** → Settings → **Cron Schedule**: `0 * * * *` (saatte bir). Start command:

```bash
curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://getpartile.com/api/cron/hatirlatma
```

Bu servise `CRON_SECRET`'ı web ile aynı ver. Kural: 1 hafta önce “katılımını bildir” (davetli + belki), 2 saat önce “2 saat kaldı” (geliyor); plan başına bir kez.

## 4. İlk açılış kontrolü

- `https://getpartile.com/api/saglik` → `{"ok":true}`.
- `/giris` ile kendi e-postana kod gönder (Resend'de log görünür).
- Bir plan yayınla, WhatsApp'ta linki at: kart `/e/{kod}/opengraph-image` ile gelir.
- Volume'un çalıştığını görmek için bir afiş yükle, yeniden deploy sonrası hâlâ açılıyor olmalı.

## 5. Sonraki deploy'lar

`main`'e push → Railway otomatik build. Şema değişikliğinde `pnpm --filter @partile/db generate` ile migrasyon dosyasını commit'le; açılışta uygulanır. Geri alma: Railway → Deployments → önceki sürüme **Rollback** (DB migrasyonları geri alınmaz; şema değişiklikleri geriye uyumlu tutulmalı).

## Yerelde imajı denemek (Docker varsa)

```bash
docker build -t partile . && docker run --rm -p 3000:3000 -e AUTH_SECRET=dev -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 partile
```

`DATABASE_URL` verilmezse imaj PGlite kullanmaz (dist dosyaları imajda yok); yerel deneme için bir Postgres bağla: `-e DATABASE_URL=postgres://…`.
