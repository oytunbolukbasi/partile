# partile

Türkiye için davetiye + katılım ürünü — **getpartile.com**. Proje bağlamı için `CLAUDE.md`, ekran listesi için `research/MVP_EKRAN_ENVANTERI.md`.

## Geliştirme

```bash
corepack enable          # pnpm'i etkinleştirir (bir kez)
pnpm install
pnpm dev                 # apps/web → http://localhost:3000
pnpm build
pnpm typecheck
```

## Yapı

| Yol | Ne |
|---|---|
| `apps/web` | Next.js 15 (App Router, Tailwind v4) — web uygulaması ve public sayfalar |
| `packages/ui-tokens` | Tasarım token'ları (TS + `tokens.css`): renkler, davetiye temaları, fontlar, köşe/boşluk |
| `packages/core` | Domain tipleri ve zod şemaları (plan, katılım, sorular, masraf), TR tarih/para formatları |
| `design/canvas` | Claude Design tuvalinin kaynağı (şablonlar + build script + yayınlanan artboard'lar) |
| `research` | MVP ekran envanteri, Partiful ham referansları |

Ortam değişkenleri: `apps/web/.env.example`.
