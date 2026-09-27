# partile — Next.js (standalone) monorepo image for Railway.
# Build: pnpm workspace → next build (output: standalone). Run: node server.js on $PORT.

FROM node:22-alpine AS base
RUN corepack enable && apk add --no-cache libc6-compat
WORKDIR /app

# ---- deps (cached by lockfile) ----
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/web/package.json apps/web/
COPY packages/core/package.json packages/core/
COPY packages/ui-tokens/package.json packages/ui-tokens/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile

# ---- build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @partile/web build

# ---- runtime ----
FROM node:22-alpine AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
ENV DB_MIGRATIONS_DIR=/app/packages/db/drizzle UPLOAD_DIR=/data/uploads
WORKDIR /app
RUN addgroup -S partile && adduser -S partile -G partile && mkdir -p /data/uploads && chown -R partile:partile /data
# `pg` and `sharp` are loaded at runtime (server external packages) and are not reliably part of the traced
# standalone tree; installing them here also picks sharp's musl binary for this Alpine image.
RUN npm install --omit=dev --no-package-lock --no-audit --no-fund pg@8 sharp@0.34 && chown -R partile:partile /app
# Standalone server + static assets
COPY --from=build --chown=partile:partile /app/apps/web/.next/standalone ./
COPY --from=build --chown=partile:partile /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=partile:partile /app/apps/web/public ./apps/web/public
# SQL migrations applied at boot (drizzle-orm migrator reads the folder)
COPY --from=build --chown=partile:partile /app/packages/db/drizzle ./packages/db/drizzle
COPY --chown=partile:partile --chmod=755 start.sh ./start.sh
USER partile
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD wget -qO- http://127.0.0.1:${PORT}/api/saglik || exit 1
CMD ["/app/start.sh"]
