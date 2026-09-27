# partile

Türkiye için davetiye + katılım ürünü — **https://getpartile.com**. “Plan yap, linki WhatsApp'ta at, kim geliyor gör.”

- Proje bağlamı, kararlar, kod haritası: [`CLAUDE.md`](CLAUDE.md)
- Ekranlar ve spesifikasyonlar: [`research/MVP_EKRAN_ENVANTERI.md`](research/MVP_EKRAN_ENVANTERI.md)
- Canlı altyapı (Railway, Neon, Resend, Cloudflare, cron): [`DEPLOY.md`](DEPLOY.md)

## Geliştirme

```bash
corepack pnpm install
cp apps/web/.env.example apps/web/.env         # DATABASE_URL boşsa yerel PGlite + örnek veri
corepack pnpm --filter @partile/web dev        # http://localhost:3000
corepack pnpm -r typecheck
corepack pnpm --filter @partile/core test
```

`DATABASE_URL` boşken veritabanı `./.data/partile` altında açılır; sıfırlamak için dev sunucusunu durdurup `rm -rf .data`. Giriş kodu canlı dışında ekranda görünür, Resend anahtarı gerekmez.

## Yapı

| Yol | Ne |
|---|---|
| `apps/web` | Next.js 15 (App Router, React 19, Tailwind v4): public sayfalar, uygulama, API uçları, server action'lar |
| `packages/db` | Drizzle şeması, Neon/PGlite istemcisi, okuma modelleri, yazma işlemleri, migrasyonlar, örnek veri |
| `packages/core` | Domain tipleri ve zod şemaları, TR tarih/para/link formatları |
| `packages/ui-tokens` | Tasarım token'ları: renkler, 8 davetiye teması, fontlar, köşe |
| `design/canvas` | Claude Design tuvalinin kaynağı (şablonlar, build script, yayınlanan artboard'lar) |
| `research` | MVP ekran envanteri, Partiful ham referansları (iç kullanım) |

## Deploy

`main`'e push → Railway otomatik build (kökteki `Dockerfile`). Ayrıntı: [DEPLOY.md](DEPLOY.md).
